"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BytesCoder = exports.DynamicBytesCoder = void 0;
const bytes_1 = require("@ethersproject/bytes");
const abstract_coder_1 = require("./abstract-coder");
class DynamicBytesCoder extends abstract_coder_1.Coder {
    constructor(type, localName) {
        super(type, type, localName, true);
    }
    defaultValue() {
        return "0x";
    }
    encode(writer, value) {
        value = bytes_1.arrayify(value);
        let length = writer.writeValue(value.length);
        length += writer.writeBytes(value);
        return length;
    }
    decode(reader) {
        return reader.readBytes(reader.readValue().toNumber(), true);
    }
}
exports.DynamicBytesCoder = DynamicBytesCoder;
class BytesCoder extends DynamicBytesCoder {
    constructor(localName) {
        super("bytes", localName);
    }
    decode(reader) {
        return reader.coerce(this.name, bytes_1.hexlify(super.decode(reader)));
    }
}
exports.BytesCoder = BytesCoder;
//# sourceMappingURL=bytes.js.map