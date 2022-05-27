"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ripemd160 = void 0;
const crypto_1 = __importDefault(require("crypto"));
const hash_utils_1 = require("./hash-utils");
exports.ripemd160 = hash_utils_1.createHashFunction(() => crypto_1.default.createHash("ripemd160"));
//# sourceMappingURL=ripemd160.js.map