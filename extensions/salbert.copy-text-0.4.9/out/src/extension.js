"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode = require("vscode");
const copy_1 = require("./copy");
/**
 * Runs command
 * @param commandName
 * @param implFunc
 */
function regCommand(commandName, implFunc) {
    try {
        return vscode.commands.registerCommand(commandName, implFunc);
    }
    catch (e) {
        console.error(`${commandName}: ${e}`);
    }
}
function activate(context) {
    context.subscriptions.push(regCommand('copy-text.copyTextOnly', () => copy_1.Copy.copyTextOnly(false)));
    context.subscriptions.push(regCommand('copy-text.copyAndAppendText', () => copy_1.Copy.copyTextOnly(true)));
    context.subscriptions.push(regCommand('copy-text.copyTextWithMetadata', () => copy_1.Copy.copyTextWithMetadata(false)));
    context.subscriptions.push(regCommand('copy-text.copyAndAppendTextWithMetadata', () => copy_1.Copy.copyTextWithMetadata(true)));
    context.subscriptions.push(regCommand('copy-text.copyCodeForMarkdown', () => copy_1.Copy.copyCodeForMarkdown()));
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map