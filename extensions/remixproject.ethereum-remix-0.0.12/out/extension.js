"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode_1 = require("vscode");
const path_1 = require("@remixproject/engine-vscode/util/path");
const engine_1 = require("@remixproject/engine");
const engine_vscode_1 = require("@remixproject/engine-vscode");
const file_manager_1 = __importDefault(require("./plugins/file_manager"));
const rmxPlugins_1 = require("./rmxPlugins");
const native_solidity_plugin_1 = __importDefault(require("./plugins/native_solidity_plugin"));
const terminal_1 = __importDefault(require("./plugins/terminal"));
const udapp_1 = __importDefault(require("./plugins/udapp"));
const optionInputs_1 = require("./optionInputs");
const ext_api_plugin_1 = require("./plugins/ext_api_plugin");
const utils_1 = require("./utils");
const walletProvider_1 = __importDefault(require("./plugins/walletProvider"));
const web3provider_1 = require("./plugins/web3provider");
const remixDProvider_1 = __importDefault(require("./plugins/remixDProvider"));
const dGitProvider_1 = __importDefault(require("./plugins/dGitProvider"));
const semver_1 = __importDefault(require("semver"));
const core_plugin_1 = require("@remix-project/core-plugin");
const settings_1 = __importDefault(require("./plugins/settings"));
const network_1 = require("./plugins/network");
const path = require("path");
class VscodeManager extends engine_vscode_1.VscodeAppManager {
    onActivation() { }
}
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("CONTEXT 2", context);
        let selectedVersion = null;
        let compilerOpts = {
            language: "Solidity",
            optimize: false,
            runs: 200,
        };
        if (!vscode_1.workspace.workspaceFolders || !vscode_1.workspace.workspaceFolders[0]) {
            vscode_1.window.showErrorMessage("Please open a workspace or folder before using this extension.");
            return false;
        }
        const rmxPluginsProvider = new rmxPlugins_1.RmxPluginsProvider(vscode_1.workspace.workspaceFolders[0].uri.fsPath);
        const rmxControlsProvider = new rmxPlugins_1.RmxPluginsProvider(vscode_1.workspace.workspaceFolders[0].uri.fsPath);
        const editoropt = { language: "solidity", transformCmd: engine_vscode_1.transformCmd };
        const engine = new engine_1.Engine();
        const manager = new VscodeManager();
        const solpl = new native_solidity_plugin_1.default();
        const terminal = new terminal_1.default();
        const deployModule = new udapp_1.default();
        const web3Povider = new web3provider_1.Web3ProviderModule();
        const networkModule = new network_1.NetworkModule();
        const RemixD = new remixDProvider_1.default();
        const dgitprovider = new dGitProvider_1.default();
        const vscodeExtAPI = new ext_api_plugin_1.ExtAPIPlugin();
        const wallet = new walletProvider_1.default();
        const filemanager = new file_manager_1.default();
        const editorPlugin = new engine_vscode_1.EditorPlugin(editoropt);
        const settings = new settings_1.default();
        // compiler
        const importer = new core_plugin_1.CompilerImports();
        const artefacts = new core_plugin_1.CompilerArtefacts();
        const fetchAndCompile = new core_plugin_1.FetchAndCompile();
        const offsetToLineColumnConverter = new core_plugin_1.OffsetToLineColumnConverter();
        const metadata = new core_plugin_1.CompilerMetadata();
        const themeURLs = {
            light: "https://remix-alpha.ethereum.org/assets/css/themes/remix-light_powaqg.css",
            dark: "https://remix.ethereum.org/assets/css/themes/remix-dark_tvx1s2.css",
        };
        const themeOpts = { urls: themeURLs };
        const theme = new engine_vscode_1.ThemePlugin(themeOpts);
        filemanager.setContext(context);
        settings.setContext(context);
        engine.setPluginOption = ({ name, kind }) => {
            if (kind === "provider")
                return { queueTimeout: 60000 * 2 };
            if (name === "udapp")
                return { queueTimeout: 60000 * 2 };
            if (name === "LearnEth")
                return { queueTimeout: 60000 };
            return { queueTimeout: 10000 };
        };
        engine.register([
            manager,
            solpl,
            terminal,
            filemanager,
            editorPlugin,
            theme,
            web3Povider,
            deployModule,
            networkModule,
            wallet,
            vscodeExtAPI,
            RemixD,
            importer,
            artefacts,
            fetchAndCompile,
            offsetToLineColumnConverter,
            settings,
            metadata,
            dgitprovider
        ]);
        vscode_1.window.registerTreeDataProvider("rmxControls2", rmxControlsProvider);
        vscode_1.window.registerTreeDataProvider("rmxControls", rmxControlsProvider);
        vscode_1.window.registerTreeDataProvider("rmxPlugins", rmxPluginsProvider);
        yield manager.activatePlugin(["web3Provider", "udapp", "network"]);
        yield deployModule.setListeners();
        yield networkModule.setListeners();
        yield manager.activatePlugin([
            "walletconnect",
            "remixdprovider",
            "fileManager",
            "settings",
            "contentImport",
            "compilerArtefacts",
            "fetchAndCompile",
            "offsetToLineColumnConverter",
            'compilerMetadata',
        ]);
        // fetch default data from the plugins-directory filtered by engine
        let defaultPluginData = yield manager.registeredPluginData();
        let rmxControls = [
            {
                name: "vscodeudapp",
                displayName: "Run & Deploy",
                events: [],
                methods: ["displayUri"],
                version: "0.1.0",
                url: "https://vscoderemixudapp.web.app",
                //url: "http://localhost:3000",
                documentation: "https://github.com/bunsenstraat/remix-vscode-walletconnect",
                description: "Connect to a network to run and deploy.",
                icon: {
                    light: vscode_1.Uri.file(path.join(context.extensionPath, "resources/light", "deployAndRun.webp")),
                    dark: vscode_1.Uri.file(path.join(context.extensionPath, "resources/dark", "deployAndRun.webp"))
                },
                location: "sidePanel",
                targets: ["vscode"],
                targetVersion: {
                    vscode: ">=0.0.9",
                },
            },
            {
                name: "remixd",
                displayName: "Start remixd client",
                events: [],
                methods: [],
                version: "0.1.0",
                url: "",
                documentation: "",
                description: "Start a remixd client",
                icon: vscode_1.Uri.file(path.join(context.extensionPath, "resources", "redbutton.svg")),
                location: "sidePanel",
                targets: ["vscode"],
                targetVersion: {
                    vscode: ">=0.0.9",
                },
                options: {
                    Start: optionInputs_1.runCommand,
                    Stop: optionInputs_1.runCommand,
                },
                optionArgs: {
                    Start: "rmxPlugins.startRemixd",
                    Stop: "rmxPlugins.stopRemixd",
                },
            },
            {
                name: "solidityversion",
                displayName: "Set compiler version",
                events: [],
                methods: [],
                version: "0.1.0",
                url: "",
                description: "",
                icon: {
                    light: vscode_1.Uri.file(path.join(context.extensionPath, "resources/light", "solidity.webp")),
                    dark: vscode_1.Uri.file(path.join(context.extensionPath, "resources/dark", "solidity.webp"))
                },
                location: "sidePanel",
                targets: ["vscode"],
                targetVersion: {
                    vscode: ">=0.0.9",
                },
                options: {
                    Select: optionInputs_1.runCommand,
                },
                optionArgs: {
                    Select: "rmxPlugins.versionSelector",
                },
            },
            {
                name: "compiler",
                displayName: "Compiler",
                events: [],
                methods: [],
                version: "0.1.0",
                url: "",
                description: "Compile contracts",
                icon: {
                    light: vscode_1.Uri.file(path.join(context.extensionPath, "resources/light", "solidity.webp")),
                    dark: vscode_1.Uri.file(path.join(context.extensionPath, "resources/dark", "solidity.webp"))
                },
                location: "sidePanel",
                targets: ["vscode"],
                targetVersion: {
                    vscode: ">=0.0.9",
                },
                options: {
                    Select: optionInputs_1.runCommand,
                },
                optionArgs: {
                    Select: "rmxPlugins.compileFiles",
                },
            },
            {
                name: "ipfs",
                displayName: "IPFS",
                events: [],
                methods: [],
                version: "0.1.0",
                url: "",
                description: "Publish to IPFS",
                icon: {
                    light: vscode_1.Uri.file(path.join(context.extensionPath, "resources/light", "ipfs-logo.svg")),
                    dark: vscode_1.Uri.file(path.join(context.extensionPath, "resources/dark", "ipfs-logo.svg"))
                },
                location: "sidePanel",
                targets: ["vscode"],
                targetVersion: {
                    vscode: ">=0.0.11",
                },
                options: {
                    Select: optionInputs_1.runCommand,
                },
                optionArgs: {
                    Select: "rmxPlugins.push",
                },
            },
            {
                name: "debugger",
                displayName: "Debugger",
                events: [],
                methods: ['debug', 'getTrace'],
                version: "0.1.0",
                url: "https://debuggervscode.web.app/",
                documentation: "https://remix-ide.readthedocs.io/en/latest/debugger.html",
                description: "Transaction debugger",
                icon: {
                    light: vscode_1.Uri.file(path.join(context.extensionPath, "resources/light", "debugger.webp")),
                    dark: vscode_1.Uri.file(path.join(context.extensionPath, "resources/dark", "debugger.webp"))
                },
                location: "sidePanel",
                targets: ["vscode"],
                targetVersion: {
                    vscode: ">=0.0.9",
                },
            },
        ];
        rmxPluginsProvider.setDefaultData(defaultPluginData);
        rmxControlsProvider.setDefaultData(rmxControls);
        // compile
        vscode_1.commands.registerCommand("rmxPlugins.compileFiles", () => __awaiter(this, void 0, void 0, function* () {
            try {
                const files = filemanager.getOpenedFiles();
                const opts = Object.values(files)
                    .filter((x) => (path.extname(x) === ".sol" || path.extname(x) === ".yul"))
                    .map((v) => {
                    const vopt = {
                        label: v,
                        description: `Compile ${v}`,
                    };
                    return vopt;
                });
                vscode_1.window.showQuickPick(opts).then((selected) => __awaiter(this, void 0, void 0, function* () {
                    if (selected) {
                        yield manager.activatePlugin([
                            "solidity",
                            "fileManager",
                            "editor",
                            "contentImport",
                            "compilerArtefacts",
                        ]);
                        yield filemanager.switchFile(selected.label);
                        solpl.compile(selectedVersion, compilerOpts, selected.label);
                    }
                }));
            }
            catch (error) {
                console.log(error);
            }
        }));
        vscode_1.commands.registerCommand("rmxPlugins.compile", () => __awaiter(this, void 0, void 0, function* () {
            yield manager.activatePlugin([
                "solidity",
                "fileManager",
                "editor",
                "contentImport",
                "compilerArtefacts",
            ]);
            solpl.compile(selectedVersion, compilerOpts);
        }));
        vscode_1.commands.registerCommand("rmxPlugins.compile.solidity", () => __awaiter(this, void 0, void 0, function* () {
            yield manager.activatePlugin([
                "solidity",
                "terminal",
                "fileManager",
                "editor",
                "contentImport",
            ]);
            try {
                let solextension = vscode_1.extensions.getExtension("juanblanco.solidity");
                if (solextension.isActive) {
                    solpl.compileWithSolidityExtension();
                }
                else {
                    vscode_1.window.showErrorMessage("The Solidity extension is not enabled.");
                }
            }
            catch (e) {
                vscode_1.window.showErrorMessage("The Solidity extension is not installed.");
            }
        }));
        vscode_1.commands.registerCommand("rmxPlugins.push", () => __awaiter(this, void 0, void 0, function* () {
            yield manager.activatePlugin(['dGitProvider']);
            const cid = yield dgitprovider.push();
            console.log("pushed", cid);
        }));
        vscode_1.commands.registerCommand("rmxPlugins.clone", () => __awaiter(this, void 0, void 0, function* () {
            yield manager.activatePlugin(['dGitProvider']);
            const cid = yield dgitprovider.pull('');
        }));
        const checkSemver = (pluginData) => __awaiter(this, void 0, void 0, function* () {
            if (!(pluginData.targetVersion && pluginData.targetVersion.vscode))
                return true;
            return semver_1.default.satisfies(context.extension.packageJSON.version, pluginData.targetVersion.vscode);
        });
        const activatePlugin = (pluginId) => __awaiter(this, void 0, void 0, function* () {
            // Get plugininfo from plugin array
            const pluginData = utils_1.GetPluginData(pluginId, [...rmxPluginsProvider.getData(), ...rmxControlsProvider.getData()]);
            const versionCheck = yield checkSemver(pluginData);
            if (!versionCheck) {
                vscode_1.window.showErrorMessage(`This plugin requires an update of the extension. Please update now.`);
                return false;
            }
            // choose window column for display
            const cl = utils_1.ToViewColumn(pluginData);
            const plugin = new engine_vscode_1.WebviewPlugin(pluginData, { context, column: cl });
            if (!engine.isRegistered(pluginId)) {
                // @ts-ignore
                engine.register(plugin);
            }
            manager.activatePlugin([
                pluginId,
                "solidity",
                "fileManager",
                "editor",
                "vscodeExtAPI",
            ]);
            const profile = yield manager.getProfile(pluginId);
            vscode_1.window.showInformationMessage(`${profile.displayName} v${profile.version} activated.`);
        });
        vscode_1.commands.registerCommand("rmxPlugins.walletConnect", () => __awaiter(this, void 0, void 0, function* () {
            //await manager.activatePlugin(['walletconnect']);
            //await activatePlugin('qr')
            yield wallet.connect();
            //await web3Module.deploy()
        }));
        vscode_1.commands.registerCommand("rmxPlugins.testaction", () => __awaiter(this, void 0, void 0, function* () {
            //sharedFolderClient.call("fileManager",'getCurrentFile')
            //RemixD.connect(undefined)
            //let file = await filemanager.call('fileManager', 'getOpenedFiles')
            console.log("test");
            try {
                //await filemanager.call('fileManager', 'writeFile', 'deps/test/something/burp','burp')
                // filemanager.exists('deps/test/something/burp').then((x)=>{
                //   console.log(x)
                // })
                //importer.resolveAndSave('https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol','')
                //console.log(await filemanager.call('contentImport', 'resolveAndSave', '@openzeppelin/contracts/token/ERC1155/ERC1155.sol', ''))
                //console.log(await filemanager.call('solidity-logic', 'compile', 's.sol'))
                //importer.resolveAndSave('@openzeppelin/contracts/token/ERC1155/ERC1155.sol','')
                yield manager.activatePlugin(["solidity"]);
                console.log(yield solpl._setCompilerVersionFromPragma("s.sol"));
            }
            catch (e) {
                console.log(e);
            }
            return;
            console.log("test");
            for (let d of vscode_1.workspace.textDocuments) {
                console.log(path_1.relativePath(d.fileName));
            }
            //console.log(file)
        }));
        RemixD.on("remixdprovider", "statusChanged", (x) => {
            //console.log("STATUS CHANGE", x);
            const icons = {
                waiting: "yellowbutton.svg",
                connected: "greenbutton.svg",
                disconnected: "redbutton.svg",
            };
            rmxControlsProvider.setDataForPlugin("remixd", {
                icon: vscode_1.Uri.file(path.join(context.extensionPath, "resources", icons[x])),
                description: x,
            });
        });
        vscode_1.commands.registerCommand("rmxPlugins.startRemixd", () => __awaiter(this, void 0, void 0, function* () {
            RemixD.connect(undefined);
        }));
        vscode_1.commands.registerCommand("rmxPlugins.stopRemixd", () => __awaiter(this, void 0, void 0, function* () {
            RemixD.disconnect();
        }));
        vscode_1.commands.registerCommand("rmxPlugins.walletDisconnect", () => __awaiter(this, void 0, void 0, function* () {
            //await manager.activatePlugin(['walletconnect']);
            yield wallet.disconnect();
            //await web3Module.deploy()
        }));
        vscode_1.commands.registerCommand("rmxPlugins.deploy", () => __awaiter(this, void 0, void 0, function* () {
            // await wallet.connect();
            const contracts = Object.keys(deployModule.compiledContracts);
            const opts = contracts.map((v) => {
                const vopt = {
                    label: v,
                    description: `Deploy contract: ${v}`,
                };
                return vopt;
            });
            vscode_1.window.showQuickPick(opts).then((selected) => __awaiter(this, void 0, void 0, function* () {
                if (selected) {
                    yield deployModule.deploy(selected.label, []);
                }
            }));
        }));
        // activate plugin
        vscode_1.commands.registerCommand("extension.activateRmxPlugin", (pluginId) => __awaiter(this, void 0, void 0, function* () {
            yield activatePlugin(pluginId);
        }));
        vscode_1.commands.registerCommand("rmxPlugins.refreshEntry", () => {
            rmxPluginsProvider.refresh();
        });
        vscode_1.commands.registerCommand("rmxPlugins.addEntry", () => {
            const pluginjson = {
                name: "remix-plugin-example",
                displayName: "Remix plugin example",
                methods: [],
                version: "0.0.1-dev",
                url: "http://localhost:3000",
                description: "Run remix plugin in your Remix project",
                icon: "",
                location: "sidePanel",
            };
            const opts = {
                value: JSON.stringify(pluginjson),
                placeHolder: "Add your plugin JSON",
            };
            vscode_1.window.showInputBox(opts).then((input) => {
                if (input && input.length > 0) {
                    const devPlugin = JSON.parse(input);
                    rmxPluginsProvider.add(devPlugin);
                }
            });
        });
        vscode_1.commands.registerCommand("rmxPlugins.uninstallRmxPlugin", (pluginId) => __awaiter(this, void 0, void 0, function* () {
            vscode_1.commands.executeCommand("extension.deActivateRmxPlugin", pluginId);
            rmxPluginsProvider.remove(pluginId);
        }));
        vscode_1.commands.registerCommand("rmxPlugins.showPluginOptions", (plugin) => __awaiter(this, void 0, void 0, function* () {
            let id = "";
            if (plugin instanceof Object)
                id = plugin.id;
            else
                id = plugin;
            const pluginData = utils_1.GetPluginData(id, [...rmxPluginsProvider.getData(), ...rmxControlsProvider.getData()]);
            const options = pluginData.options || {
                Activate: optionInputs_1.pluginActivate,
                Deactivate: optionInputs_1.pluginDeactivate,
            };
            if (pluginData.documentation)
                options["Documentation"] = optionInputs_1.pluginDocumentation;
            if ((pluginData.targets && !pluginData.targets.includes("vscode")) ||
                !pluginData.targets)
                options["Uninstall"] = optionInputs_1.pluginUninstall;
            if (Object.keys(options).length == 1) {
                const args = (pluginData.optionArgs &&
                    pluginData.optionArgs[Object.keys(options)[0]]) ||
                    id;
                options[Object.keys(options)[0]](context, args);
            }
            else {
                const quickPick = vscode_1.window.createQuickPick();
                quickPick.items = Object.keys(options).map((label) => ({ label }));
                quickPick.onDidChangeSelection((selection) => {
                    const args = (pluginData.optionArgs &&
                        pluginData.optionArgs[selection[0].label]) ||
                        id;
                    if (selection[0]) {
                        options[selection[0].label](context, args).catch(console.error);
                    }
                });
                quickPick.onDidHide(() => quickPick.dispose());
                quickPick.show();
            }
        }));
        vscode_1.commands.registerCommand("extension.deActivateRmxPlugin", (pluginId) => __awaiter(this, void 0, void 0, function* () {
            manager.deactivatePlugin([pluginId]);
            editorPlugin.discardDecorations();
        }));
        // Version selector
        vscode_1.commands.registerCommand("rmxPlugins.versionSelector", () => __awaiter(this, void 0, void 0, function* () {
            try {
                yield manager.activatePlugin(["solidity"]);
                const versions = Object.assign({ 'latest': 'latest' }, solpl.getSolidityVersions());
                const opts = Object.keys(versions).map((v) => {
                    const vopt = {
                        label: v,
                        description: `Solidity ${v}`,
                    };
                    return vopt;
                });
                vscode_1.window.showQuickPick(opts).then((selected) => {
                    if (selected) {
                        selectedVersion = selected.label;
                        solpl.setVersion(selectedVersion);
                        rmxControlsProvider.setDataForPlugin("solidityversion", {
                            description: selectedVersion
                        });
                    }
                });
            }
            catch (error) {
                console.log(error);
            }
        }));
        // Optimizer selector
        vscode_1.commands.registerCommand("rmxPlugins.optimizerSelector", () => __awaiter(this, void 0, void 0, function* () {
            try {
                const opts = [
                    {
                        label: "Enable",
                        description: "Enable optimizer",
                    },
                    {
                        label: "Disable",
                        description: "Disable optimizer",
                    },
                ];
                vscode_1.window.showQuickPick(opts).then((selected) => {
                    if (selected) {
                        compilerOpts.optimize = Boolean(selected.label === "Enable");
                    }
                });
            }
            catch (error) {
                console.log(error);
            }
        }));
        // Language selector
        vscode_1.commands.registerCommand("rmxPlugins.languageSelector", () => __awaiter(this, void 0, void 0, function* () {
            try {
                const opts = [
                    {
                        label: "Solidity",
                        description: "Enable Solidity language",
                    },
                    {
                        label: "Yul",
                        description: "Enable Yul language",
                    },
                ];
                vscode_1.window.showQuickPick(opts).then((selected) => {
                    if (selected) {
                        switch (selected.label) {
                            case "Solidity":
                                compilerOpts.language = "Solidity";
                                compilerOpts.optimize = false;
                                break;
                            case "Yul":
                                compilerOpts.language = "Yul";
                                compilerOpts.optimize = false;
                                break;
                            default:
                                compilerOpts.language = "Solidity";
                        }
                    }
                });
            }
            catch (error) {
                console.log(error);
            }
        }));
        vscode_1.commands.registerCommand("rmxPlugins.openDocumentation", (pluginId) => __awaiter(this, void 0, void 0, function* () {
            const pluginData = utils_1.GetPluginData(pluginId, rmxPluginsProvider.getData());
            if (pluginData.documentation)
                vscode_1.env.openExternal(vscode_1.Uri.parse(pluginData.documentation));
            else
                vscode_1.window.showWarningMessage(`Documentation not provided for ${pluginData.displayName}.`);
        }));
    });
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map