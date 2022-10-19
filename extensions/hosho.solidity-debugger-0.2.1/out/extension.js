"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const meadowTestsDebugConfigProvider_1 = require("./meadowTestsDebugConfigProvider");
const logger_1 = require("./logger");
const constants_1 = require("./constants");
const clrDebugConfigProvider_1 = require("./clrDebugConfigProvider");
const common = require("./common");
const solidityDebugConfigProvider_1 = require("./solidityDebugConfigProvider");
function activate(context) {
    logger_1.Logger.log("Extension activation.");
    common.setExtensionPath(context.extensionPath);
    /*
    vscode.debug.onDidChangeActiveDebugSession(e => {
        Logger.log("onDidChangeActiveDebugSession", e);
    });

    vscode.debug.onDidTerminateDebugSession(e => {
        Logger.log("onDidTerminateDebugSession", e);
    });

    vscode.debug.onDidReceiveDebugSessionCustomEvent(e => {
        Logger.log("custom event", e);
    });

    context.subscriptions.push(vscode.debug.onDidStartDebugSession(async (e) => {
        Logger.log("onDidStartDebugSession", e);
    }));
    */
    const solidityDebugProvider = new solidityDebugConfigProvider_1.SolidityDebugConfigProvider(context);
    context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider("solidity", solidityDebugProvider));
    context.subscriptions.push(solidityDebugProvider);
    // register a configuration provider for the debug type
    const meadowTestDebugProvider = new meadowTestsDebugConfigProvider_1.MeadowTestsDebugConfigProvider(context);
    context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider(constants_1.SOLIDITY_MEADOW_TYPE, meadowTestDebugProvider));
    context.subscriptions.push(meadowTestDebugProvider);
    // Register config provider for coreclr / omnisharp to hook in our solidity debugger.
    const coreClrProvider = new clrDebugConfigProvider_1.ClrDebugConfigProvider(context);
    context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider("coreclr", coreClrProvider));
}
exports.activate = activate;
function deactivate() {
    // nothing to do
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map