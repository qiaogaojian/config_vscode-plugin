"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verify = exports.sign = exports.publicKeyTweakAdd = exports.privateKeyTweakAdd = exports.publicKeyConvert = exports.publicKeyVerify = exports.publicKeyCreate = exports.privateKeyVerify = void 0;
const secp256k1 = __importStar(require("secp256k1"));
function privateKeyVerify(privateKey) {
    return secp256k1.privateKeyVerify(privateKey);
}
exports.privateKeyVerify = privateKeyVerify;
function publicKeyCreate(privateKey, compressed = true) {
    return Buffer.from(secp256k1.publicKeyCreate(privateKey, compressed));
}
exports.publicKeyCreate = publicKeyCreate;
function publicKeyVerify(publicKey) {
    return secp256k1.publicKeyVerify(publicKey);
}
exports.publicKeyVerify = publicKeyVerify;
function publicKeyConvert(publicKey, compressed = true) {
    return Buffer.from(secp256k1.publicKeyConvert(publicKey, compressed));
}
exports.publicKeyConvert = publicKeyConvert;
function privateKeyTweakAdd(publicKey, tweak) {
    return Buffer.from(secp256k1.privateKeyTweakAdd(Buffer.from(publicKey), tweak));
}
exports.privateKeyTweakAdd = privateKeyTweakAdd;
function publicKeyTweakAdd(publicKey, tweak, compressed = true) {
    return Buffer.from(secp256k1.publicKeyTweakAdd(Buffer.from(publicKey), tweak, compressed));
}
exports.publicKeyTweakAdd = publicKeyTweakAdd;
function sign(message, privateKey) {
    const ret = secp256k1.ecdsaSign(message, privateKey);
    return { signature: Buffer.from(ret.signature), recovery: ret.recid };
}
exports.sign = sign;
function verify(message, signature, publicKey) {
    return secp256k1.ecdsaVerify(signature, message, publicKey);
}
exports.verify = verify;
//# sourceMappingURL=hdkey-secp256k1v3.js.map