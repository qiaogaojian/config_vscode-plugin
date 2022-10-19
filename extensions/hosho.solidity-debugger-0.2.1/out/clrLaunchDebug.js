"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const child_process = require("child_process");
const util = require("util");
const constants_1 = require("./constants");
const logger_1 = require("./logger");
const common = require("./common");
async function launch(debugSessionID, debugConfig) {
    // let activeDebugSession = vscode.debug.activeDebugSession;
    // let responseTest = await e.customRequest("customRequestExample", { sessionID: debugSessionID });
    let envOpts = {
        [constants_1.DEBUG_SESSION_ID]: debugSessionID,
    };
    if (debugConfig.breakDebugServer) {
        envOpts["DEBUG_STOP_ON_ENTRY"] = "true";
    }
    const meadowDotnetDebugName = "Meadow: MSTest Runner";
    let testAssembly;
    if (debugConfig.testAssembly) {
        testAssembly = debugConfig.testAssembly;
    }
    else {
        let testAssemblies = await getDotnetTestAssemblies();
        if (testAssemblies.length > 1) {
            throw new Error("Multiple assemblies for testing found: " + testAssemblies.join("; "));
        }
        else if (testAssemblies.length === 0) {
            throw new Error("No assemblies found for testing");
        }
        testAssembly = testAssemblies[0];
    }
    logger_1.Logger.log(`Using dotnet test assembly: ${testAssembly}`);
    // TODO: run dotnet build before this
    if (debugConfig.disableUnitTestDebugging) {
        let externalOpts = {
            env: envOpts
        };
        child_process.execFile("dotnet", [testAssembly], externalOpts, (err, stdout, stderr) => {
            logger_1.Logger.log("dotnet test execution finished.");
        });
    }
    else {
        let workspaceFolder = common.getWorkspaceFolder();
        let unitTestRunnerDebugConfig = {
            name: meadowDotnetDebugName,
            type: "coreclr",
            request: "launch",
            program: testAssembly,
            cwd: workspaceFolder.uri.fsPath,
            env: envOpts,
            console: "internalConsole",
            internalConsoleOptions: "openOnSessionStart"
        };
        logger_1.Logger.log(`Launching dotnet debugger for: ${JSON.stringify(unitTestRunnerDebugConfig)}`);
        vscode.debug.startDebugging(workspaceFolder, unitTestRunnerDebugConfig);
    }
}
exports.launch = launch;
async function getDotnetTestAssemblies() {
    logger_1.Logger.log("Resolving dotnet test assemblies.");
    let workspaceFolder = common.getWorkspaceFolder();
    let dotnetTestResult;
    try {
        let testRunArgs = ["test", "-t", "-v=q"];
        let testRunOpts = { cwd: workspaceFolder.uri.fsPath };
        dotnetTestResult = await util.promisify(child_process.execFile)("dotnet", testRunArgs, testRunOpts);
        if (dotnetTestResult.stderr) {
            throw new Error(`Error when running dotnet test discovery: ${dotnetTestResult.stderr}`);
        }
    }
    catch (err) {
        throw err;
    }
    let testAssemblyRegex = /^Test run for (.+\.dll)\(.+\)/gm;
    let testAssemblies = [];
    let testAssemblyRegexMatch = null;
    do {
        testAssemblyRegexMatch = testAssemblyRegex.exec(dotnetTestResult.stdout);
        if (testAssemblyRegexMatch) {
            testAssemblies.push(testAssemblyRegexMatch[1]);
        }
    } while (testAssemblyRegexMatch);
    return testAssemblies;
}
//# sourceMappingURL=clrLaunchDebug.js.map