"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computePublicKey = exports.recoverPublicKey = exports.SigningKey = void 0;
const elliptic_1 = require("./elliptic");
const bytes_1 = require("@ethersproject/bytes");
const properties_1 = require("@ethersproject/properties");
const logger_1 = require("@ethersproject/logger");
const _version_1 = require("./_version");
const logger = new logger_1.Logger(_version_1.version);
let _curve = null;
function getCurve() {
    if (!_curve) {
        _curve = new elliptic_1.EC("secp256k1");
    }
    return _curve;
}
class SigningKey {
    constructor(privateKey) {
        properties_1.defineReadOnly(this, "curve", "secp256k1");
        properties_1.defineReadOnly(this, "privateKey", bytes_1.hexlify(privateKey));
        const keyPair = getCurve().keyFromPrivate(bytes_1.arrayify(this.privateKey));
        properties_1.defineReadOnly(this, "publicKey", "0x" + keyPair.getPublic(false, "hex"));
        properties_1.defineReadOnly(this, "compressedPublicKey", "0x" + keyPair.getPublic(true, "hex"));
        properties_1.defineReadOnly(this, "_isSigningKey", true);
    }
    _addPoint(other) {
        const p0 = getCurve().keyFromPublic(bytes_1.arrayify(this.publicKey));
        const p1 = getCurve().keyFromPublic(bytes_1.arrayify(other));
        return "0x" + p0.pub.add(p1.pub).encodeCompressed("hex");
    }
    signDigest(digest) {
        const keyPair = getCurve().keyFromPrivate(bytes_1.arrayify(this.privateKey));
        const digestBytes = bytes_1.arrayify(digest);
        if (digestBytes.length !== 32) {
            logger.throwArgumentError("bad digest length", "digest", digest);
        }
        const signature = keyPair.sign(digestBytes, { canonical: true });
        return bytes_1.splitSignature({
            recoveryParam: signature.recoveryParam,
            r: bytes_1.hexZeroPad("0x" + signature.r.toString(16), 32),
            s: bytes_1.hexZeroPad("0x" + signature.s.toString(16), 32),
        });
    }
    computeSharedSecret(otherKey) {
        const keyPair = getCurve().keyFromPrivate(bytes_1.arrayify(this.privateKey));
        const otherKeyPair = getCurve().keyFromPublic(bytes_1.arrayify(computePublicKey(otherKey)));
        return bytes_1.hexZeroPad("0x" + keyPair.derive(otherKeyPair.getPublic()).toString(16), 32);
    }
    static isSigningKey(value) {
        return !!(value && value._isSigningKey);
    }
}
exports.SigningKey = SigningKey;
function recoverPublicKey(digest, signature) {
    const sig = bytes_1.splitSignature(signature);
    const rs = { r: bytes_1.arrayify(sig.r), s: bytes_1.arrayify(sig.s) };
    return "0x" + getCurve().recoverPubKey(bytes_1.arrayify(digest), rs, sig.recoveryParam).encode("hex", false);
}
exports.recoverPublicKey = recoverPublicKey;
function computePublicKey(key, compressed) {
    const bytes = bytes_1.arrayify(key);
    if (bytes.length === 32) {
        const signingKey = new SigningKey(bytes);
        if (compressed) {
            return "0x" + getCurve().keyFromPrivate(bytes).getPublic(true, "hex");
        }
        return signingKey.publicKey;
    }
    else if (bytes.length === 33) {
        if (compressed) {
            return bytes_1.hexlify(bytes);
        }
        return "0x" + getCurve().keyFromPublic(bytes).getPublic(false, "hex");
    }
    else if (bytes.length === 65) {
        if (!compressed) {
            return bytes_1.hexlify(bytes);
        }
        return "0x" + getCurve().keyFromPublic(bytes).getPublic(true, "hex");
    }
    return logger.throwArgumentError("invalid public or private key", "key", "[REDACTED]");
}
exports.computePublicKey = computePublicKey;
//# sourceMappingURL=index.js.map