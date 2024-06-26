"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceTreeView = exports.TemplateTreeView = exports.SnippetTreeView = exports.CommandTreeView = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// tree views
class CommandTreeView {
    commandTreeViewProvider;
    constructor() {
        this.commandTreeViewProvider = new CommandTreeViewProvider();
        vscode.window.createTreeView('isaacsim-vscode-edition-views-commands', { treeDataProvider: this.commandTreeViewProvider, showCollapseAll: false });
    }
}
exports.CommandTreeView = CommandTreeView;
class SnippetTreeView {
    snippetTreeViewProvider;
    treeView;
    constructor(view, snippetLanguage) {
        this.snippetTreeViewProvider = new SnippetTreeViewProvider(view, snippetLanguage, true);
        this.treeView = vscode.window.createTreeView(`isaacsim-vscode-edition-views-snippets-${view}`, { treeDataProvider: this.snippetTreeViewProvider, showCollapseAll: true });
    }
    expandAll() {
        this.snippetTreeViewProvider.expandAll(this.treeView);
    }
}
exports.SnippetTreeView = SnippetTreeView;
class TemplateTreeView {
    templateTreeViewProvider;
    constructor() {
        this.templateTreeViewProvider = new TemplateTreeViewProvider();
        vscode.window.createTreeView('isaacsim-vscode-edition-views-templates', { treeDataProvider: this.templateTreeViewProvider, showCollapseAll: false });
    }
}
exports.TemplateTreeView = TemplateTreeView;
class ResourceTreeView {
    resourceTreeViewProvider;
    constructor() {
        this.resourceTreeViewProvider = new ResourceTreeViewProvider(true);
        vscode.window.createTreeView('isaacsim-vscode-edition-views-resources', { treeDataProvider: this.resourceTreeViewProvider, showCollapseAll: true });
    }
}
exports.ResourceTreeView = ResourceTreeView;
// tree data providers
class CommandTreeViewProvider {
    commands = [];
    constructor() {
        // codicon: https://microsoft.github.io/vscode-codicons/dist/codicon.html
        // let icon1, icon2, icon3, icon4: vscode.Uri | undefined;
        // const currentExtension = vscode.extensions.getExtension("NVIDIA.isaacsim-vscode-edition");
        // if (currentExtension){
        // 	icon1 = vscode.Uri.file(path.join(currentExtension.extensionPath, 'images', "command-run.svg"));
        // 	icon2 = vscode.Uri.file(path.join(currentExtension.extensionPath, 'images', "command-run-selected.svg"));
        // 	icon3 = vscode.Uri.file(path.join(currentExtension.extensionPath, 'images', "command-run-remote.svg"));
        // 	icon4 = vscode.Uri.file(path.join(currentExtension.extensionPath, 'images', "command-run-remote-selected.svg"));
        // }
        this.commands.push(new TreeItem("Run", { command: "isaacsim-vscode-edition.run" }, new vscode.ThemeIcon("play", new vscode.ThemeColor("charts.green"))));
        this.commands.push(new TreeItem("Run selected text", { command: "isaacsim-vscode-edition.runSelectedText" }, new vscode.ThemeIcon("play", new vscode.ThemeColor("charts.green"))));
        this.commands.push(new TreeItem("---", { command: "" }));
        this.commands.push(new TreeItem("Run remotely", { command: "isaacsim-vscode-edition.runRemotely" }, new vscode.ThemeIcon("run-all", new vscode.ThemeColor("charts.green"))));
        this.commands.push(new TreeItem("Run selected text remotely", { command: "isaacsim-vscode-edition.runSelectedTextRemotely" }, new vscode.ThemeIcon("run-all", new vscode.ThemeColor("charts.green"))));
        this.commands.push(new TreeItem("---", { command: "" }));
        this.commands.push(new TreeItem("Execute from terminal", { command: "isaacsim-vscode-edition.executeFromTerminal" }, new vscode.ThemeIcon("terminal", new vscode.ThemeColor("charts.purple"))));
        this.commands.push(new TreeItem("---", { command: "" }));
        this.commands.push(new TreeItem("Clear output", { command: "isaacsim-vscode-edition.clearOutput" }, // workbench.output.action.clearOutput
        new vscode.ThemeIcon("clear-all")));
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        return this.commands;
    }
}
class SnippetTreeViewProvider {
    snippets = [];
    constructor(view, snippetLanguage, collapsed) {
        switch (view) {
            case "isaac-sim":
                this.snippets.push(this.buildSubtree("Core", this.parseJSON(`${snippetLanguage}-isaac-sim-core.json`), collapsed));
                this.snippets.push(this.buildSubtree("Core (utils)", this.parseJSON(`${snippetLanguage}-isaac-sim-core-utils.json`), collapsed));
                this.snippets.push(this.buildSubtree("SimulationApp", this.parseJSON(`${snippetLanguage}-isaac-sim-simulation-app.json`), collapsed));
                this.snippets.push(this.buildSubtree("UI (utils)", this.parseJSON(`${snippetLanguage}-isaac-sim-ui-utils.json`), collapsed));
                return;
            case "kit-usd":
                this.snippets.push(this.buildSubtree("Kit", this.parseJSON(`${snippetLanguage}-kit.json`), collapsed));
                this.snippets.push(this.buildSubtree("USD", this.parseJSON(`${snippetLanguage}-usd.json`), collapsed));
                return;
        }
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (!element)
            return this.snippets;
        return element.children;
    }
    getParent(element) {
        return element.parent;
    }
    buildSubtree(treeName, snippets, collapsed) {
        let children = [];
        for (var val of snippets) {
            if (val.hasOwnProperty("snippets"))
                children.push(this.buildSubtree(val.title, val.snippets, collapsed));
            else {
                let icon;
                switch (val.category) {
                    case "class":
                        icon = new vscode.ThemeIcon("symbol-class");
                        break;
                    case "method":
                        icon = new vscode.ThemeIcon("symbol-method");
                        break;
                    case "property":
                        icon = new vscode.ThemeIcon("symbol-variable");
                        break;
                    case "function":
                        icon = new vscode.ThemeIcon("symbol-method");
                        break;
                    case "constant":
                        icon = new vscode.ThemeIcon("symbol-constant");
                        break;
                    case "import":
                        icon = new vscode.ThemeIcon("export");
                        break;
                    case "code":
                        icon = new vscode.ThemeIcon("symbol-keyword", new vscode.ThemeColor("input.placeholderForeground"));
                        break;
                    default:
                        icon = new vscode.ThemeIcon("blank");
                        break;
                }
                children.push(new TreeItem(val.title, { command: 'isaacsim-vscode-edition.insertSnippet', arguments: [val.snippet] }, icon, val.description));
            }
        }
        const parent = new TreeItem(treeName, { command: '' });
        if (children.length > 0) {
            if (collapsed)
                parent.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
            else
                parent.collapsibleState = vscode.TreeItemCollapsibleState.Expanded;
            parent.children = children;
            children.forEach((c) => c.parent = parent);
        }
        return parent;
    }
    parseJSON(jsonFile) {
        const currentExtension = vscode.extensions.getExtension("NVIDIA.isaacsim-vscode-edition");
        if (!currentExtension)
            return [];
        const filePath = path.join(currentExtension.extensionPath, 'snippets', jsonFile);
        if (!fs.existsSync(filePath))
            return [];
        const rawSnippets = JSON.parse(fs.readFileSync(filePath, { encoding: 'utf8' }));
        if (rawSnippets.hasOwnProperty("snippets"))
            return rawSnippets.snippets;
        return rawSnippets;
    }
    expandSnippet(treeView, snippet) {
        if (snippet.children.length > 0) {
            treeView.reveal(snippet, { select: false, focus: false, expand: 3 });
            for (var child of snippet.children)
                this.expandSnippet(treeView, child);
        }
    }
    expandAll(treeView) {
        for (var snippet of this.snippets)
            treeView.reveal(snippet, { select: false, focus: false, expand: 3 });
        // this.expandSnippet(treeView, snippet);
    }
}
class TemplateTreeViewProvider {
    templates = [];
    constructor() {
        this.templates.push(new TreeItem("Extension", { command: "isaacsim-vscode-edition.createTemplate", arguments: ["extension"] }, new vscode.ThemeIcon("symbol-method", new vscode.ThemeColor("icon.foreground")), "Open a wizard screen for creating an Omniverse extension"));
        this.templates.push(new TreeItem("Behavior script", { command: "isaacsim-vscode-edition.createTemplate", arguments: ["behavior-script"] }, new vscode.ThemeIcon("file"), "Create a new Python Scripting Component (BehaviorScript)"));
        this.templates.push(new TreeItem("Standalone application", { command: "isaacsim-vscode-edition.createTemplate", arguments: ["standalone-application"] }, new vscode.ThemeIcon("file"), "Create a new script to run Isaac Sim in pure Python mode"));
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        return this.templates;
    }
}
class ResourceTreeViewProvider {
    items = [];
    constructor(collapsed) {
        this.items.push(this.buildSubtree("Developer", this.parseJSON("developer.json"), collapsed));
        this.items.push(this.buildSubtree("Documentation", this.parseJSON("documentation.json"), collapsed));
        this.items.push(this.buildSubtree("Forum", this.parseJSON("forums.json"), collapsed));
        this.items.push(this.buildSubtree("Isaac Sim: Extensions API", this.parseJSON("isaac-sim_extensions.json"), collapsed));
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (!element)
            return this.items;
        return element.children;
    }
    getParent(element) {
        return element.parent;
    }
    buildSubtree(treeName, resources, collapsed) {
        let children = [];
        for (var val of resources) {
            if (val.hasOwnProperty("resources"))
                children.push(this.buildSubtree(val.title, val.resources, collapsed));
            else {
                let icon;
                if (val.internal)
                    icon = new vscode.ThemeIcon("open-preview", new vscode.ThemeColor("input.placeholderForeground"));
                else
                    icon = new vscode.ThemeIcon("link-external", new vscode.ThemeColor("charts.blue"));
                children.push(new TreeItem(val.title, { command: 'isaacsim-vscode-edition.openResource', arguments: [val.title, val.url, val.internal.toString()] }, icon, val.description));
            }
        }
        const parent = new TreeItem(treeName, { command: '' });
        if (children.length > 0) {
            if (collapsed)
                parent.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
            else
                parent.collapsibleState = vscode.TreeItemCollapsibleState.Expanded;
            parent.children = children;
            children.forEach((c) => c.parent = parent);
        }
        return parent;
    }
    parseJSON(jsonFile) {
        const currentExtension = vscode.extensions.getExtension("NVIDIA.isaacsim-vscode-edition");
        if (currentExtension) {
            const rawResources = JSON.parse(fs.readFileSync(path.join(currentExtension.extensionPath, 'resources', jsonFile), { encoding: 'utf8' }));
            if (rawResources.hasOwnProperty("resources"))
                return rawResources.resources;
            return rawResources;
        }
        return [];
    }
    expandItem(treeView, item) {
        if (item.children.length > 0) {
            treeView.reveal(item, { select: false, focus: false, expand: 3 });
            for (var child of item.children)
                this.expandItem(treeView, child);
        }
    }
    expandAll(treeView) {
        for (var item of this.items)
            treeView.reveal(item, { select: false, focus: false, expand: 3 });
        // this.expandItem(treeView, item);
    }
}
// tree item
class TreeItem extends vscode.TreeItem {
    label;
    iconPath;
    customTooltip;
    children = [];
    parent = undefined;
    command;
    constructor(label, command, iconPath, customTooltip) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.label = label;
        this.iconPath = iconPath;
        this.customTooltip = customTooltip;
        this.command = { ...command, title: '' };
        if (iconPath)
            this.iconPath = iconPath;
        this.tooltip = new vscode.MarkdownString(customTooltip);
    }
}
//# sourceMappingURL=extensionViews.js.map