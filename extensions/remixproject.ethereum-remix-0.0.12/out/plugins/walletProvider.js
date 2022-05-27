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
const engine_1 = require("@remixproject/engine");
const web3_provider_1 = __importDefault(require("@walletconnect/web3-provider"));
const profile = {
    name: "walletconnect",
    displayName: "walletconnect",
    description: "",
    icon: "assets/img/fileManager.webp",
    version: "0.0.1",
    methods: ["connect", "disconnect", "sendAsync"],
    events: ["connect", "disconnect", "displayUri", "accountsChanged", "chainChanged"],
    kind: "provider",
};
class WalletConnect extends engine_1.Plugin {
    constructor() {
        super(profile);
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
    }
    createProvider() {
        return __awaiter(this, void 0, void 0, function* () {
            this.provider = new web3_provider_1.default({
                infuraId: "83d4d660ce3546299cbe048ed95b6fad",
                bridge: "https://wallet-connect-bridge.dyn.plugin.remixproject.org:8080",
                qrcode: false,
                clientMeta: {
                    description: "Remix Extension",
                    url: "https://remix.ethereum.org",
                    icons: ["https://walletconnect.org/walletconnect-logo.png"],
                    name: "Remix Extension",
                },
            });
            yield this.call("web3Provider", "setProvider", this.provider);
            yield this.setListeners();
        });
    }
    setListeners() {
        return __awaiter(this, void 0, void 0, function* () {
            this.emit("disconnect");
            this.provider.connector.on("display_uri", (err, payload) => {
                const uri = payload.params[0];
                this.print(`Connect to wallet with URI: ${uri}`);
                this.call("vscodeudapp", "qr", uri);
            });
            // Subscribe to accounts change
            this.provider.on("accountsChanged", (accounts) => __awaiter(this, void 0, void 0, function* () {
                for (const account of accounts) {
                    this.print(`Wallet account : ${account}`);
                }
                //this.emit('accountsChanged', accounts || [])
                const acc = yield this.call("udapp", "getAccounts");
                this.emit('accountsChanged', acc);
                //this.call("walletconnect" as any, "dismiss");
                //this.provider.disconnect();
            }));
            // Subscribe to chainId change
            this.provider.on("chainChanged", (chainId) => {
                this.print(`Wallet chain changed : ${chainId}`);
                this.emit("chainChanged", chainId);
            });
            // Subscribe to session disconnection
            this.provider.on("disconnect", (code, reason) => {
                this.emit("disconnect");
                this.print(`Disconnected from wallet`);
                console.log(code, reason);
            });
        });
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.createProvider();
            this.provider.enable();
            this.print(`Connect to wallet`);
            //this.emit("connect")
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.call("web3Provider", "disconnect");
            this.print(`Disconnected from wallet`);
            this.emit("disconnect");
        });
    }
    // terminal printing
    print(m) {
        this.call("terminal", "log", m);
    }
}
exports.default = WalletConnect;
//# sourceMappingURL=walletProvider.js.map