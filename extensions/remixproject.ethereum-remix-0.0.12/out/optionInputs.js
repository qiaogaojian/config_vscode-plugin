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
exports.runCommand = exports.pluginDocumentation = exports.pluginUninstall = exports.pluginDeactivate = exports.pluginActivate = void 0;
/**
 * Shows a pick list using window.showQuickPick().
 */
const vscode_1 = require("vscode");
/**
 * Activate a plugin
 * @param context vscode Execution context
 * @param pluginId plugin ID mentioned as plugin ViewItem
 */
function pluginActivate(context, pluginId) {
    return __awaiter(this, void 0, void 0, function* () {
        vscode_1.commands.executeCommand('extension.activateRmxPlugin', pluginId);
    });
}
exports.pluginActivate = pluginActivate;
/**
 * Deactivate a plugin with given id
 * @param context vscode Execution context
 * @param pluginId plugin ID mentioned as plugin ViewItem
 */
function pluginDeactivate(context, pluginId) {
    return __awaiter(this, void 0, void 0, function* () {
        vscode_1.commands.executeCommand('extension.deActivateRmxPlugin', pluginId);
    });
}
exports.pluginDeactivate = pluginDeactivate;
/**
 * Uninstall a plugin with given id
 * @param context vscode Execution context
 * @param pluginId plugin ID mentioned as plugin ViewItem
 */
function pluginUninstall(context, pluginId) {
    return __awaiter(this, void 0, void 0, function* () {
        vscode_1.commands.executeCommand('rmxPlugins.uninstallRmxPlugin', pluginId);
    });
}
exports.pluginUninstall = pluginUninstall;
/**
 * Open Documentation
 * @param context vscode Execution context
 * @param pluginId plugin ID mentioned as plugin ViewItem
 */
function pluginDocumentation(context, pluginId) {
    return __awaiter(this, void 0, void 0, function* () {
        vscode_1.commands.executeCommand('rmxPlugins.openDocumentation', pluginId);
    });
}
exports.pluginDocumentation = pluginDocumentation;
function runCommand(context, cmd) {
    return __awaiter(this, void 0, void 0, function* () {
        vscode_1.commands.executeCommand(cmd);
    });
}
exports.runCommand = runCommand;
//# sourceMappingURL=optionInputs.js.map