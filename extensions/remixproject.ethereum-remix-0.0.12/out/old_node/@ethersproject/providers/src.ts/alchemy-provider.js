"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlchemyProvider = exports.AlchemyWebSocketProvider = void 0;
const properties_1 = require("@ethersproject/properties");
const formatter_1 = require("./formatter");
const websocket_provider_1 = require("./websocket-provider");
const logger_1 = require("@ethersproject/logger");
const _version_1 = require("./_version");
const logger = new logger_1.Logger(_version_1.version);
const url_json_rpc_provider_1 = require("./url-json-rpc-provider");
// This key was provided to ethers.js by Alchemy to be used by the
// default provider, but it is recommended that for your own
// production environments, that you acquire your own API key at:
//   https://dashboard.alchemyapi.io
const defaultApiKey = "_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC";
class AlchemyWebSocketProvider extends websocket_provider_1.WebSocketProvider {
    constructor(network, apiKey) {
        const provider = new AlchemyProvider(network, apiKey);
        const url = provider.connection.url.replace(/^http/i, "ws")
            .replace(".alchemyapi.", ".ws.alchemyapi.");
        super(url, provider.network);
        properties_1.defineReadOnly(this, "apiKey", provider.apiKey);
    }
    isCommunityResource() {
        return (this.apiKey === defaultApiKey);
    }
}
exports.AlchemyWebSocketProvider = AlchemyWebSocketProvider;
class AlchemyProvider extends url_json_rpc_provider_1.UrlJsonRpcProvider {
    static getWebSocketProvider(network, apiKey) {
        return new AlchemyWebSocketProvider(network, apiKey);
    }
    static getApiKey(apiKey) {
        if (apiKey == null) {
            return defaultApiKey;
        }
        if (apiKey && typeof (apiKey) !== "string") {
            logger.throwArgumentError("invalid apiKey", "apiKey", apiKey);
        }
        return apiKey;
    }
    static getUrl(network, apiKey) {
        let host = null;
        switch (network.name) {
            case "homestead":
                host = "eth-mainnet.alchemyapi.io/v2/";
                break;
            case "ropsten":
                host = "eth-ropsten.alchemyapi.io/v2/";
                break;
            case "rinkeby":
                host = "eth-rinkeby.alchemyapi.io/v2/";
                break;
            case "goerli":
                host = "eth-goerli.alchemyapi.io/v2/";
                break;
            case "kovan":
                host = "eth-kovan.alchemyapi.io/v2/";
                break;
            default:
                logger.throwArgumentError("unsupported network", "network", arguments[0]);
        }
        return {
            allowGzip: true,
            url: ("https:/" + "/" + host + apiKey),
            throttleCallback: (attempt, url) => {
                if (apiKey === defaultApiKey) {
                    formatter_1.showThrottleMessage();
                }
                return Promise.resolve(true);
            }
        };
    }
    isCommunityResource() {
        return (this.apiKey === defaultApiKey);
    }
}
exports.AlchemyProvider = AlchemyProvider;
//# sourceMappingURL=alchemy-provider.js.map