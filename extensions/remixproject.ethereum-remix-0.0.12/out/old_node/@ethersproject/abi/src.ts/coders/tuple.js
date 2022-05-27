"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TupleCoder = void 0;
const abstract_coder_1 = require("./abstract-coder");
const array_1 = require("./array");
class TupleCoder extends abstract_coder_1.Coder {
    constructor(coders, localName) {
        let dynamic = false;
        const types = [];
        coders.forEach((coder) => {
            if (coder.dynamic) {
                dynamic = true;
            }
            types.push(coder.type);
        });
        const type = ("tuple(" + types.join(",") + ")");
        super("tuple", type, localName, dynamic);
        this.coders = coders;
    }
    defaultValue() {
        const values = [];
        this.coders.forEach((coder) => {
            values.push(coder.defaultValue());
        });
        // We only output named properties for uniquely named coders
        const uniqueNames = this.coders.reduce((accum, coder) => {
            const name = coder.localName;
            if (name) {
                if (!accum[name]) {
                    accum[name] = 0;
                }
                accum[name]++;
            }
            return accum;
        }, {});
        // Add named values
        this.coders.forEach((coder, index) => {
            let name = coder.localName;
            if (!name || uniqueNames[name] !== 1) {
                return;
            }
            if (name === "length") {
                name = "_length";
            }
            if (values[name] != null) {
                return;
            }
            values[name] = values[index];
        });
        return Object.freeze(values);
    }
    encode(writer, value) {
        return array_1.pack(writer, this.coders, value);
    }
    decode(reader) {
        return reader.coerce(this.name, array_1.unpack(reader, this.coders));
    }
}
exports.TupleCoder = TupleCoder;
//# sourceMappingURL=tuple.js.map