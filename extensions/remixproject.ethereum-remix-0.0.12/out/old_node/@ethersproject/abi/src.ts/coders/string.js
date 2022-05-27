"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringCoder = void 0;
const strings_1 = require("@ethersproject/strings");
const bytes_1 = require("./bytes");
class StringCoder extends bytes_1.DynamicBytesCoder {
    constructor(localName) {
        super("string", localName);
    }
    defaultValue() {
        return "";
    }
    encode(writer, value) {
        return super.encode(writer, strings_1.toUtf8Bytes(value));
    }
    decode(reader) {
        return strings_1.toUtf8String(super.decode(reader));
    }
}
exports.StringCoder = StringCoder;
//# sourceMappingURL=string.js.map