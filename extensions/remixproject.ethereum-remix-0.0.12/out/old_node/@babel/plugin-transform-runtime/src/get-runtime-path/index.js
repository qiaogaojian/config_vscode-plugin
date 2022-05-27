"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const module_1 = require("module");
const require = module_1.createRequire(import.meta.url);
function default_1(moduleName, dirname, absoluteRuntime) {
    if (absoluteRuntime === false)
        return moduleName;
    return resolveAbsoluteRuntime(moduleName, path_1.default.resolve(dirname, absoluteRuntime === true ? "." : absoluteRuntime));
}
exports.default = default_1;
function resolveAbsoluteRuntime(moduleName, dirname) {
    try {
        return path_1.default
            .dirname(require.resolve(`${moduleName}/package.json`, { paths: [dirname] }))
            .replace(/\\/g, "/");
    }
    catch (err) {
        if (err.code !== "MODULE_NOT_FOUND")
            throw err;
        throw Object.assign(new Error(`Failed to resolve "${moduleName}" relative to "${dirname}"`), {
            code: "BABEL_RUNTIME_NOT_FOUND",
            runtime: moduleName,
            dirname,
        });
    }
}
//# sourceMappingURL=index.js.map