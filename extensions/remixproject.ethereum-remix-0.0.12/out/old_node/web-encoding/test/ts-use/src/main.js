"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decode = exports.encode = void 0;
const web_encoding_1 = require("web-encoding");
exports.encode = (text) => new web_encoding_1.TextEncoder().encode(text);
exports.decode = (bytes) => new web_encoding_1.TextDecoder().decode(bytes);
//# sourceMappingURL=main.js.map