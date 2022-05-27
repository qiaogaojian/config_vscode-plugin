"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sha256 = exports.keccak256 = exports.pack = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const bytes_1 = require("@ethersproject/bytes");
const keccak256_1 = require("@ethersproject/keccak256");
const sha2_1 = require("@ethersproject/sha2");
const strings_1 = require("@ethersproject/strings");
const regexBytes = new RegExp("^bytes([0-9]+)$");
const regexNumber = new RegExp("^(u?int)([0-9]*)$");
const regexArray = new RegExp("^(.*)\\[([0-9]*)\\]$");
const Zeros = "0000000000000000000000000000000000000000000000000000000000000000";
function _pack(type, value, isArray) {
    switch (type) {
        case "address":
            if (isArray) {
                return bytes_1.zeroPad(value, 32);
            }
            return bytes_1.arrayify(value);
        case "string":
            return strings_1.toUtf8Bytes(value);
        case "bytes":
            return bytes_1.arrayify(value);
        case "bool":
            value = (value ? "0x01" : "0x00");
            if (isArray) {
                return bytes_1.zeroPad(value, 32);
            }
            return bytes_1.arrayify(value);
    }
    let match = type.match(regexNumber);
    if (match) {
        //let signed = (match[1] === "int")
        let size = parseInt(match[2] || "256");
        if ((match[2] && String(size) !== match[2]) || (size % 8 !== 0) || size === 0 || size > 256) {
            throw new Error("invalid number type - " + type);
        }
        if (isArray) {
            size = 256;
        }
        value = bignumber_1.BigNumber.from(value).toTwos(size);
        return bytes_1.zeroPad(value, size / 8);
    }
    match = type.match(regexBytes);
    if (match) {
        const size = parseInt(match[1]);
        if (String(size) !== match[1] || size === 0 || size > 32) {
            throw new Error("invalid bytes type - " + type);
        }
        if (bytes_1.arrayify(value).byteLength !== size) {
            throw new Error("invalid value for " + type);
        }
        if (isArray) {
            return bytes_1.arrayify((value + Zeros).substring(0, 66));
        }
        return value;
    }
    match = type.match(regexArray);
    if (match && Array.isArray(value)) {
        const baseType = match[1];
        const count = parseInt(match[2] || String(value.length));
        if (count != value.length) {
            throw new Error("invalid value for " + type);
        }
        const result = [];
        value.forEach(function (value) {
            result.push(_pack(baseType, value, true));
        });
        return bytes_1.concat(result);
    }
    throw new Error("invalid type - " + type);
}
// @TODO: Array Enum
function pack(types, values) {
    if (types.length != values.length) {
        throw new Error("type/value count mismatch");
    }
    const tight = [];
    types.forEach(function (type, index) {
        tight.push(_pack(type, values[index]));
    });
    return bytes_1.hexlify(bytes_1.concat(tight));
}
exports.pack = pack;
function keccak256(types, values) {
    return keccak256_1.keccak256(pack(types, values));
}
exports.keccak256 = keccak256;
function sha256(types, values) {
    return sha2_1.sha256(pack(types, values));
}
exports.sha256 = sha256;
//# sourceMappingURL=index.js.map