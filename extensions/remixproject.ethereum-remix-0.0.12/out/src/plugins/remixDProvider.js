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
Object.defineProperty(exports, "__esModule", { value: true });
const engine_1 = require("@remixproject/engine");
const vscode_1 = require("vscode");
const remixd = require("@remix-project/remixd");
const http = require("http");
const profile = {
    name: "remixdprovider",
    displayName: "remixdprovider",
    description: "",
    icon: "assets/img/fileManager.webp",
    version: "0.0.1",
    methods: ["connect", "disconnect", "sendAsync", "debug"],
    events: [
        "connect",
        "disconnect",
        "displayUri",
        "accountsChanged",
        "chainChanged",
        "statusChanged",
    ],
    kind: "provider",
};
class RemixDProvider extends engine_1.Plugin {
    constructor() {
        super(profile);
        this.remixIdeUrl = "https://remix.ethereum.org/";
        this.ports = {
            git: 65521,
            folder: 65520,
        };
        this.sendAsync = (data) => {
            console.log(data);
            return new Promise((resolve, reject) => {
                if (this.provider) {
                    this.provider.sendAsync(data, (error, message) => {
                        if (error)
                            return reject(error);
                        resolve(message);
                    });
                }
                else {
                    return reject("Provider not loaded");
                }
            });
        };
        setInterval(this.getStatus, 5000, this);
    }
    createClient() {
        return __awaiter(this, void 0, void 0, function* () {
            this.sharedFolderClient = new remixd.services.sharedFolder();
            this.createProvider();
            this.services = {
                folder: () => {
                    this.sharedFolderClient.options.customApi = {};
                    return this.sharedFolderClient;
                },
            };
            this.sharedFolderClient
                .onload()
                .then((x) => __awaiter(this, void 0, void 0, function* () {
                console.log("LOADED");
                yield this.setProvider();
                yield this.getAccounts();
                this.status = "connected";
                this.emit("statusChanged", this.status);
            }))
                .catch((e) => __awaiter(this, void 0, void 0, function* () {
                console.log("ERROR CONNECTING", e);
                this.print(`Connect to Remix`);
            }));
        });
    }
    print(m) {
        this.call("terminal", "log", m);
    }
    testService(service) {
        return __awaiter(this, void 0, void 0, function* () {
            //console.log("testing ", service)
            return new Promise((resolve, reject) => {
                let server = http.createServer((request, response) => {
                    console.log((new Date()) + ' Received request for ' + request.url);
                    response.writeHead(404);
                    response.end();
                });
                server.on('error', (e) => {
                    reject(e);
                });
                const loopback = '127.0.0.1';
                server.listen(this.ports[service], loopback, () => {
                    server.close();
                    resolve(true);
                });
            });
        });
    }
    startService(service, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            this.print(`starting service on ${this.remixIdeUrl}`);
            try {
                this.socket = new remixd.Websocket(this.ports[service], { remixIdeUrl: this.remixIdeUrl }, () => this.services[service]());
                this.socket.start(callback);
                console.log("socket ", this.socket);
            }
            catch (e) {
                //console.log("remixd error")
                console.error(e);
            }
        });
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("START");
            yield this.createClient();
            const currentFolder = vscode_1.workspace.workspaceFolders[0].uri.fsPath;
            if (this.status == "connected") {
                yield this.setProvider();
                return;
            }
            this.startService("folder", (ws, client) => __awaiter(this, void 0, void 0, function* () {
                const self = this;
                console.log("START SERVICE", client);
                client.setWebSocket(ws);
                client.sharedFolder(currentFolder, false);
                client.setupNotifications(currentFolder);
                client.websocket.onclose = function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        self.print("Connection to Remix is closed now.");
                        yield self.disconnect();
                    });
                };
                this.print(`Connected to Remix`);
                //await this.createProvider();
                //this.status = "connected";
                //this.emit("statusChanged", this.status);
            }));
            this.print(`Connecting to Remix ... please go to ${this.remixIdeUrl} to connect to localhost in the File Explorer.`);
        });
    }
    createProvider() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("create provider");
            let self = this;
            this.provider = {
                sendAsync(payload, callback) {
                    return __awaiter(this, void 0, void 0, function* () {
                        try {
                            const result = yield self.sharedFolderClient.call("web3Provider", "sendAsync", payload);
                            callback(null, result);
                        }
                        catch (e) {
                            callback(e);
                        }
                    });
                },
            };
        });
    }
    setProvider() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("set provider");
            yield this.call("web3Provider", "setProvider", this.provider);
            //
            //await this.getAccounts();
            yield this.setListeners();
        });
    }
    getAccounts() {
        return __awaiter(this, void 0, void 0, function* () {
            this.print("Getting accounts");
            this.call("udapp", "getAccounts");
        });
    }
    setListeners() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    connect(network) {
        return __awaiter(this, void 0, void 0, function* () {
            if (network && network !== this.remixIdeUrl) {
                yield this.disconnect();
                this.remixIdeUrl = network;
            }
            try {
                yield this.testService("folder");
                yield this.start();
            }
            catch (e) {
                console.log("server error: ", e);
                if (e.code === 'EADDRINUSE') {
                    vscode_1.window.showErrorMessage("There is already a remixd client running on this port!");
                    this.print("There is already a remixd client running on this port!");
                }
                else {
                    vscode_1.window.showErrorMessage("An error has occured.");
                }
            }
            //await this.start();
            //await this.createProvider();
            //this.emit("connect")
        });
    }
    getStatus(self) {
        return __awaiter(this, void 0, void 0, function* () {
            if (self.status === "connected")
                return true;
            try {
                yield self.testService("folder");
                self.status = "disconnected";
                self.emit("statusChanged", self.status);
            }
            catch (e) {
                self.status = "waiting";
                self.emit("statusChanged", self.status);
            }
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("DISCONNECT");
            //await this.call("web3Provider", "disconnect");
            //console.log(this.sharedFolderClient.websocket);
            try {
                //await this.sharedFolderClient.call("manager", "deactivatePlugin", "remixd");
                this.socket.close();
            }
            catch (error) {
                //console.log(error);
            }
            this.print(`Disconnected`);
            this.emit("disconnect");
            this.status = "disconnected";
            this.emit("statusChanged", this.status);
        });
    }
    debug(hash) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.sharedFolderClient.call("manager", "activatePlugin", "debugger");
            yield this.sharedFolderClient.call("menuicons", "select", "debugger");
            yield this.sharedFolderClient.call("debugger", "debug", hash);
        });
    }
}
exports.default = RemixDProvider;
//# sourceMappingURL=remixDProvider.js.map