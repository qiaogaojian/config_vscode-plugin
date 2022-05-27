"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sha256 = void 0;
const Sha256Hash = require("hash.js/lib/hash/sha/256");
const hash_utils_1 = require("../hash-utils");
exports.sha256 = hash_utils_1.createHashFunction(() => new Sha256Hash());
//# sourceMappingURL=sha256.js.map