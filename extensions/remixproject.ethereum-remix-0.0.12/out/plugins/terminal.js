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
const vscode_1 = require("vscode");
const engine_1 = require("@remixproject/engine");
let cache = "";
const profile = {
    displayName: "Terminal",
    name: "terminal",
    methods: ["log"],
    events: [],
    description: " - ",
    version: "0.1",
};
class Terminal extends engine_1.Plugin {
    constructor() {
        super(profile);
        this.outputChannel = vscode_1.window.createOutputChannel("Remix IDE");
    }
    log(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!msg)
                return;
            if (typeof msg == "string") {
                this.print(msg);
            }
            else {
                this.print(msg.value);
            }
        });
    }
    // terminal printing
    getNow() {
        const date = new Date(Date.now());
        return date.toLocaleTimeString();
    }
    print(m) {
        if (cache === m)
            return;
        cache = m;
        const now = this.getNow();
        this.outputChannel.appendLine(`[${now}]: ${m}`);
        this.outputChannel.show();
    }
}
exports.default = Terminal;
//# sourceMappingURL=terminal.js.map