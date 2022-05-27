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
exports.CloudflareProvider = void 0;
const url_json_rpc_provider_1 = require("./url-json-rpc-provider");
const logger_1 = require("@ethersproject/logger");
const _version_1 = require("./_version");
const logger = new logger_1.Logger(_version_1.version);
class CloudflareProvider extends url_json_rpc_provider_1.UrlJsonRpcProvider {
    static getApiKey(apiKey) {
        if (apiKey != null) {
            logger.throwArgumentError("apiKey not supported for cloudflare", "apiKey", apiKey);
        }
        return null;
    }
    static getUrl(network, apiKey) {
        let host = null;
        switch (network.name) {
            case "homestead":
                host = "https://cloudflare-eth.com/";
                break;
            default:
                logger.throwArgumentError("unsupported network", "network", arguments[0]);
        }
        return host;
    }
    perform(method, params) {
        const _super = Object.create(null, {
            perform: { get: () => super.perform }
        });
        return __awaiter(this, void 0, void 0, function* () {
            // The Cloudflare provider does not support eth_blockNumber,
            // so we get the latest block and pull it from that
            if (method === "getBlockNumber") {
                const block = yield _super.perform.call(this, "getBlock", { blockTag: "latest" });
                return block.number;
            }
            return _super.perform.call(this, method, params);
        });
    }
}
exports.CloudflareProvider = CloudflareProvider;
//# sourceMappingURL=cloudflare-provider.js.map