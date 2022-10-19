"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lockFile = require("lockfile");
const vscode = require("vscode");
const path = require("path");
const util = require("util");
const child_process = require("child_process");
const fs = require("fs");
const semver = require("semver");
const https = require("https");
const common = require("./common");
const logger_1 = require("./logger");
const TOOL_DIR = '.debugSolSourcesTool';
const LOCK_FILE = '.debugSolSourcesTool.lock';
const TOOL_PACKAGE_NAME = 'meadow.debugsolsources';
const NUGET_VERSION_URL = `https://api.nuget.org/v3-flatcontainer/${TOOL_PACKAGE_NAME}/index.json`;
const TOOL_EXECUTABLE_NAME = 'meadow-debugsol';
const FILE_LOCK_STALE_MS = 1 * 60 * 1000;
const FILE_LOCK_WAIT_MS = 5 * 60 * 1000;
function getToolDir() { return path.join(common.getExtensionPath(), TOOL_DIR); }
function getToolFilePath() { return path.join(common.getExtensionPath(), TOOL_DIR, TOOL_EXECUTABLE_NAME) + (process.platform === "win32" ? ".exe" : ""); }
function getLockFilePath() { return path.join(common.getExtensionPath(), LOCK_FILE); }
function isFileLocked() { return lockFile.checkSync(getLockFilePath(), { stale: FILE_LOCK_STALE_MS }); }
/** Ensures the tool package is installed and updated. */
async function update() {
    common.validateDotnetVersion();
    // Check if another process is already performing this update check.
    let isLocked = isFileLocked();
    if (isLocked) {
        logger_1.Logger.log("The debugger tool lock file is already locked. Waiting other process to complete.");
        await waitForReady();
        logger_1.Logger.log("Done waiting for other process debugger tool lock file.");
    }
    try {
        // System-wide lock so only one extension/vscode instance is checking and/or updating at once.
        await util.promisify(lockFile.lock)(getLockFilePath(), { wait: FILE_LOCK_WAIT_MS, stale: FILE_LOCK_STALE_MS });
        let installedVersion = await getInstalledToolVersion();
        if (!installedVersion) {
            // Tool is not installed so install it. 
            showInfo("Debugger tool is not installed. Installing now..");
            await installTool();
            showInfo("Debugger tool installed.");
        }
        else {
            let latestVersion = await getLatestToolVersion();
            let versionOkay = semver.gte(installedVersion, latestVersion);
            if (!versionOkay) {
                // Tool is installed but not update to date so update it.
                showInfo("Debugger tool is outdated. Updating now..");
                await updateTool();
                showInfo("Debugger tool updated.");
            }
            else {
                logger_1.Logger.log("Debugger tool is installed and up to date.");
            }
        }
    }
    catch (err) {
        showError(`Error during update check in for ${TOOL_PACKAGE_NAME}: ${err}`);
        throw err;
    }
    finally {
        // Always release the global file lock.
        await util.promisify(lockFile.unlock)(getLockFilePath());
    }
}
exports.update = update;
function showInfo(msg) {
    logger_1.Logger.log(msg);
    vscode.window.showInformationMessage(msg);
}
function showError(msg) {
    logger_1.Logger.log(msg);
    vscode.window.showErrorMessage(msg);
}
/** Queries nuget server to determine the latest stable version of the package. */
async function getLatestToolVersion() {
    let nugetQuery = await httpGet(NUGET_VERSION_URL);
    let packageInfoJson = JSON.parse(nugetQuery);
    let packageVersions = packageInfoJson['versions'];
    let ver;
    do {
        ver = packageVersions.pop();
    } 
    // Get latest version that is not a beta/preview as indicated by a '-beta' in the version string.
    while ((!ver || ver.includes('-')) && packageVersions.length > 0);
    if (!ver) {
        showError(`Error parsing package versions: ${nugetQuery}`);
        throw new Error(`Error parsing package versions: ${nugetQuery}`);
    }
    return ver;
}
/** Promise that returns the body (as a utf8 string) of a http get response. */
async function httpGet(url) {
    return new Promise((resolve, reject) => {
        https.get(url, response => {
            let body = '';
            response.setEncoding('utf8');
            response.on('data', d => body += d);
            response.on('end', () => resolve(body));
        }).on('error', err => reject(err));
    });
}
/** Performs a dotnet global tool install of the package. */
async function installTool() {
    let toolPath = getToolDir();
    try {
        await util.promisify(child_process.execFile)('dotnet', ['tool', 'install', TOOL_PACKAGE_NAME, '--tool-path', toolPath]);
    }
    catch (err) {
        let errMsg = (err instanceof Error) ? err.message : err.toString();
        showError(`Error installing ${TOOL_PACKAGE_NAME}: ${errMsg}`);
        throw err;
    }
}
/** Performs a dotnet global tool update of the package. */
async function updateTool() {
    let toolPath = getToolDir();
    try {
        await util.promisify(child_process.execFile)('dotnet', ['tool', 'update', TOOL_PACKAGE_NAME, '--tool-path', toolPath]);
    }
    catch (err) {
        let errMsg = (err instanceof Error) ? err.message : err.toString();
        showError(`Error updating ${TOOL_PACKAGE_NAME}: ${errMsg}`);
        throw err;
    }
    let toolExecutablePath = getToolFilePath();
    if (!fs.existsSync(toolExecutablePath)) {
        let errMsg = `Cannot find tool file at ${toolExecutablePath} after install.`;
        showError(errMsg);
        throw new Error(errMsg);
    }
}
/** Determines the version of the locally installed package. Returns null if not installed. */
async function getInstalledToolVersion() {
    let toolPath = getToolDir();
    if (!fs.existsSync(toolPath)) {
        fs.mkdirSync(toolPath);
    }
    try {
        let toolVerResult = await util.promisify(child_process.execFile)('dotnet', ['tool', 'list', '--tool-path', toolPath]);
        let toolVerLine = toolVerResult.stdout.split(/\r?\n/).find(line => line.startsWith(TOOL_PACKAGE_NAME));
        if (toolVerLine) {
            let lineParts = toolVerLine.match(/\S+/g) || [];
            let verString = lineParts[1];
            return verString;
        }
    }
    catch (err) {
        let errMsg = (err instanceof Error) ? err.message : err.toString();
        showError(`Error checking ${TOOL_PACKAGE_NAME} version: ${errMsg}`);
        throw err;
    }
    return null;
}
/** Waits for the system-wide file lock to be released. */
async function waitForReady() {
    let startTime = Date.now();
    let isLocked;
    do {
        isLocked = isFileLocked();
        if (isLocked) {
            await util.promisify(setTimeout)(100);
            if (Date.now() - startTime > FILE_LOCK_WAIT_MS) {
                let msg = "Update file lock did not complete in time.";
                showError(msg);
                throw new Error(msg);
            }
        }
    } while (isLocked);
}
/** Gets the full file path of the debug executable and if necessary waits for the package update and/or installation to complete. */
async function getDebugToolPath() {
    if (isFileLocked()) {
        showInfo("Debugger tool is updating..");
        await waitForReady();
    }
    let toolExecutablePath = getToolFilePath();
    // The debugger tool is still not installed. Prompt for retry.
    if (!fs.existsSync(toolExecutablePath)) {
        let optOK = 'Install';
        let optCancel = 'Cancel';
        let choice = await vscode.window.showInformationMessage('The Solidity debugger tool is not installed. Install now?', { modal: false }, { title: optOK, isCloseAffordance: false }, { title: optCancel, isCloseAffordance: true });
        if (choice && choice.title === optOK) {
            await update();
            return getDebugToolPath();
        }
        else {
            throw new Error("Debugger tool must be installed.");
        }
    }
    return toolExecutablePath;
}
exports.getDebugToolPath = getDebugToolPath;
//# sourceMappingURL=debugSolSourcesTool.js.map