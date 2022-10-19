"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid = require("uuid/v1");
const dotnetLaunchDebug = require("./clrLaunchDebug");
const logger_1 = require("./logger");
const constants_1 = require("./constants");
const meadowDebugAdapter_1 = require("./meadowDebugAdapter");
const common = require("./common");
class MeadowTestsDebugConfigProvider {
    constructor(context) {
        this._context = context;
    }
    // Notice: this is working in latest stable vscode but is preview.
    provideDebugAdapter(session, folder, executable, config, token) {
        let debugSessionID;
        if (config[constants_1.DEBUG_SESSION_ID]) {
            debugSessionID = config[constants_1.DEBUG_SESSION_ID];
        }
        else {
            // If the debug session ID is not already set then the CLR debugger has not been launched
            // so we will launch it.
            debugSessionID = uuid();
            dotnetLaunchDebug.launch(debugSessionID, config).catch(err => logger_1.Logger.log("Error launching dotnet test", err));
        }
        return meadowDebugAdapter_1.resolveMeadowDebugAdapter(this._context, debugSessionID, config);
    }
    provideDebugConfigurations(folder, token) {
        let configs = [
            {
                type: constants_1.SOLIDITY_MEADOW_TYPE,
                request: "launch",
                name: "Debug Solidity (via unit test run)"
            }, {
                type: constants_1.SOLIDITY_MEADOW_TYPE,
                request: "launch",
                withoutSolidityDebugging: true,
                name: "Debug Unit Tests (without Solidity debugging)"
            }
        ];
        return configs;
    }
    /**
     * Massage a debug configuration just before a debug session is being launched,
     * e.g. add all missing attributes to the debug configuration.
     */
    resolveDebugConfiguration(folder, config, token) {
        logger_1.Logger.log(`Resolving debug configuration: ${JSON.stringify(config)}`);
        let debugConfig = config;
        if (debugConfig.withoutSolidityDebugging) {
            // TODO: use "dotnet test" to find and built assembly,
            // then return coreclr launch config for program
            throw new Error("TODO..");
        }
        let workspaceRoot = common.getWorkspaceFolder().uri.fsPath;
        common.validateDotnetVersion();
        let checksReady = false;
        if (checksReady) {
            // TODO: ensure a main .csproj file exists, if not prompt to setup
            let workspaceHasCsproj = false;
            if (!workspaceHasCsproj) {
                throw new Error("TODO..");
            }
            // TODO: if .csproj file exists, check that it references Meadow.UnitTestTemplate package (need to have this reference solcodegen).
            //		 if it doesn't, prompt to install nuget package
            let projMeadowPackagesOkay = false;
            if (!projMeadowPackagesOkay) {
                throw new Error("TODO..");
            }
        }
        debugConfig.workspaceDirectory = workspaceRoot;
        let pathKeys = ['debugAdapterFile', 'testAssembly', 'logFile'];
        common.expandConfigPath(workspaceRoot, debugConfig, pathKeys);
        logger_1.Logger.log(`Using debug configuration: ${JSON.stringify(debugConfig)}`);
        return debugConfig;
    }
    dispose() {
        if (this._server) {
            this._server.close();
        }
    }
}
exports.MeadowTestsDebugConfigProvider = MeadowTestsDebugConfigProvider;
//# sourceMappingURL=meadowTestsDebugConfigProvider.js.map