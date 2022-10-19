"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const util = require("util");
class Logger {
    static log(message, ...params) {
        if (!this._didShow) {
            this._didShow = true;
            this.show();
        }
        this.outputChannel.appendLine(message);
        params.forEach(p => this.outputChannel.appendLine(util.inspect(p)));
        if (this._isDebugging) {
            console.log(message);
            params.forEach(p => console.log(p));
        }
    }
    static show() {
        this.outputChannel.show();
    }
    static init() {
        try {
            const isDebuggingRegex = /^--inspect(-brk)?=?/;
            const args = process.execArgv;
            this._isDebugging = args ? args.some(arg => isDebuggingRegex.test(arg)) : false;
        }
        catch (_a) { }
    }
}
Logger.outputChannel = vscode.window.createOutputChannel("Meadow Solidity Debugger");
Logger._didShow = false;
exports.Logger = Logger;
Logger.init();
//# sourceMappingURL=logger.js.map