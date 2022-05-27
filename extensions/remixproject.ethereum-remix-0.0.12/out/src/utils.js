"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetPluginData = exports.ToViewColumn = void 0;
const vscode_1 = require("vscode");
function ToViewColumn(pluginData) {
    switch (pluginData.location) {
        case "sidePanel":
            return vscode_1.ViewColumn.Two;
        default:
            return vscode_1.ViewColumn.Active;
    }
}
exports.ToViewColumn = ToViewColumn;
function GetPluginData(pluginId, data) {
    const p = data.filter(i => {
        return i.name == pluginId;
    });
    return p[0];
}
exports.GetPluginData = GetPluginData;
//# sourceMappingURL=utils.js.map