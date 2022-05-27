"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeHmac = exports.sha512 = exports.sha256 = exports.ripemd160 = void 0;
const crypto_1 = require("crypto");
const bytes_1 = require("@ethersproject/bytes");
const types_1 = require("./types");
const logger_1 = require("@ethersproject/logger");
const _version_1 = require("./_version");
const logger = new logger_1.Logger(_version_1.version);
function ripemd160(data) {
    return "0x" + crypto_1.createHash("ripemd160").update(Buffer.from(bytes_1.arrayify(data))).digest("hex");
}
exports.ripemd160 = ripemd160;
function sha256(data) {
    return "0x" + crypto_1.createHash("sha256").update(Buffer.from(bytes_1.arrayify(data))).digest("hex");
}
exports.sha256 = sha256;
function sha512(data) {
    return "0x" + crypto_1.createHash("sha512").update(Buffer.from(bytes_1.arrayify(data))).digest("hex");
}
exports.sha512 = sha512;
function computeHmac(algorithm, key, data) {
    /* istanbul ignore if */
    if (!types_1.SupportedAlgorithm[algorithm]) {
        logger.throwError("unsupported algorithm - " + algorithm, logger_1.Logger.errors.UNSUPPORTED_OPERATION, {
            operation: "computeHmac",
            algorithm: algorithm
        });
    }
    return "0x" + crypto_1.createHmac(algorithm, Buffer.from(bytes_1.arrayify(key))).update(Buffer.from(bytes_1.arrayify(data))).digest("hex");
}
exports.computeHmac = computeHmac;
//# sourceMappingURL=sha2.js.map