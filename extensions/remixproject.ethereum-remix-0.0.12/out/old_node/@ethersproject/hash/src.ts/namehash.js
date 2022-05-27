"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.namehash = exports.isValidName = void 0;
const bytes_1 = require("@ethersproject/bytes");
const strings_1 = require("@ethersproject/strings");
const keccak256_1 = require("@ethersproject/keccak256");
const logger_1 = require("@ethersproject/logger");
const _version_1 = require("./_version");
const logger = new logger_1.Logger(_version_1.version);
const Zeros = new Uint8Array(32);
Zeros.fill(0);
const Partition = new RegExp("^((.*)\\.)?([^.]+)$");
function isValidName(name) {
    try {
        const comps = name.split(".");
        for (let i = 0; i < comps.length; i++) {
            if (strings_1.nameprep(comps[i]).length === 0) {
                throw new Error("empty");
            }
        }
        return true;
    }
    catch (error) { }
    return false;
}
exports.isValidName = isValidName;
function namehash(name) {
    /* istanbul ignore if */
    if (typeof (name) !== "string") {
        logger.throwArgumentError("invalid ENS name; not a string", "name", name);
    }
    let current = name;
    let result = Zeros;
    while (current.length) {
        const partition = current.match(Partition);
        if (partition == null || partition[2] === "") {
            logger.throwArgumentError("invalid ENS address; missing component", "name", name);
        }
        const label = strings_1.toUtf8Bytes(strings_1.nameprep(partition[3]));
        result = keccak256_1.keccak256(bytes_1.concat([result, keccak256_1.keccak256(label)]));
        current = partition[2] || "";
    }
    return bytes_1.hexlify(result);
}
exports.namehash = namehash;
//# sourceMappingURL=namehash.js.map