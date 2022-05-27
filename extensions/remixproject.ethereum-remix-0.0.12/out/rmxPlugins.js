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
exports.PluginInterface = exports.RmxPluginsProvider = void 0;
const vscode_1 = require("vscode");
const vscode_2 = require("vscode");
class RmxPluginsProvider {
    constructor(workspaceRoot) {
        this.workspaceRoot = workspaceRoot;
        this._onDidChangeTreeData = new vscode_1.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.toPlugin = (pluginName, id, text, icon) => {
            return new PluginInterface(pluginName, id, text, vscode_1.TreeItemCollapsibleState.None, {
                command: "rmxPlugins.showPluginOptions",
                title: pluginName,
                arguments: [id],
            }, icon);
        };
        this.data = [];
    }
    setDefaultData(data) {
        this.defaultData = data;
        this.refresh();
    }
    setDataForPlugin(name, newData) {
        this.data.map((plugin, index) => {
            if (plugin.name === name)
                this.data[index] = Object.assign(Object.assign({}, plugin), newData);
        });
        this._onDidChangeTreeData.fire(null);
    }
    getData() {
        return this.data;
    }
    add(data) {
        this.data.push(data);
        this._onDidChangeTreeData.fire(null);
    }
    remove(id) {
        this.data = this.data.filter((plugin) => {
            return plugin.name != id;
        });
        this._onDidChangeTreeData.fire(null);
    }
    refresh() {
        this.data = [...this.defaultData.sort((a, b) => (a.displayName < b.displayName) ? -1 : 1)];
        this._onDidChangeTreeData.fire(null);
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        return this.getRmxPlugins().then((children) => {
            return Promise.resolve(children);
        });
    }
    getRmxPlugins() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const plugins = this.data
                    ? this.data.map((plugin) => this.toPlugin(plugin.displayName, plugin.name, plugin.description, plugin.icon))
                    : [];
                return Promise.resolve(plugins);
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.RmxPluginsProvider = RmxPluginsProvider;
class PluginInterface extends vscode_1.TreeItem {
    constructor(label, id, text, collapsibleState, command, icon) {
        super(label, collapsibleState);
        this.label = label;
        this.id = id;
        this.text = text;
        this.collapsibleState = collapsibleState;
        this.command = command;
        this.icon = icon;
        this.tooltip = `${this.label}-${this.text}`;
        this.description = this.text;
        this.iconPath = {
            light: (this.icon.light ? vscode_2.Uri.parse(this.icon.light) : vscode_2.Uri.parse(this.icon)),
            dark: (this.icon.dark ? vscode_2.Uri.parse(this.icon.dark) : vscode_2.Uri.parse(this.icon)),
        };
        this.contextValue = "options";
    }
}
exports.PluginInterface = PluginInterface;
//# sourceMappingURL=rmxPlugins.js.map