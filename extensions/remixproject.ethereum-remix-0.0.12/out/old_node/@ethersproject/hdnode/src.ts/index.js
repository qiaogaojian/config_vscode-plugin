"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccountPath = exports.isValidMnemonic = exports.entropyToMnemonic = exports.mnemonicToEntropy = exports.mnemonicToSeed = exports.HDNode = exports.defaultPath = void 0;
const basex_1 = require("@ethersproject/basex");
const bytes_1 = require("@ethersproject/bytes");
const bignumber_1 = require("@ethersproject/bignumber");
const strings_1 = require("@ethersproject/strings");
const pbkdf2_1 = require("@ethersproject/pbkdf2");
const properties_1 = require("@ethersproject/properties");
const signing_key_1 = require("@ethersproject/signing-key");
const sha2_1 = require("@ethersproject/sha2");
const transactions_1 = require("@ethersproject/transactions");
const wordlists_1 = require("@ethersproject/wordlists");
const logger_1 = require("@ethersproject/logger");
const _version_1 = require("./_version");
const logger = new logger_1.Logger(_version_1.version);
const N = bignumber_1.BigNumber.from("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141");
// "Bitcoin seed"
const MasterSecret = strings_1.toUtf8Bytes("Bitcoin seed");
const HardenedBit = 0x80000000;
// Returns a byte with the MSB bits set
function getUpperMask(bits) {
    return ((1 << bits) - 1) << (8 - bits);
}
// Returns a byte with the LSB bits set
function getLowerMask(bits) {
    return (1 << bits) - 1;
}
function bytes32(value) {
    return bytes_1.hexZeroPad(bytes_1.hexlify(value), 32);
}
function base58check(data) {
    return basex_1.Base58.encode(bytes_1.concat([data, bytes_1.hexDataSlice(sha2_1.sha256(sha2_1.sha256(data)), 0, 4)]));
}
function getWordlist(wordlist) {
    if (wordlist == null) {
        return wordlists_1.wordlists["en"];
    }
    if (typeof (wordlist) === "string") {
        const words = wordlists_1.wordlists[wordlist];
        if (words == null) {
            logger.throwArgumentError("unknown locale", "wordlist", wordlist);
        }
        return words;
    }
    return wordlist;
}
const _constructorGuard = {};
exports.defaultPath = "m/44'/60'/0'/0/0";
;
class HDNode {
    /**
     *  This constructor should not be called directly.
     *
     *  Please use:
     *   - fromMnemonic
     *   - fromSeed
     */
    constructor(constructorGuard, privateKey, publicKey, parentFingerprint, chainCode, index, depth, mnemonicOrPath) {
        logger.checkNew(new.target, HDNode);
        /* istanbul ignore if */
        if (constructorGuard !== _constructorGuard) {
            throw new Error("HDNode constructor cannot be called directly");
        }
        if (privateKey) {
            const signingKey = new signing_key_1.SigningKey(privateKey);
            properties_1.defineReadOnly(this, "privateKey", signingKey.privateKey);
            properties_1.defineReadOnly(this, "publicKey", signingKey.compressedPublicKey);
        }
        else {
            properties_1.defineReadOnly(this, "privateKey", null);
            properties_1.defineReadOnly(this, "publicKey", bytes_1.hexlify(publicKey));
        }
        properties_1.defineReadOnly(this, "parentFingerprint", parentFingerprint);
        properties_1.defineReadOnly(this, "fingerprint", bytes_1.hexDataSlice(sha2_1.ripemd160(sha2_1.sha256(this.publicKey)), 0, 4));
        properties_1.defineReadOnly(this, "address", transactions_1.computeAddress(this.publicKey));
        properties_1.defineReadOnly(this, "chainCode", chainCode);
        properties_1.defineReadOnly(this, "index", index);
        properties_1.defineReadOnly(this, "depth", depth);
        if (mnemonicOrPath == null) {
            // From a source that does not preserve the path (e.g. extended keys)
            properties_1.defineReadOnly(this, "mnemonic", null);
            properties_1.defineReadOnly(this, "path", null);
        }
        else if (typeof (mnemonicOrPath) === "string") {
            // From a source that does not preserve the mnemonic (e.g. neutered)
            properties_1.defineReadOnly(this, "mnemonic", null);
            properties_1.defineReadOnly(this, "path", mnemonicOrPath);
        }
        else {
            // From a fully qualified source
            properties_1.defineReadOnly(this, "mnemonic", mnemonicOrPath);
            properties_1.defineReadOnly(this, "path", mnemonicOrPath.path);
        }
    }
    get extendedKey() {
        // We only support the mainnet values for now, but if anyone needs
        // testnet values, let me know. I believe current senitment is that
        // we should always use mainnet, and use BIP-44 to derive the network
        //   - Mainnet: public=0x0488B21E, private=0x0488ADE4
        //   - Testnet: public=0x043587CF, private=0x04358394
        if (this.depth >= 256) {
            throw new Error("Depth too large!");
        }
        return base58check(bytes_1.concat([
            ((this.privateKey != null) ? "0x0488ADE4" : "0x0488B21E"),
            bytes_1.hexlify(this.depth),
            this.parentFingerprint,
            bytes_1.hexZeroPad(bytes_1.hexlify(this.index), 4),
            this.chainCode,
            ((this.privateKey != null) ? bytes_1.concat(["0x00", this.privateKey]) : this.publicKey),
        ]));
    }
    neuter() {
        return new HDNode(_constructorGuard, null, this.publicKey, this.parentFingerprint, this.chainCode, this.index, this.depth, this.path);
    }
    _derive(index) {
        if (index > 0xffffffff) {
            throw new Error("invalid index - " + String(index));
        }
        // Base path
        let path = this.path;
        if (path) {
            path += "/" + (index & ~HardenedBit);
        }
        const data = new Uint8Array(37);
        if (index & HardenedBit) {
            if (!this.privateKey) {
                throw new Error("cannot derive child of neutered node");
            }
            // Data = 0x00 || ser_256(k_par)
            data.set(bytes_1.arrayify(this.privateKey), 1);
            // Hardened path
            if (path) {
                path += "'";
            }
        }
        else {
            // Data = ser_p(point(k_par))
            data.set(bytes_1.arrayify(this.publicKey));
        }
        // Data += ser_32(i)
        for (let i = 24; i >= 0; i -= 8) {
            data[33 + (i >> 3)] = ((index >> (24 - i)) & 0xff);
        }
        const I = bytes_1.arrayify(sha2_1.computeHmac(sha2_1.SupportedAlgorithm.sha512, this.chainCode, data));
        const IL = I.slice(0, 32);
        const IR = I.slice(32);
        // The private key
        let ki = null;
        // The public key
        let Ki = null;
        if (this.privateKey) {
            ki = bytes32(bignumber_1.BigNumber.from(IL).add(this.privateKey).mod(N));
        }
        else {
            const ek = new signing_key_1.SigningKey(bytes_1.hexlify(IL));
            Ki = ek._addPoint(this.publicKey);
        }
        let mnemonicOrPath = path;
        const srcMnemonic = this.mnemonic;
        if (srcMnemonic) {
            mnemonicOrPath = Object.freeze({
                phrase: srcMnemonic.phrase,
                path: path,
                locale: (srcMnemonic.locale || "en")
            });
        }
        return new HDNode(_constructorGuard, ki, Ki, this.fingerprint, bytes32(IR), index, this.depth + 1, mnemonicOrPath);
    }
    derivePath(path) {
        const components = path.split("/");
        if (components.length === 0 || (components[0] === "m" && this.depth !== 0)) {
            throw new Error("invalid path - " + path);
        }
        if (components[0] === "m") {
            components.shift();
        }
        let result = this;
        for (let i = 0; i < components.length; i++) {
            const component = components[i];
            if (component.match(/^[0-9]+'$/)) {
                const index = parseInt(component.substring(0, component.length - 1));
                if (index >= HardenedBit) {
                    throw new Error("invalid path index - " + component);
                }
                result = result._derive(HardenedBit + index);
            }
            else if (component.match(/^[0-9]+$/)) {
                const index = parseInt(component);
                if (index >= HardenedBit) {
                    throw new Error("invalid path index - " + component);
                }
                result = result._derive(index);
            }
            else {
                throw new Error("invalid path component - " + component);
            }
        }
        return result;
    }
    static _fromSeed(seed, mnemonic) {
        const seedArray = bytes_1.arrayify(seed);
        if (seedArray.length < 16 || seedArray.length > 64) {
            throw new Error("invalid seed");
        }
        const I = bytes_1.arrayify(sha2_1.computeHmac(sha2_1.SupportedAlgorithm.sha512, MasterSecret, seedArray));
        return new HDNode(_constructorGuard, bytes32(I.slice(0, 32)), null, "0x00000000", bytes32(I.slice(32)), 0, 0, mnemonic);
    }
    static fromMnemonic(mnemonic, password, wordlist) {
        // If a locale name was passed in, find the associated wordlist
        wordlist = getWordlist(wordlist);
        // Normalize the case and spacing in the mnemonic (throws if the mnemonic is invalid)
        mnemonic = entropyToMnemonic(mnemonicToEntropy(mnemonic, wordlist), wordlist);
        return HDNode._fromSeed(mnemonicToSeed(mnemonic, password), {
            phrase: mnemonic,
            path: "m",
            locale: wordlist.locale
        });
    }
    static fromSeed(seed) {
        return HDNode._fromSeed(seed, null);
    }
    static fromExtendedKey(extendedKey) {
        const bytes = basex_1.Base58.decode(extendedKey);
        if (bytes.length !== 82 || base58check(bytes.slice(0, 78)) !== extendedKey) {
            logger.throwArgumentError("invalid extended key", "extendedKey", "[REDACTED]");
        }
        const depth = bytes[4];
        const parentFingerprint = bytes_1.hexlify(bytes.slice(5, 9));
        const index = parseInt(bytes_1.hexlify(bytes.slice(9, 13)).substring(2), 16);
        const chainCode = bytes_1.hexlify(bytes.slice(13, 45));
        const key = bytes.slice(45, 78);
        switch (bytes_1.hexlify(bytes.slice(0, 4))) {
            // Public Key
            case "0x0488b21e":
            case "0x043587cf":
                return new HDNode(_constructorGuard, null, bytes_1.hexlify(key), parentFingerprint, chainCode, index, depth, null);
            // Private Key
            case "0x0488ade4":
            case "0x04358394 ":
                if (key[0] !== 0) {
                    break;
                }
                return new HDNode(_constructorGuard, bytes_1.hexlify(key.slice(1)), null, parentFingerprint, chainCode, index, depth, null);
        }
        return logger.throwArgumentError("invalid extended key", "extendedKey", "[REDACTED]");
    }
}
exports.HDNode = HDNode;
function mnemonicToSeed(mnemonic, password) {
    if (!password) {
        password = "";
    }
    const salt = strings_1.toUtf8Bytes("mnemonic" + password, strings_1.UnicodeNormalizationForm.NFKD);
    return pbkdf2_1.pbkdf2(strings_1.toUtf8Bytes(mnemonic, strings_1.UnicodeNormalizationForm.NFKD), salt, 2048, 64, "sha512");
}
exports.mnemonicToSeed = mnemonicToSeed;
function mnemonicToEntropy(mnemonic, wordlist) {
    wordlist = getWordlist(wordlist);
    logger.checkNormalize();
    const words = wordlist.split(mnemonic);
    if ((words.length % 3) !== 0) {
        throw new Error("invalid mnemonic");
    }
    const entropy = bytes_1.arrayify(new Uint8Array(Math.ceil(11 * words.length / 8)));
    let offset = 0;
    for (let i = 0; i < words.length; i++) {
        let index = wordlist.getWordIndex(words[i].normalize("NFKD"));
        if (index === -1) {
            throw new Error("invalid mnemonic");
        }
        for (let bit = 0; bit < 11; bit++) {
            if (index & (1 << (10 - bit))) {
                entropy[offset >> 3] |= (1 << (7 - (offset % 8)));
            }
            offset++;
        }
    }
    const entropyBits = 32 * words.length / 3;
    const checksumBits = words.length / 3;
    const checksumMask = getUpperMask(checksumBits);
    const checksum = bytes_1.arrayify(sha2_1.sha256(entropy.slice(0, entropyBits / 8)))[0] & checksumMask;
    if (checksum !== (entropy[entropy.length - 1] & checksumMask)) {
        throw new Error("invalid checksum");
    }
    return bytes_1.hexlify(entropy.slice(0, entropyBits / 8));
}
exports.mnemonicToEntropy = mnemonicToEntropy;
function entropyToMnemonic(entropy, wordlist) {
    wordlist = getWordlist(wordlist);
    entropy = bytes_1.arrayify(entropy);
    if ((entropy.length % 4) !== 0 || entropy.length < 16 || entropy.length > 32) {
        throw new Error("invalid entropy");
    }
    const indices = [0];
    let remainingBits = 11;
    for (let i = 0; i < entropy.length; i++) {
        // Consume the whole byte (with still more to go)
        if (remainingBits > 8) {
            indices[indices.length - 1] <<= 8;
            indices[indices.length - 1] |= entropy[i];
            remainingBits -= 8;
            // This byte will complete an 11-bit index
        }
        else {
            indices[indices.length - 1] <<= remainingBits;
            indices[indices.length - 1] |= entropy[i] >> (8 - remainingBits);
            // Start the next word
            indices.push(entropy[i] & getLowerMask(8 - remainingBits));
            remainingBits += 3;
        }
    }
    // Compute the checksum bits
    const checksumBits = entropy.length / 4;
    const checksum = bytes_1.arrayify(sha2_1.sha256(entropy))[0] & getUpperMask(checksumBits);
    // Shift the checksum into the word indices
    indices[indices.length - 1] <<= checksumBits;
    indices[indices.length - 1] |= (checksum >> (8 - checksumBits));
    return wordlist.join(indices.map((index) => wordlist.getWord(index)));
}
exports.entropyToMnemonic = entropyToMnemonic;
function isValidMnemonic(mnemonic, wordlist) {
    try {
        mnemonicToEntropy(mnemonic, wordlist);
        return true;
    }
    catch (error) { }
    return false;
}
exports.isValidMnemonic = isValidMnemonic;
function getAccountPath(index) {
    if (typeof (index) !== "number" || index < 0 || index >= HardenedBit || index % 1) {
        logger.throwArgumentError("invalid account index", "index", index);
    }
    return `m/44'/60'/${index}'/0/0`;
}
exports.getAccountPath = getAccountPath;
//# sourceMappingURL=index.js.map