"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const logger_1 = require("./logger");
const debugSolSourcesTool = require("./debugSolSourcesTool");
const common = require("./common");
class SolidityDebugConfigProvider {
    constructor(context) {
        this._context = context;
        // Check for updates to debugSolSources tool.
        debugSolSourcesTool.update().catch(err => {
            logger_1.Logger.log("Error running update on DebugSolSources tool:");
            logger_1.Logger.log(err);
        });
        this.handleProblemEvents();
        this.monitorSolDocuments();
    }
    monitorSolDocuments() {
        this._context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(e => {
            if (e && e.document.languageId === 'solidity' && !e.document.isClosed) {
                this._lastActiveDocument = e;
            }
        }));
    }
    getActiveSolidityDocument() {
        // First check if the direct active document is a solidity file.
        const editor = vscode.window.activeTextEditor;
        if (editor && editor.document.languageId === 'solidity') {
            return editor;
        }
        // Then check last active document.
        if (this._lastActiveDocument && !this._lastActiveDocument.document.isClosed) {
            logger_1.Logger.log("Using last active solidity document.");
            return this._lastActiveDocument;
        }
        // Then try iterating through open documents.
        for (let i = 0; i < vscode.window.visibleTextEditors.length; i++) {
            let e = vscode.window.visibleTextEditors[i];
            if (e.document.languageId === 'solidity' && !e.document.isClosed) {
                logger_1.Logger.log("Using first found solidity document.");
                return e;
            }
        }
    }
    handleProblemEvents() {
        this._context.subscriptions.push(vscode.debug.onDidReceiveDebugSessionCustomEvent(e => {
            if (e.session.type === 'solidity' && e.event === 'problemEvent' && e.body) {
                let msg = e.body.message;
                let err = e.body.exception;
                logger_1.Logger.log(err);
                logger_1.Logger.show();
                vscode.window.showErrorMessage(msg);
            }
        }));
    }
    // Notice: this is working in latest stable vscode but is preview.
    provideDebugAdapter(session, folder, executable, config, token) {
        return (async () => {
            let debugConfig = config;
            let args = [];
            if (debugConfig.workspaceDirectory) {
                args.push("--directory", debugConfig.workspaceDirectory);
            }
            if (debugConfig.entryPoint) {
                args.push("--entry", debugConfig.entryPoint);
            }
            if (debugConfig.singleFile) {
                args.push("--singleFile", debugConfig.singleFile);
            }
            let env = {};
            if (debugConfig.breakDebugAdapter) {
                env["DEBUG_STOP_ON_ENTRY"] = "true";
            }
            let launchInfo;
            if (debugConfig.debugAdapterFile) {
                args.unshift(debugConfig.debugAdapterFile);
                launchInfo = {
                    type: "executable",
                    command: "dotnet",
                    args: args,
                    env: env
                };
            }
            else {
                let debugAdapterFile = await debugSolSourcesTool.getDebugToolPath();
                launchInfo = {
                    type: "executable",
                    command: debugAdapterFile,
                    args: args,
                    env: env
                };
            }
            logger_1.Logger.log(`Launching debug adapter with: ${JSON.stringify(launchInfo)}`);
            return launchInfo;
        })();
    }
    provideDebugConfigurations(folder, token) {
        let configs = [
            {
                type: "solidity",
                request: "launch",
                name: "Debug Solidity"
            }
        ];
        return configs;
    }
    /**
     * Massage a debug configuration just before a debug session is being launched,
     * e.g. add all missing attributes to the debug configuration.
     */
    resolveDebugConfiguration(folder, config, token) {
        return (async () => {
            logger_1.Logger.log(`Resolving debug configuration: ${JSON.stringify(config)}`);
            common.validateDotnetVersion();
            let debugConfig = config;
            if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
                debugConfig.workspaceDirectory = vscode.workspace.workspaceFolders[0].uri.fsPath;
            }
            // if launch.json is missing or empty
            // setup for single file debugging
            if (!debugConfig.type && !debugConfig.request && !debugConfig.name) {
                const editor = this.getActiveSolidityDocument();
                if (!editor) {
                    throw new Error("No solidity document is open.");
                }
                if (editor.document.isUntitled) {
                    logger_1.Logger.log("Solidity document is not saved to file.");
                    throw new Error("Cannot debug a Solidity document that is not saved to file.");
                }
                if (editor.document.uri.scheme !== 'file') {
                    logger_1.Logger.log(`Unsupported solidity document file path: ${editor.document.uri}`);
                    throw new Error(`Cannot debug Solidity document with unsupported path scheme: ${editor.document.uri}`);
                }
                if (editor.document.isDirty) {
                    logger_1.Logger.log(`Saving file ${editor.document.uri.fsPath}`);
                    await editor.document.save();
                }
                debugConfig.type = 'solidity';
                debugConfig.name = 'Launch';
                debugConfig.request = 'launch';
                debugConfig.singleFile = editor.document.uri.fsPath;
            }
            if (debugConfig.workspaceDirectory) {
                let pathKeys = ['debugAdapterFile', 'testAssembly', 'logFile'];
                common.expandConfigPath(debugConfig.workspaceDirectory, debugConfig, pathKeys);
            }
            logger_1.Logger.log(`Using debug configuration: ${JSON.stringify(debugConfig)}`);
            return debugConfig;
        })();
    }
    dispose() {
    }
}
exports.SolidityDebugConfigProvider = SolidityDebugConfigProvider;
//# sourceMappingURL=solidityDebugConfigProvider.js.map