"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtAPIPlugin = void 0;
const vscode_1 = require("vscode");
const engine_vscode_1 = require("@remixproject/engine-vscode");
const profile = {
    name: "vscodeExtAPI",
    displayName: "Extension API connector",
    description: "Connects VScode Extension API with remix plugins.",
    kind: "connector",
    permission: true,
    documentation: "",
    version: "0.0.1",
    methods: ["executeCommand"],
};
class ExtAPIPlugin extends engine_vscode_1.CommandPlugin {
    constructor() {
        super(profile);
    }
    executeCommand(extName, cmdName, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const ext = vscode_1.extensions.getExtension(extName);
                yield ext.activate();
                const extAPI = ext.exports;
                extAPI[cmdName](...payload || []);
            }
            catch (e) {
                // extension can not be activated or any other error
                console.error(e);
                vscode_1.window.showErrorMessage(`${extName} extension is not installed or disabled.`);
            }
        });
    }
}
exports.ExtAPIPlugin = ExtAPIPlugin;
//# sourceMappingURL=ext_api_plugin.js.map