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
exports.createExtension = exports.createStandaloneApplication = exports.createBehaviorScript = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function _replaceInFileSync(filePath, token, replacement) {
    const content = fs.readFileSync(filePath, { encoding: "utf-8" });
    const newContent = content.replace(token, replacement);
    fs.writeFileSync(filePath, newContent, { encoding: "utf-8" });
}
function _processRequest(context, request) {
    console.log(`[isaacsim-vscode-edition] [template] ${JSON.stringify(request)}`);
    switch (request.command) {
        case "create":
            // extension
            switch (request.template) {
                case "extension":
                    return _createExtension(context, request.fields);
                default:
                    return { status: false, stringError: `Internal error: undefined case '${request.template}'` };
            }
        default:
            return { status: false, stringError: `Internal error: undefined case '${request.command}'` };
    }
}
function _createExtension(context, request) {
    console.log(`[isaacsim-vscode-edition] [template] ${JSON.stringify(request)}`);
    // create extension structure
    const extensionRootDir = path.join(request.path, request.name);
    const extensionSourceDir = path.join.apply(null, [extensionRootDir].concat(request.name.split('.')));
    try {
        console.log(`[isaacsim-vscode-edition] [template] creating path: ${extensionSourceDir}`);
        fs.mkdirSync(extensionSourceDir, { recursive: true });
    }
    catch (err) {
        vscode.window.showErrorMessage("Cannot create the extension", err.toString());
        return { status: false, stringError: err.toString() };
    }
    // copy files
    try {
        fs.cpSync(path.join(context.extensionPath, "templates", "extension-python", "config"), path.join(extensionRootDir, "config"), { recursive: true });
        fs.cpSync(path.join(context.extensionPath, "templates", "extension-python", "data"), path.join(extensionRootDir, "data"), { recursive: true });
        fs.cpSync(path.join(context.extensionPath, "templates", "extension-python", "docs"), path.join(extensionRootDir, "docs"), { recursive: true });
        fs.copyFileSync(path.join(context.extensionPath, "templates", "extension-python", "_src", "__init__.py"), path.join(extensionSourceDir, "__init__.py"));
        fs.copyFileSync(path.join(context.extensionPath, "templates", "extension-python", "_src", "extension.py"), path.join(extensionSourceDir, "extension.py"));
    }
    catch (err) {
        vscode.window.showErrorMessage("Cannot create the extension", err.toString());
        return { status: false, stringError: err.toString() };
    }
    // replace tokens
    _replaceInFileSync(path.join(extensionRootDir, "config", "extension.toml"), "<EXT_CATEGORY>", request.category);
    _replaceInFileSync(path.join(extensionRootDir, "config", "extension.toml"), "<EXT_TITLE>", request.title);
    _replaceInFileSync(path.join(extensionRootDir, "config", "extension.toml"), "<EXT_DESCRIPTION>", request.description);
    _replaceInFileSync(path.join(extensionRootDir, "config", "extension.toml"), '["<EXT_KEYWORDS>"]', JSON.stringify(request.keywords.replace(", ", ',').split(',')));
    _replaceInFileSync(path.join(extensionRootDir, "config", "extension.toml"), '["<EXT_AUTHORS>"]', JSON.stringify(request.authors.replace(", ", ',').split(',')));
    _replaceInFileSync(path.join(extensionRootDir, "config", "extension.toml"), "<EXT_REPOSITORY>", request.repository);
    _replaceInFileSync(path.join(extensionRootDir, "config", "extension.toml"), "<EXT_NAME>", request.name);
    _replaceInFileSync(path.join(extensionRootDir, "docs", "README.md"), "<EXT_NAME>", request.name);
    return { status: true, stringError: "" };
}
async function createBehaviorScript(context) {
    console.log(`[isaacsim-vscode-edition] [template] behavior-script`);
    // create new untitled file
    await vscode.commands.executeCommand("workbench.action.files.newUntitledFile");
    const editor = vscode.window.activeTextEditor;
    if (!editor)
        return;
    // change file language id
    vscode.languages.setTextDocumentLanguage(editor.document, "python");
    // populate file
    const filePath = path.join(context.extensionPath, "templates", "behavior-script", "script.py");
    const content = fs.readFileSync(filePath, { encoding: "utf-8" });
    editor.insertSnippet(new vscode.SnippetString(content));
}
exports.createBehaviorScript = createBehaviorScript;
async function createStandaloneApplication(context) {
    console.log(`[isaacsim-vscode-edition] [template] standalone-application`);
    // create new untitled file
    await vscode.commands.executeCommand("workbench.action.files.newUntitledFile");
    const editor = vscode.window.activeTextEditor;
    if (!editor)
        return;
    // change file language id
    vscode.languages.setTextDocumentLanguage(editor.document, "python");
    // populate file
    const filePath = path.join(context.extensionPath, "templates", "standalone-application", "script.py");
    const content = fs.readFileSync(filePath, { encoding: "utf-8" });
    editor.insertSnippet(new vscode.SnippetString(content));
}
exports.createStandaloneApplication = createStandaloneApplication;
// https://code.visualstudio.com/api/extension-guides/webview
function createExtension(context) {
    // create and show a new webview
    const panel = vscode.window.createWebviewPanel("template-omniverse-extension-python", // identify the type of the webview (used internally)
    "Omniverse Extension", // title of the panel displayed to the user
    vscode.ViewColumn.One, // editor column to show the new webview panel in.
    {
        enableScripts: true,
    });
    // handle messages from the webview
    panel.webview.onDidReceiveMessage(message => {
        let response = _processRequest(context, message);
        panel.webview.postMessage(response);
    }); //, undefined, context.subscriptions);
    // html
    const jsExtensionPath = vscode.Uri.joinPath(vscode.Uri.file(context.extensionPath), "static", "js", "extension.js");
    const cssExtensionPath = vscode.Uri.joinPath(vscode.Uri.file(context.extensionPath), "static", "css", "extension.css");
    const cssBootstrapGridPath = vscode.Uri.joinPath(vscode.Uri.file(context.extensionPath), "static", "css", "bootstrap-grid.min.css");
    const cssBootstrapUtilitiesPath = vscode.Uri.joinPath(vscode.Uri.file(context.extensionPath), "static", "css", "bootstrap-utilities.min.css");
    const textWorkspacePath = vscode.workspace.workspaceFolders ? path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, "extsUser") : "";
    panel.webview.html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <link href="${panel.webview.asWebviewUri(cssExtensionPath)}" rel="stylesheet">
            <link href="${panel.webview.asWebviewUri(cssBootstrapGridPath)}" rel="stylesheet">
            <link href="${panel.webview.asWebviewUri(cssBootstrapUtilitiesPath)}" rel="stylesheet">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${panel.webview.cspSource} https:; script-src ${panel.webview.cspSource}; style-src ${panel.webview.cspSource};"/>
            <title>Create extension</title>
        </head>
        <body>
            <div class="container">
                <div class="row">
                    <div class="col-sm-12">
                        <h2>Create extension</h2>
                    </div>
                </div>
                <br>

                <div class="row mb-2">
                    <div class="col-sm-3">
                        <strong class="text-start w-100">Ext. name <span class="text-danger">&nbsp*</span></strong>
                    </div>
                    <div class="col-sm-9">
                        <input class="input w-100" type="text" id="extension-name" required placeholder="brand.category.name"/>
                    </div>
                </div>

                <div class="row mb-2" title="">
                    <div class="col-sm-3">
                        <strong class="text-start w-100">Ext. path <span class="text-danger">&nbsp*</span></strong>
                    </div>
                    <div class="col-sm-8">
                        <input class="input w-100" type="text" id="extension-path" required value="${textWorkspacePath}"/>
                    </div>
                    <div class="col-sm-1">
                        <button class="button w-100" id="button-extension-path">...</button>
                    </div>
                </div>

                <hr>

                <p><a href="https://docs.omniverse.nvidia.com/kit/docs/kit-manual/latest/guide/extensions_advanced.html#extension-configuration-file-extension-toml">Extension configuration file (extension.toml)</a><p>
                <div class="row mb-2" title="User-facing extension name, used for UI">
                    <div class="col-sm-3">
                        <strong class="text-start w-100">Ext. title</strong> 
                    </div>
                    <div class="col-sm-9">
                        <input class="input w-100" type="text" id="extension-title" placeholder="Title"/>
                    </div>
                </div>
                
                <div class="row mb-2" title="User-facing extension short description, used for UI">
                    <div class="col-sm-3">
                        <strong class="text-start w-100">Ext. description</strong> 
                    </div>
                    <div class="col-sm-9">
                        <input class="input w-100" type="text" id="extension-description" placeholder="Short description"/>
                    </div>
                </div>
                
                <div class="row mb-2" title="Strings that describe this extension. Helpful when searching for it in the extension registry">
                    <div class="col-sm-3">
                        <strong class="text-start w-100">Ext. keywords</strong> 
                    </div>
                    <div class="col-sm-9">
                        <input class="input w-100" type="text" id="extension-keywords" placeholder="keyword1, keyword2, keyword3"/>
                    </div>
                </div>
                
                <div class="row mb-2" title="Lists people or organizations that are considered the authors of the package. Optionally include email addresses within angled brackets after each author">
                    <div class="col-sm-3">
                        <strong class="text-start w-100">Ext. authors</strong> 
                    </div>
                    <div class="col-sm-9">
                        <input class="input w-100" type="text" id="extension-authors" placeholder="John Doe <example@example.com>, Jane Doe"/>
                    </div>
                </div>
                
                <div class="row mb-2" title="URL of the extension source repository, used for UI">
                    <div class="col-sm-3">
                        <strong class="text-start w-100">Ext. repository</strong> 
                    </div>
                    <div class="col-sm-9">
                        <input class="input w-100" type="text" id="extension-repository" placeholder="https://example.com"/>
                    </div>
                </div>
                
                <div class="row mb-2" title="Extension category, used for UI">
                    <div class="col-sm-3">
                        <strong class="text-start w-100">Ext. category</strong> 
                    </div>
                    <div class="col-sm-9">
                        <select class="select w-100" id="extension-category">
                            <option value="">[undefined]</option>
                            <option value="animation">animation</option>
                            <option value="graph">graph</option>
                            <option value="rendering">rendering</option>
                            <option value="audio">audio</option>
                            <option value="simulation">simulation</option>
                            <option value="example">example</option>
                            <option value="internal">internal</option>
                            <option value="other">other</option>
                        </select>
                    </div>
                </div>

                <hr>
                
                <div class="row">
                    <div class="col-sm-8">
                        <p class="d-none text-warning mt-0" id="banner"></p>
                    </div>
                    <div class="col-sm-4">
                        <button class="button w-100" id="button-extension-create">Create</button>
                    </div>
                </div>
            </div>

            <script src="${panel.webview.asWebviewUri(jsExtensionPath)}"></script>

        </body>
        </html>
    `;
}
exports.createExtension = createExtension;
//# sourceMappingURL=extensionTemplates.js.map