"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultAbiCoder = exports.AbiCoder = void 0;
// See: https://github.com/ethereum/wiki/wiki/Ethereum-Contract-ABI
const bytes_1 = require("@ethersproject/bytes");
const properties_1 = require("@ethersproject/properties");
const logger_1 = require("@ethersproject/logger");
const _version_1 = require("./_version");
const logger = new logger_1.Logger(_version_1.version);
const abstract_coder_1 = require("./coders/abstract-coder");
const address_1 = require("./coders/address");
const array_1 = require("./coders/array");
const boolean_1 = require("./coders/boolean");
const bytes_2 = require("./coders/bytes");
const fixed_bytes_1 = require("./coders/fixed-bytes");
const null_1 = require("./coders/null");
const number_1 = require("./coders/number");
const string_1 = require("./coders/string");
const tuple_1 = require("./coders/tuple");
const fragments_1 = require("./fragments");
const paramTypeBytes = new RegExp(/^bytes([0-9]*)$/);
const paramTypeNumber = new RegExp(/^(u?int)([0-9]*)$/);
class AbiCoder {
    constructor(coerceFunc) {
        logger.checkNew(new.target, AbiCoder);
        properties_1.defineReadOnly(this, "coerceFunc", coerceFunc || null);
    }
    _getCoder(param) {
        switch (param.baseType) {
            case "address":
                return new address_1.AddressCoder(param.name);
            case "bool":
                return new boolean_1.BooleanCoder(param.name);
            case "string":
                return new string_1.StringCoder(param.name);
            case "bytes":
                return new bytes_2.BytesCoder(param.name);
            case "array":
                return new array_1.ArrayCoder(this._getCoder(param.arrayChildren), param.arrayLength, param.name);
            case "tuple":
                return new tuple_1.TupleCoder((param.components || []).map((component) => {
                    return this._getCoder(component);
                }), param.name);
            case "":
                return new null_1.NullCoder(param.name);
        }
        // u?int[0-9]*
        let match = param.type.match(paramTypeNumber);
        if (match) {
            let size = parseInt(match[2] || "256");
            if (size === 0 || size > 256 || (size % 8) !== 0) {
                logger.throwArgumentError("invalid " + match[1] + " bit length", "param", param);
            }
            return new number_1.NumberCoder(size / 8, (match[1] === "int"), param.name);
        }
        // bytes[0-9]+
        match = param.type.match(paramTypeBytes);
        if (match) {
            let size = parseInt(match[1]);
            if (size === 0 || size > 32) {
                logger.throwArgumentError("invalid bytes length", "param", param);
            }
            return new fixed_bytes_1.FixedBytesCoder(size, param.name);
        }
        return logger.throwArgumentError("invalid type", "type", param.type);
    }
    _getWordSize() { return 32; }
    _getReader(data, allowLoose) {
        return new abstract_coder_1.Reader(data, this._getWordSize(), this.coerceFunc, allowLoose);
    }
    _getWriter() {
        return new abstract_coder_1.Writer(this._getWordSize());
    }
    getDefaultValue(types) {
        const coders = types.map((type) => this._getCoder(fragments_1.ParamType.from(type)));
        const coder = new tuple_1.TupleCoder(coders, "_");
        return coder.defaultValue();
    }
    encode(types, values) {
        if (types.length !== values.length) {
            logger.throwError("types/values length mismatch", logger_1.Logger.errors.INVALID_ARGUMENT, {
                count: { types: types.length, values: values.length },
                value: { types: types, values: values }
            });
        }
        const coders = types.map((type) => this._getCoder(fragments_1.ParamType.from(type)));
        const coder = (new tuple_1.TupleCoder(coders, "_"));
        const writer = this._getWriter();
        coder.encode(writer, values);
        return writer.data;
    }
    decode(types, data, loose) {
        const coders = types.map((type) => this._getCoder(fragments_1.ParamType.from(type)));
        const coder = new tuple_1.TupleCoder(coders, "_");
        return coder.decode(this._getReader(bytes_1.arrayify(data), loose));
    }
}
exports.AbiCoder = AbiCoder;
exports.defaultAbiCoder = new AbiCoder();
//# sourceMappingURL=abi-coder.js.map