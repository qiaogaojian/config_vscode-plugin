"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const constants_1 = require("./constants");
const uuid = require("uuid/v1");
const logger_1 = require("./logger");
const common = require("./common");
class ClrDebugConfigProvider {
    constructor(context) {
        this._context = context;
    }
    /**
     * Provides initial [debug configuration](#DebugConfiguration). If more than one debug configuration provider is
     * registered for the same type, debug configurations are concatenated in arbitrary order.
     *
     * @param folder The workspace folder for which the configurations are used or undefined for a folderless setup.
     * @param token A cancellation token.
     * @return An array of [debug configurations](#DebugConfiguration).
     */
    provideDebugConfigurations(folder, token) {
        // We have nothing to add here. Implemented to just fulfill the interface.
        return [];
    }
    /**
     * Resolves a [debug configuration](#DebugConfiguration) by filling in missing values or by adding/changing/removing attributes.
     * If more than one debug configuration provider is registered for the same type, the resolveDebugConfiguration calls are chained
     * in arbitrary order and the initial debug configuration is piped through the chain.
     * Returning the value 'undefined' prevents the debug session from starting.
     *
     * @param folder The workspace folder from which the configuration originates from or undefined for a folderless setup.
     * @param debugConfiguration The [debug configuration](#DebugConfiguration) to resolve.
     * @param token A cancellation token.
     * @return The resolved debug configuration or undefined.
     */
    resolveDebugConfiguration(folder, debugConfiguration, token) {
        // Check if the solidity debugger has already been launched and set the session ID
        if (debugConfiguration.env && debugConfiguration.env[constants_1.DEBUG_SESSION_ID]) {
            logger_1.Logger.log(`Clr debugger already setup with solidity debug session ID.`);
            return debugConfiguration;
        }
        let config = debugConfiguration;
        if (!config.env) {
            config.env = {};
        }
        let debugSessionID = uuid();
        config.env[constants_1.DEBUG_SESSION_ID] = debugSessionID;
        let workspaceFolder = common.getWorkspaceFolder();
        let solDebugConfig = {
            name: "Solidity Debugger",
            type: constants_1.SOLIDITY_MEADOW_TYPE,
            request: "launch",
            cwd: workspaceFolder.uri.fsPath,
            [constants_1.DEBUG_SESSION_ID]: debugSessionID
        };
        setTimeout(() => {
            (async () => {
                logger_1.Logger.log(`Launching solidity debugger for: ${JSON.stringify(solDebugConfig)}`);
                let startSolDebugResult = await vscode.debug.startDebugging(workspaceFolder, solDebugConfig);
                console.log("Sol debugger result: " + startSolDebugResult);
            })();
        }, 1);
        logger_1.Logger.log(`Using clr debug config with sol debug session ID ${JSON.stringify(config)}`);
        return config;
    }
}
exports.ClrDebugConfigProvider = ClrDebugConfigProvider;
//# sourceMappingURL=clrDebugConfigProvider.js.map