"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decrypt = exports.CrowdsaleAccount = void 0;
const aes_js_1 = __importDefault(require("aes-js"));
const address_1 = require("@ethersproject/address");
const bytes_1 = require("@ethersproject/bytes");
const keccak256_1 = require("@ethersproject/keccak256");
const pbkdf2_1 = require("@ethersproject/pbkdf2");
const strings_1 = require("@ethersproject/strings");
const properties_1 = require("@ethersproject/properties");
const logger_1 = require("@ethersproject/logger");
const _version_1 = require("./_version");
const logger = new logger_1.Logger(_version_1.version);
const utils_1 = require("./utils");
class CrowdsaleAccount extends properties_1.Description {
    isCrowdsaleAccount(value) {
        return !!(value && value._isCrowdsaleAccount);
    }
}
exports.CrowdsaleAccount = CrowdsaleAccount;
// See: https://github.com/ethereum/pyethsaletool
function decrypt(json, password) {
    const data = JSON.parse(json);
    password = utils_1.getPassword(password);
    // Ethereum Address
    const ethaddr = address_1.getAddress(utils_1.searchPath(data, "ethaddr"));
    // Encrypted Seed
    const encseed = utils_1.looseArrayify(utils_1.searchPath(data, "encseed"));
    if (!encseed || (encseed.length % 16) !== 0) {
        logger.throwArgumentError("invalid encseed", "json", json);
    }
    const key = bytes_1.arrayify(pbkdf2_1.pbkdf2(password, password, 2000, 32, "sha256")).slice(0, 16);
    const iv = encseed.slice(0, 16);
    const encryptedSeed = encseed.slice(16);
    // Decrypt the seed
    const aesCbc = new aes_js_1.default.ModeOfOperation.cbc(key, iv);
    const seed = aes_js_1.default.padding.pkcs7.strip(bytes_1.arrayify(aesCbc.decrypt(encryptedSeed)));
    // This wallet format is weird... Convert the binary encoded hex to a string.
    let seedHex = "";
    for (let i = 0; i < seed.length; i++) {
        seedHex += String.fromCharCode(seed[i]);
    }
    const seedHexBytes = strings_1.toUtf8Bytes(seedHex);
    const privateKey = keccak256_1.keccak256(seedHexBytes);
    return new CrowdsaleAccount({
        _isCrowdsaleAccount: true,
        address: ethaddr,
        privateKey: privateKey
    });
}
exports.decrypt = decrypt;
//# sourceMappingURL=crowdsale.js.map