"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FixedBytesCoder = void 0;
const bytes_1 = require("@ethersproject/bytes");
const abstract_coder_1 = require("./abstract-coder");
// @TODO: Merge this with bytes
class FixedBytesCoder extends abstract_coder_1.Coder {
    constructor(size, localName) {
        let name = "bytes" + String(size);
        super(name, name, localName, false);
        this.size = size;
    }
    defaultValue() {
        return ("0x0000000000000000000000000000000000000000000000000000000000000000").substring(0, 2 + this.size * 2);
    }
    encode(writer, value) {
        let data = bytes_1.arrayify(value);
        if (data.length !== this.size) {
            this._throwError("incorrect data length", value);
        }
        return writer.writeBytes(data);
    }
    decode(reader) {
        return reader.coerce(this.name, bytes_1.hexlify(reader.readBytes(this.size)));
    }
}
exports.FixedBytesCoder = FixedBytesCoder;
//# sourceMappingURL=fixed-bytes.js.map