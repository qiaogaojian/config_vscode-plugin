"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPrivateKeySync = exports.createPrivateKey = void 0;
const secp256k1_1 = require("secp256k1");
const random_1 = require("./random");
const SECP256K1_PRIVATE_KEY_SIZE = 32;
function createPrivateKey() {
    return __awaiter(this, void 0, void 0, function* () {
        while (true) {
            const pk = yield random_1.getRandomBytes(SECP256K1_PRIVATE_KEY_SIZE);
            if (secp256k1_1.privateKeyVerify(pk)) {
                return pk;
            }
        }
    });
}
exports.createPrivateKey = createPrivateKey;
function createPrivateKeySync() {
    while (true) {
        const pk = random_1.getRandomBytesSync(SECP256K1_PRIVATE_KEY_SIZE);
        if (secp256k1_1.privateKeyVerify(pk)) {
            return pk;
        }
    }
}
exports.createPrivateKeySync = createPrivateKeySync;
__exportStar(require("secp256k1"), exports);
//# sourceMappingURL=secp256k1.js.map