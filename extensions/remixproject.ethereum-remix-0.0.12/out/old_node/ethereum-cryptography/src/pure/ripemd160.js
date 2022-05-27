"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ripemd160 = void 0;
const { ripemd160: Ripemd160 } = require("hash.js/lib/hash/ripemd");
const hash_utils_1 = require("../hash-utils");
exports.ripemd160 = hash_utils_1.createHashFunction(() => new Ripemd160());
//# sourceMappingURL=ripemd160.js.map