"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfuraProvider = exports.InfuraWebSocketProvider = void 0;
const properties_1 = require("@ethersproject/properties");
const websocket_provider_1 = require("./websocket-provider");
const formatter_1 = require("./formatter");
const logger_1 = require("@ethersproject/logger");
const _version_1 = require("./_version");
const logger = new logger_1.Logger(_version_1.version);
const url_json_rpc_provider_1 = require("./url-json-rpc-provider");
const defaultProjectId = "84842078b09946638c03157f83405213";
class InfuraWebSocketProvider extends websocket_provider_1.WebSocketProvider {
    constructor(network, apiKey) {
        const provider = new InfuraProvider(network, apiKey);
        const connection = provider.connection;
        if (connection.password) {
            logger.throwError("INFURA WebSocket project secrets unsupported", logger_1.Logger.errors.UNSUPPORTED_OPERATION, {
                operation: "InfuraProvider.getWebSocketProvider()"
            });
        }
        const url = connection.url.replace(/^http/i, "ws").replace("/v3/", "/ws/v3/");
        super(url, network);
        properties_1.defineReadOnly(this, "apiKey", provider.projectId);
        properties_1.defineReadOnly(this, "projectId", provider.projectId);
        properties_1.defineReadOnly(this, "projectSecret", provider.projectSecret);
    }
    isCommunityResource() {
        return (this.projectId === defaultProjectId);
    }
}
exports.InfuraWebSocketProvider = InfuraWebSocketProvider;
class InfuraProvider extends url_json_rpc_provider_1.UrlJsonRpcProvider {
    static getWebSocketProvider(network, apiKey) {
        return new InfuraWebSocketProvider(network, apiKey);
    }
    static getApiKey(apiKey) {
        const apiKeyObj = {
            apiKey: defaultProjectId,
            projectId: defaultProjectId,
            projectSecret: null
        };
        if (apiKey == null) {
            return apiKeyObj;
        }
        if (typeof (apiKey) === "string") {
            apiKeyObj.projectId = apiKey;
        }
        else if (apiKey.projectSecret != null) {
            logger.assertArgument((typeof (apiKey.projectId) === "string"), "projectSecret requires a projectId", "projectId", apiKey.projectId);
            logger.assertArgument((typeof (apiKey.projectSecret) === "string"), "invalid projectSecret", "projectSecret", "[REDACTED]");
            apiKeyObj.projectId = apiKey.projectId;
            apiKeyObj.projectSecret = apiKey.projectSecret;
        }
        else if (apiKey.projectId) {
            apiKeyObj.projectId = apiKey.projectId;
        }
        apiKeyObj.apiKey = apiKeyObj.projectId;
        return apiKeyObj;
    }
    static getUrl(network, apiKey) {
        let host = null;
        switch (network ? network.name : "unknown") {
            case "homestead":
                host = "mainnet.infura.io";
                break;
            case "ropsten":
                host = "ropsten.infura.io";
                break;
            case "rinkeby":
                host = "rinkeby.infura.io";
                break;
            case "kovan":
                host = "kovan.infura.io";
                break;
            case "goerli":
                host = "goerli.infura.io";
                break;
            default:
                logger.throwError("unsupported network", logger_1.Logger.errors.INVALID_ARGUMENT, {
                    argument: "network",
                    value: network
                });
        }
        const connection = {
            allowGzip: true,
            url: ("https:/" + "/" + host + "/v3/" + apiKey.projectId),
            throttleCallback: (attempt, url) => {
                if (apiKey.projectId === defaultProjectId) {
                    formatter_1.showThrottleMessage();
                }
                return Promise.resolve(true);
            }
        };
        if (apiKey.projectSecret != null) {
            connection.user = "";
            connection.password = apiKey.projectSecret;
        }
        return connection;
    }
    isCommunityResource() {
        return (this.projectId === defaultProjectId);
    }
}
exports.InfuraProvider = InfuraProvider;
//# sourceMappingURL=infura-provider.js.map