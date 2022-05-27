"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomBytes = void 0;
const bytes_1 = require("@ethersproject/bytes");
const logger_1 = require("@ethersproject/logger");
const _version_1 = require("./_version");
const logger = new logger_1.Logger(_version_1.version);
let anyGlobal = null;
try {
    anyGlobal = window;
    if (anyGlobal == null) {
        throw new Error("try next");
    }
}
catch (error) {
    try {
        anyGlobal = global;
        if (anyGlobal == null) {
            throw new Error("try next");
        }
    }
    catch (error) {
        anyGlobal = {};
    }
}
let crypto = anyGlobal.crypto || anyGlobal.msCrypto;
if (!crypto || !crypto.getRandomValues) {
    logger.warn("WARNING: Missing strong random number source");
    crypto = {
        getRandomValues: function (buffer) {
            return logger.throwError("no secure random source avaialble", logger_1.Logger.errors.UNSUPPORTED_OPERATION, {
                operation: "crypto.getRandomValues"
            });
        }
    };
}
function randomBytes(length) {
    if (length <= 0 || length > 1024 || (length % 1)) {
        logger.throwArgumentError("invalid length", "length", length);
    }
    const result = new Uint8Array(length);
    crypto.getRandomValues(result);
    return bytes_1.arrayify(result);
}
exports.randomBytes = randomBytes;
;
//# sourceMappingURL=browser-random.js.map