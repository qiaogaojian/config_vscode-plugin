/* istanbul ignore file */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodesmithProvider = void 0;
const url_json_rpc_provider_1 = require("./url-json-rpc-provider");
const logger_1 = require("@ethersproject/logger");
const _version_1 = require("./_version");
const logger = new logger_1.Logger(_version_1.version);
// Special API key provided by Nodesmith for ethers.js
const defaultApiKey = "ETHERS_JS_SHARED";
class NodesmithProvider extends url_json_rpc_provider_1.UrlJsonRpcProvider {
    static getApiKey(apiKey) {
        if (apiKey && typeof (apiKey) !== "string") {
            logger.throwArgumentError("invalid apiKey", "apiKey", apiKey);
        }
        return apiKey || defaultApiKey;
    }
    static getUrl(network, apiKey) {
        logger.warn("NodeSmith will be discontinued on 2019-12-20; please migrate to another platform.");
        let host = null;
        switch (network.name) {
            case "homestead":
                host = "https://ethereum.api.nodesmith.io/v1/mainnet/jsonrpc";
                break;
            case "ropsten":
                host = "https://ethereum.api.nodesmith.io/v1/ropsten/jsonrpc";
                break;
            case "rinkeby":
                host = "https://ethereum.api.nodesmith.io/v1/rinkeby/jsonrpc";
                break;
            case "goerli":
                host = "https://ethereum.api.nodesmith.io/v1/goerli/jsonrpc";
                break;
            case "kovan":
                host = "https://ethereum.api.nodesmith.io/v1/kovan/jsonrpc";
                break;
            default:
                logger.throwArgumentError("unsupported network", "network", arguments[0]);
        }
        return (host + "?apiKey=" + apiKey);
    }
}
exports.NodesmithProvider = NodesmithProvider;
//# sourceMappingURL=nodesmith-provider.js.map