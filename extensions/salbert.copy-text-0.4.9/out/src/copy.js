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
exports.Copy = void 0;
const vscode = require("vscode");
class Copy {
    static copyTextOnly(append = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const activeTextEditor = vscode.window.activeTextEditor;
            if (activeTextEditor) {
                const selection = activeTextEditor.selection;
                if (!selection.isEmpty) {
                    let text = activeTextEditor.document.getText(selection);
                    if (append) {
                        const currentText = yield vscode.env.clipboard.readText();
                        text = `${currentText}\n\n${text}`;
                    }
                    vscode.env.clipboard.writeText(text);
                }
            }
        });
    }
    /**
     * TODO: comment copyCodeForMarkdown
     * Copys code for markdown
     * @param [append]
     */
    static copyCodeForMarkdown(append = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const activeTextEditor = vscode.window.activeTextEditor;
            if (activeTextEditor) {
                const selection = activeTextEditor.selection;
                if (!selection.isEmpty) {
                    let text = activeTextEditor.document.getText(selection);
                    if (append) {
                        let currentText = yield vscode.env.clipboard.readText();
                        if (currentText.endsWith('```')) {
                            currentText = currentText.substring(0, currentText.length - 3);
                        }
                        text = `${currentText}\n\n${text}\n\`\`\``;
                    }
                    else {
                        text = `\`\`\`\n${text}\n\`\`\``;
                    }
                    vscode.env.clipboard.writeText(text);
                }
            }
        });
    }
    /**
     * Copies text with metadata
     * @param activeTextEditor
     */
    static copyTextWithMetadata(append = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const activeTextEditor = vscode.window.activeTextEditor;
            if (activeTextEditor) {
                const selection = activeTextEditor.selection;
                if (!selection.isEmpty) {
                    let text = activeTextEditor.document.getText(selection);
                    if (append) {
                        const currentText = yield vscode.env.clipboard.readText();
                        text = `${currentText}\n\n${text}`;
                    }
                    let sourceFilename = activeTextEditor.document.fileName;
                    if (vscode.workspace.getConfiguration().get('copy-text.fullPath', false)) {
                        let i = sourceFilename.lastIndexOf('/');
                        if (i <= 0) {
                            i = sourceFilename.lastIndexOf('\\');
                        }
                        if (i >= 0) {
                            sourceFilename = sourceFilename.substring(i + 1);
                        }
                    }
                    const date = new Date();
                    const caret = selection.start;
                    text = `${text}\n(${sourceFilename} - line ${caret.line}/${activeTextEditor.document.lineCount}`;
                    if (vscode.workspace.getConfiguration().get('copy-text.includeDate', true)) {
                        text += ` - ${date.toLocaleDateString()}`;
                    }
                    if (vscode.workspace.getConfiguration().get('copy-text.includeTime', true)) {
                        text += ` - ${date.toLocaleTimeString()}`;
                    }
                    vscode.env.clipboard.writeText(text + ')');
                }
            }
        });
    }
}
exports.Copy = Copy;
//# sourceMappingURL=copy.js.map