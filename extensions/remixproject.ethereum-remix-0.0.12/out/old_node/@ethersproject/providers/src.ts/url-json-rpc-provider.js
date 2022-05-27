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
exports.UrlJsonRpcProvider = exports.StaticJsonRpcProvider = void 0;
const properties_1 = require("@ethersproject/properties");
const logger_1 = require("@ethersproject/logger");
const _version_1 = require("./_version");
const logger = new logger_1.Logger(_version_1.version);
const json_rpc_provider_1 = require("./json-rpc-provider");
// A StaticJsonRpcProvider is useful when you *know* for certain that
// the backend will never change, as it never calls eth_chainId to
// verify its backend. However, if the backend does change, the effects
// are undefined and may include:
// - inconsistent results
// - locking up the UI
// - block skew warnings
// - wrong results
// If the network is not explicit (i.e. auto-detection is expected), the
// node MUST be running and available to respond to requests BEFORE this
// is instantiated.
class StaticJsonRpcProvider extends json_rpc_provider_1.JsonRpcProvider {
    detectNetwork() {
        const _super = Object.create(null, {
            detectNetwork: { get: () => super.detectNetwork }
        });
        return __awaiter(this, void 0, void 0, function* () {
            let network = this.network;
            if (network == null) {
                network = yield _super.detectNetwork.call(this);
                if (!network) {
                    logger.throwError("no network detected", logger_1.Logger.errors.UNKNOWN_ERROR, {});
                }
                // If still not set, set it
                if (this._network == null) {
                    // A static network does not support "any"
                    properties_1.defineReadOnly(this, "_network", network);
                    this.emit("network", network, null);
                }
            }
            return network;
        });
    }
}
exports.StaticJsonRpcProvider = StaticJsonRpcProvider;
class UrlJsonRpcProvider extends StaticJsonRpcProvider {
    constructor(network, apiKey) {
        logger.checkAbstract(new.target, UrlJsonRpcProvider);
        // Normalize the Network and API Key
        network = properties_1.getStatic((new.target), "getNetwork")(network);
        apiKey = properties_1.getStatic((new.target), "getApiKey")(apiKey);
        const connection = properties_1.getStatic((new.target), "getUrl")(network, apiKey);
        super(connection, network);
        if (typeof (apiKey) === "string") {
            properties_1.defineReadOnly(this, "apiKey", apiKey);
        }
        else if (apiKey != null) {
            Object.keys(apiKey).forEach((key) => {
                properties_1.defineReadOnly(this, key, apiKey[key]);
            });
        }
    }
    _startPending() {
        logger.warn("WARNING: API provider does not support pending filters");
    }
    isCommunityResource() {
        return false;
    }
    getSigner(address) {
        return logger.throwError("API provider does not support signing", logger_1.Logger.errors.UNSUPPORTED_OPERATION, { operation: "getSigner" });
    }
    listAccounts() {
        return Promise.resolve([]);
    }
    // Return a defaultApiKey if null, otherwise validate the API key
    static getApiKey(apiKey) {
        return apiKey;
    }
    // Returns the url or connection for the given network and API key. The
    // API key will have been sanitized by the getApiKey first, so any validation
    // or transformations can be done there.
    static getUrl(network, apiKey) {
        return logger.throwError("not implemented; sub-classes must override getUrl", logger_1.Logger.errors.NOT_IMPLEMENTED, {
            operation: "getUrl"
        });
    }
}
exports.UrlJsonRpcProvider = UrlJsonRpcProvider;
//# sourceMappingURL=url-json-rpc-provider.js.map