"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocket = void 0;
const logger_1 = require("@ethersproject/logger");
const _version_1 = require("./_version");
let WS = null;
exports.WebSocket = WS;
try {
    exports.WebSocket = WS = WebSocket;
    if (WS == null) {
        throw new Error("inject please");
    }
}
catch (error) {
    const logger = new logger_1.Logger(_version_1.version);
    exports.WebSocket = WS = function () {
        logger.throwError("WebSockets not supported in this environment", logger_1.Logger.errors.UNSUPPORTED_OPERATION, {
            operation: "new WebSocket()"
        });
    };
}
//# sourceMappingURL=browser-ws.js.map