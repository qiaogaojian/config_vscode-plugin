"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.keccak512 = exports.keccak384 = exports.keccak256 = exports.keccak224 = void 0;
const hash_utils_1 = require("./hash-utils");
const createKeccakHash = require("keccak");
exports.keccak224 = hash_utils_1.createHashFunction(() => createKeccakHash("keccak224"));
exports.keccak256 = hash_utils_1.createHashFunction(() => createKeccakHash("keccak256"));
exports.keccak384 = hash_utils_1.createHashFunction(() => createKeccakHash("keccak384"));
exports.keccak512 = hash_utils_1.createHashFunction(() => createKeccakHash("keccak512"));
//# sourceMappingURL=keccak.js.map