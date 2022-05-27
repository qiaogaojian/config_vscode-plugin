"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Web3ProviderModule = exports.profile = void 0;
const engine_1 = require("@remixproject/engine");
exports.profile = {
    name: "web3Provider",
    displayName: "Global Web3 Provider",
    description: "Represent the current web3 provider used by the app at global scope",
    methods: ["sendAsync", "setProvider", "getProvider", "disconnect"],
    version: "0.0.1",
    kind: "provider",
};
class Web3ProviderModule extends engine_1.Plugin {
    constructor() {
        super(exports.profile);
    }
    setProvider(provider) {
        console.log("SETTING PROVIDER", provider);
        this.web3Provider = provider;
    }
    getProvider() {
        return this.web3Provider;
    }
    disconnect() {
        try {
            delete this.web3Provider;
        }
        catch (e) {
            console.log(e);
        }
    }
    sendAsync(payload) {
        return new Promise((resolve, reject) => {
            if (!this.web3Provider)
                reject("no web3");
            this.web3Provider[this.web3Provider.sendAsync ? "sendAsync" : "send"](payload, (error, message) => {
                if (error)
                    return reject(error);
                resolve(message);
            });
        });
    }
}
exports.Web3ProviderModule = Web3ProviderModule;
//# sourceMappingURL=web3provider.js.map