"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Web3Provider = void 0;
const properties_1 = require("@ethersproject/properties");
const logger_1 = require("@ethersproject/logger");
const _version_1 = require("./_version");
const logger = new logger_1.Logger(_version_1.version);
const json_rpc_provider_1 = require("./json-rpc-provider");
let _nextId = 1;
function buildWeb3LegacyFetcher(provider, sendFunc) {
    const fetcher = "Web3LegacyFetcher";
    return function (method, params) {
        // Metamask complains about eth_sign (and on some versions hangs)
        if (method == "eth_sign" && (provider.isMetaMask || provider.isStatus)) {
            // https://github.com/ethereum/go-ethereum/wiki/Management-APIs#personal_sign
            method = "personal_sign";
            params = [params[1], params[0]];
        }
        const request = {
            method: method,
            params: params,
            id: (_nextId++),
            jsonrpc: "2.0"
        };
        return new Promise((resolve, reject) => {
            this.emit("debug", {
                action: "request",
                fetcher,
                request: properties_1.deepCopy(request),
                provider: this
            });
            sendFunc(request, (error, response) => {
                if (error) {
                    this.emit("debug", {
                        action: "response",
                        fetcher,
                        error,
                        request,
                        provider: this
                    });
                    return reject(error);
                }
                this.emit("debug", {
                    action: "response",
                    fetcher,
                    request,
                    response,
                    provider: this
                });
                if (response.error) {
                    const error = new Error(response.error.message);
                    error.code = response.error.code;
                    error.data = response.error.data;
                    return reject(error);
                }
                resolve(response.result);
            });
        });
    };
}
function buildEip1193Fetcher(provider) {
    return function (method, params) {
        if (params == null) {
            params = [];
        }
        // Metamask complains about eth_sign (and on some versions hangs)
        if (method == "eth_sign" && (provider.isMetaMask || provider.isStatus)) {
            // https://github.com/ethereum/go-ethereum/wiki/Management-APIs#personal_sign
            method = "personal_sign";
            params = [params[1], params[0]];
        }
        const request = { method, params };
        this.emit("debug", {
            action: "request",
            fetcher: "Eip1193Fetcher",
            request: properties_1.deepCopy(request),
            provider: this
        });
        return provider.request(request).then((response) => {
            this.emit("debug", {
                action: "response",
                fetcher: "Eip1193Fetcher",
                request,
                response,
                provider: this
            });
            return response;
        }, (error) => {
            this.emit("debug", {
                action: "response",
                fetcher: "Eip1193Fetcher",
                request,
                error,
                provider: this
            });
            throw error;
        });
    };
}
class Web3Provider extends json_rpc_provider_1.JsonRpcProvider {
    constructor(provider, network) {
        logger.checkNew(new.target, Web3Provider);
        if (provider == null) {
            logger.throwArgumentError("missing provider", "provider", provider);
        }
        let path = null;
        let jsonRpcFetchFunc = null;
        let subprovider = null;
        if (typeof (provider) === "function") {
            path = "unknown:";
            jsonRpcFetchFunc = provider;
        }
        else {
            path = provider.host || provider.path || "";
            if (!path && provider.isMetaMask) {
                path = "metamask";
            }
            subprovider = provider;
            if (provider.request) {
                if (path === "") {
                    path = "eip-1193:";
                }
                jsonRpcFetchFunc = buildEip1193Fetcher(provider);
            }
            else if (provider.sendAsync) {
                jsonRpcFetchFunc = buildWeb3LegacyFetcher(provider, provider.sendAsync.bind(provider));
            }
            else if (provider.send) {
                jsonRpcFetchFunc = buildWeb3LegacyFetcher(provider, provider.send.bind(provider));
            }
            else {
                logger.throwArgumentError("unsupported provider", "provider", provider);
            }
            if (!path) {
                path = "unknown:";
            }
        }
        super(path, network);
        properties_1.defineReadOnly(this, "jsonRpcFetchFunc", jsonRpcFetchFunc);
        properties_1.defineReadOnly(this, "provider", subprovider);
    }
    send(method, params) {
        return this.jsonRpcFetchFunc(method, params);
    }
}
exports.Web3Provider = Web3Provider;
//# sourceMappingURL=web3-provider.js.map