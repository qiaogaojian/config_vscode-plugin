"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const semver = require("semver");
const path = require("path");
const child_process = require("child_process");
const Logger_1 = require("./Logger");
let extensionPath;
function setExtensionPath(path) {
    extensionPath = path;
}
exports.setExtensionPath = setExtensionPath;
function getExtensionPath() {
    return extensionPath;
}
exports.getExtensionPath = getExtensionPath;
function getWorkspaceFolder() {
    let workspaceFolder;
    if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
        workspaceFolder = vscode.workspace.workspaceFolders[0];
    }
    else {
        throw new Error("bad workspace");
    }
    return workspaceFolder;
}
exports.getWorkspaceFolder = getWorkspaceFolder;
function validateDotnetVersion() {
    // ensure "dotnet" sdk of min version is installed, if not prompt to download link
    const minVersion = "2.1";
    const sdkDownloadLink = 'https://www.microsoft.com/net/download';
    let errorMessage;
    try {
        let dotnetVersionResult = child_process.execFileSync("dotnet", ["--version"], { encoding: 'utf8' });
        let dotnetVersionString = semver.coerce(dotnetVersionResult.trim());
        let dotnetVersionSatisfied = semver.gte(dotnetVersionString, semver.coerce(minVersion));
        if (!dotnetVersionSatisfied) {
            errorMessage = `Invalid dotnet version '${dotnetVersionString}' - must be ${minVersion} or greater.`;
        }
    }
    catch (err) {
        if (err.code === 'ENOENT') {
            errorMessage = `dotnet is not installed or could not be found in PATH.`;
        }
        else {
            errorMessage = (err instanceof Error) ? err.message : err.toString();
        }
    }
    if (errorMessage) {
        const downloadChoice = 'Download';
        vscode.window.showInformationMessage(`.NET Core SDK v${minVersion} or newer is required.`, downloadChoice).then(choice => {
            if (choice === downloadChoice) {
                vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(sdkDownloadLink));
            }
        });
        Logger_1.Logger.log(errorMessage);
        Logger_1.Logger.log(`Download .NET Core SDK from ${sdkDownloadLink}`);
        throw new Error(errorMessage);
    }
}
exports.validateDotnetVersion = validateDotnetVersion;
function expandConfigPath(workspaceDir, config, pathItems) {
    for (let pathProp of pathItems) {
        let pathItem = config[pathProp];
        if (pathItem && typeof pathItem === "string") {
            pathItem = pathItem.replace('${workspaceFolder}', workspaceDir);
            if (!path.isAbsolute(pathItem)) {
                pathItem = path.resolve(workspaceDir, pathItem);
            }
            else {
                pathItem = path.resolve(pathItem);
            }
            config[pathProp] = pathItem;
        }
    }
}
exports.expandConfigPath = expandConfigPath;
//# sourceMappingURL=common.js.map