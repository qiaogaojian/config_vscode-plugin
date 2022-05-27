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
exports.NetworkModule = exports.profile = void 0;
const engine_1 = require("@remixproject/engine");
const web3_1 = __importDefault(require("web3"));
exports.profile = {
    name: "network",
    description: "Manage the network (mainnet, ropsten, goerli...) and the provider (web3, vm, injected)",
    methods: [
        "getNetworkProvider",
        "getEndpoint",
        "detectNetwork",
        "addNetwork",
        "removeNetwork",
    ],
    version: "0.0.1",
    kind: "network",
};
// Network API has :
// - events: ['providerChanged']
// - methods: ['getNetworkProvider', 'getEndpoint', 'detectNetwork', 'addNetwork', 'removeNetwork']
class NetworkModule extends engine_1.Plugin {
    constructor() {
        super(exports.profile);
    }
    setListeners() {
        return __awaiter(this, void 0, void 0, function* () {
            // listen for plugins
            this.on("manager", "pluginActivated", yield this.addPluginProvider.bind(this));
            this.on("manager", "pluginDeactivated", yield this.removePluginProvider.bind(this));
        });
    }
    addPluginProvider(profile) {
        return __awaiter(this, void 0, void 0, function* () {
            if (profile.kind === "provider") {
                ((profile, app) => {
                    let web3Provider = {
                        sendAsync(payload, callback) {
                            return __awaiter(this, void 0, void 0, function* () {
                                try {
                                    const result = yield app.call(profile.name, "sendAsync", payload);
                                    callback(null, result);
                                }
                                catch (e) {
                                    callback(e);
                                }
                            });
                        },
                    };
                    this.call("web3Provider", "setProvider", web3Provider);
                    this.web3Provider = {
                        sendAsync(payload, callback) {
                            return __awaiter(this, void 0, void 0, function* () {
                                try {
                                    const result = yield app.call("web3Provider", "sendAsync", payload);
                                    callback(null, result);
                                }
                                catch (e) {
                                    callback(e);
                                }
                            });
                        },
                    };
                    this.web3 = new web3_1.default(this.web3Provider);
                    //app.blockchain.addProvider({ name: profile.displayName, provider: web3Provider })
                })(profile, this);
            }
        });
    }
    removePluginProvider(profile) {
        return __awaiter(this, void 0, void 0, function* () {
            if (profile.kind === "provider")
                this.web3Provider = null;
        });
    }
    /** Return the current network provider (web3, vm, injected) */
    getNetworkProvider() {
        return this.web3Provider;
    }
    /** Return the current network */
    detectNetwork() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.web3.eth.net.getId((err, id) => {
                console.log(id);
                this.networkName = null;
                if (err) {
                    this.print(`Could not detect network! Please connnect.`);
                    return;
                }
                // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-155.md
                else if (id === 1)
                    this.networkName = "Main";
                else if (id === 2)
                    this.networkName = "Morden (deprecated)";
                else if (id === 3)
                    this.networkName = "Ropsten";
                else if (id === 4)
                    this.networkName = "Rinkeby";
                else if (id === 5)
                    this.networkName = "Goerli";
                else if (id === 42)
                    this.networkName = "Kovan";
                else if (id === 1337)
                    this.networkName = "RemixVM";
                else
                    this.networkName = "a local or custom network";
                this.print(`Network is ${this.networkName}!`);
            });
            return { name: this.networkName };
        });
    }
    /** Return the url only if network provider is 'web3' */
    getEndpoint() { }
    /** Add a custom network to the list of available networks */
    addNetwork(network) {
        // { name, url }
        this.print(`Adding network ${network}`);
        let networkprovider = new web3_1.default.providers.HttpProvider(network);
        this.call("web3Provider", "setProvider", networkprovider);
    }
    /** Remove a network to the list of availble networks */
    removeNetwork(name) { }
    print(m) {
        this.call("terminal", "log", m);
    }
}
exports.NetworkModule = NetworkModule;
//# sourceMappingURL=network.js.map