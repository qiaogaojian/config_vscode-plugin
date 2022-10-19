"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const logger_1 = require("./logger");
const constants_1 = require("./constants");
async function resolveMeadowDebugAdapter(context, debugSessionID, debugConfig) {
    logger_1.Logger.log("Resolving debug adapter execution info.");
    let debugServerFilePath;
    if (debugConfig && debugConfig.debugAdapterFile) {
        debugServerFilePath = debugConfig.debugAdapterFile;
        if (!fs.existsSync(debugServerFilePath)) {
            throw new Error(`The "debugAdapterFile" in launch.json does not exist at "${debugServerFilePath}`);
        }
    }
    else {
        debugServerFilePath = path.resolve(path.join(context.extensionPath, "out", "debug_adapter", "Meadow.DebugAdapterProxy.dll"));
        if (!fs.existsSync(debugServerFilePath)) {
            throw new Error(`The debug adapter proxy executable not found at "${debugServerFilePath}`);
        }
    }
    let args = [debugServerFilePath, "--vscode_debug"];
    if (debugConfig && debugConfig.logFile) {
        args.push("--log_file", debugConfig.logFile);
    }
    if (debugConfig && debugConfig.trace) {
        args.push("--trace");
    }
    if (debugConfig && debugConfig.breakDebugAdapter) {
        args.push("--attach_debugger");
    }
    args.push("--session", debugSessionID);
    let launchInfo = {
        type: "executable",
        command: "dotnet",
        args: args,
        env: { [constants_1.DEBUG_SESSION_ID]: debugSessionID }
    };
    logger_1.Logger.log(`Launching debug adapter with: ${JSON.stringify(launchInfo)}`);
    return launchInfo;
}
exports.resolveMeadowDebugAdapter = resolveMeadowDebugAdapter;
//# sourceMappingURL=meadowDebugAdapter.js.map