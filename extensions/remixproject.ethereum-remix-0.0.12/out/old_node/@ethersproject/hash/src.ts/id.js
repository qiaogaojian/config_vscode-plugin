"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.id = void 0;
const keccak256_1 = require("@ethersproject/keccak256");
const strings_1 = require("@ethersproject/strings");
function id(text) {
    return keccak256_1.keccak256(strings_1.toUtf8Bytes(text));
}
exports.id = id;
//# sourceMappingURL=id.js.map