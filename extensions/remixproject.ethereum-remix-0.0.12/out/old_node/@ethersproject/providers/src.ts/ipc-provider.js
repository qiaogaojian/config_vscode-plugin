"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IpcProvider = void 0;
const net_1 = require("net");
const properties_1 = require("@ethersproject/properties");
const logger_1 = require("@ethersproject/logger");
const _version_1 = require("./_version");
const logger = new logger_1.Logger(_version_1.version);
const json_rpc_provider_1 = require("./json-rpc-provider");
class IpcProvider extends json_rpc_provider_1.JsonRpcProvider {
    constructor(path, network) {
        logger.checkNew(new.target, IpcProvider);
        if (path == null) {
            logger.throwError("missing path", logger_1.Logger.errors.MISSING_ARGUMENT, { arg: "path" });
        }
        super("ipc://" + path, network);
        properties_1.defineReadOnly(this, "path", path);
    }
    // @TODO: Create a connection to the IPC path and use filters instead of polling for block
    send(method, params) {
        // This method is very simple right now. We create a new socket
        // connection each time, which may be slower, but the main
        // advantage we are aiming for now is security. This simplifies
        // multiplexing requests (since we do not need to multiplex).
        let payload = JSON.stringify({
            method: method,
            params: params,
            id: 42,
            jsonrpc: "2.0"
        });
        return new Promise((resolve, reject) => {
            let response = Buffer.alloc(0);
            let stream = net_1.connect(this.path);
            stream.on("data", (data) => {
                response = Buffer.concat([response, data]);
            });
            stream.on("end", () => {
                try {
                    resolve(JSON.parse(response.toString()).result);
                    // @TODO: Better pull apart the error
                    stream.destroy();
                }
                catch (error) {
                    reject(error);
                    stream.destroy();
                }
            });
            stream.on("error", (error) => {
                reject(error);
                stream.destroy();
            });
            stream.write(payload);
            stream.end();
        });
    }
}
exports.IpcProvider = IpcProvider;
//# sourceMappingURL=ipc-provider.js.map