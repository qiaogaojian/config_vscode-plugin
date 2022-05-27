"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressCoder = void 0;
const address_1 = require("@ethersproject/address");
const bytes_1 = require("@ethersproject/bytes");
const abstract_coder_1 = require("./abstract-coder");
class AddressCoder extends abstract_coder_1.Coder {
    constructor(localName) {
        super("address", "address", localName, false);
    }
    defaultValue() {
        return "0x0000000000000000000000000000000000000000";
    }
    encode(writer, value) {
        try {
            address_1.getAddress(value);
        }
        catch (error) {
            this._throwError(error.message, value);
        }
        return writer.writeValue(value);
    }
    decode(reader) {
        return address_1.getAddress(bytes_1.hexZeroPad(reader.readValue().toHexString(), 20));
    }
}
exports.AddressCoder = AddressCoder;
//# sourceMappingURL=address.js.map