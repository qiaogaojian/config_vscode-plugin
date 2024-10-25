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
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const net = __importStar(require("net"));
const dgram = __importStar(require("dgram"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const crypto = __importStar(require("crypto"));
const fs = __importStar(require("fs"));
const extensionViews = __importStar(require("./extensionViews"));
const extensionTemplates = __importStar(require("./extensionTemplates"));
function _showCarbLogs(remotely, outputChannel) {
    // get configurations
    const config = vscode.workspace.getConfiguration();
    const ip = remotely ? config.get("remoteApplication", { "extensionIP": "127.0.0.1" }).extensionIP : "127.0.0.1";
    const port = config.get(remotely ? "remoteApplication" : "localApplication", { "extensionPort": 8226 }).extensionPort;
    // don't process remotely logs in local machine
    if (remotely && (ip == '127.0.0.1' || ip == 'localhost'))
        return;
    // create the UDP socket client
    let socket = dgram.createSocket('udp4');
    console.log(`[isaacsim-vscode-edition] [UDP socket ${ip}:${port}] Socket created`);
    socket.on('message', (msg, rinfo) => {
        outputChannel.appendLine(`${new Date().toLocaleTimeString()} ${msg}`);
    }).on('error', (err) => {
        console.error(`[isaacsim-vscode-edition] [UDP socket ${ip}:${port}] Connection error: ${err.message}`);
    }).on('close', () => {
        console.log(`[isaacsim-vscode-edition] [UDP socket ${ip}:${port}] Connection closed`);
    });
    // send alive message on specified interval
    setInterval(() => {
        socket.send('*', port, ip);
    }, 5000);
}
function _runCode(remotely, outputChannel, selectedText) {
    // get configurations
    const config = vscode.workspace.getConfiguration();
    const ip = remotely ? config.get("remoteApplication", { "extensionIP": "127.0.0.1" }).extensionIP : "127.0.0.1";
    const port = config.get(remotely ? "remoteApplication" : "localApplication", { "extensionPort": 8226 }).extensionPort;
    const clearBeforeRunning = config.get('output', { "clearBeforeRunning": false }).clearBeforeRunning;
    // get editor
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showWarningMessage("No active editor found");
        return;
    }
    // get document text
    const documentText = editor.document.getText(selectedText ? editor.selection : undefined);
    if (documentText.length == 0) {
        vscode.window.showWarningMessage("No text available or selected");
        return;
    }
    // create the TCP socket client
    let socket = new net.Socket();
    // connect to the Omniverse application (send code and show output)
    socket.connect(port, ip)
        .on("connect", () => {
        console.log(`[isaacsim-vscode-edition] [TCP socket ${ip}:${port}] Connection established`);
        // clear output if needed
        if (clearBeforeRunning) {
            outputChannel.clear();
        }
        // show execution info
        outputChannel.show();
        outputChannel.appendLine(`[${new Date().toLocaleTimeString()}] executing${selectedText ? ' selected text' : ''} at ${ip}:${port}...`);
        // send text to application
        socket.write(documentText);
    })
        .on("data", (data) => {
        console.log(`[isaacsim-vscode-edition] [TCP socket ${ip}:${port}] Received data`);
        // parse reply
        let reply = JSON.parse(data.toString());
        // show successful execution
        if (reply.status === 'ok') {
            if (reply.output.length > 0) {
                outputChannel.appendLine(`[${new Date().toLocaleTimeString()}] executed with output:`);
                outputChannel.appendLine(reply.output);
            }
            else {
                outputChannel.appendLine(`[${new Date().toLocaleTimeString()}] executed without output`);
            }
        }
        // show error during execution
        else if (reply.status === 'error') {
            if (reply.output.length > 0) {
                outputChannel.appendLine(reply.output);
            }
            outputChannel.appendLine('--------------------------------------------------');
            outputChannel.appendLine('Traceback (most recent call last) ' + reply.traceback);
            outputChannel.appendLine('');
        }
        socket.destroy();
    })
        .on("close", () => {
        console.log(`[isaacsim-vscode-edition] [TCP socket ${ip}:${port}] Closed`);
    })
        .on("error", (err) => {
        console.error(`[isaacsim-vscode-edition] [TCP socket ${ip}:${port}] Connection error: ${err.message}`);
        vscode.window.showErrorMessage(`Connection error: ${err.message}`);
        socket.destroy();
    })
        .on('timeout', () => {
        console.warn(`[isaacsim-vscode-edition] [TCP socket ${ip}:${port}] Timeout`);
        socket.destroy();
    });
}
function _runScriptInTerminal() {
    // get editor
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showWarningMessage("No active editor found");
        return;
    }
    // check file URI schema
    if (editor.document.uri.scheme != "file" && editor.document.uri.scheme != "untitled") {
        vscode.window.showWarningMessage(`Current document has unsupported schema (${editor.document.uri.scheme})`);
        return;
    }
    let scriptPath = editor.document.uri.fsPath;
    // store document temporary if untitled
    if (editor.document.isUntitled) {
        scriptPath = path.join(os.tmpdir(), `_script_${crypto.randomBytes(8).toString('hex')}.py`);
        fs.writeFileSync(scriptPath, editor.document.getText(), { encoding: "utf-8" });
    }
    // check if document exists
    if (!fs.existsSync(scriptPath)) {
        vscode.window.showWarningMessage(`Unable to access the file (${scriptPath})`);
        return;
    }
    // check Python executable
    const executableScriptPath = vscode.workspace.workspaceFolders ? path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, "python.sh") : "";
    if (!fs.existsSync(executableScriptPath)) {
        vscode.window.showWarningMessage("Python executable cannot be found");
        return;
    }
    // run in terminal
    console.log(`[isaacsim-vscode-edition] [run-in-terminal] ${executableScriptPath} ${scriptPath}`);
    const terminal = vscode.window.createTerminal();
    terminal.show(false);
    terminal.sendText(`${executableScriptPath} ${scriptPath}`, true);
}
function _getResourceWebviewHtml(resourceUrl) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
	<style>
		html, body {
			margin: 0;
			padding: 0;
			width: 100%;
			height: 100%;
			min-height: 100%;
		}
		body > iframe {
			border: 0;
		}
	</style>
</head>
<body>
	<iframe width="100%" height="100%" frameBorder="0" src="${resourceUrl}"></iframe>
</body>
</html>`;
}
// method called when the extension is activated (the very first time the command is executed)
function activate(context) {
    const config = vscode.workspace.getConfiguration();
    // output panel (code execution)
    let outputChannelRun = vscode.window.createOutputChannel('Isaac Sim VS Code Edition'); //, 'python');
    // output panel (carb logs)
    if (config.get('output', { "showCarbLogs": true }).showCarbLogs) {
        let outputChannelCarb = vscode.window.createOutputChannel('Isaac Sim VS Code Edition (carb logs)'); //, 'python');
        _showCarbLogs(false, outputChannelCarb); // local
        _showCarbLogs(true, outputChannelCarb); // remote
    }
    // register commands
    let command_run_local = vscode.commands.registerCommand('isaacsim-vscode-edition.run', () => {
        _runCode(false, outputChannelRun, false);
    });
    let command_run_local_selected_text = vscode.commands.registerCommand('isaacsim-vscode-edition.runSelectedText', () => {
        _runCode(false, outputChannelRun, true);
    });
    let command_run_remote = vscode.commands.registerCommand('isaacsim-vscode-edition.runRemotely', () => {
        _runCode(true, outputChannelRun, false);
    });
    let command_run_remote_selected_text = vscode.commands.registerCommand('isaacsim-vscode-edition.runSelectedTextRemotely', () => {
        _runCode(true, outputChannelRun, true);
    });
    let command_execute_from_terminal = vscode.commands.registerCommand('isaacsim-vscode-edition.executeFromTerminal', () => {
        _runScriptInTerminal();
    });
    let command_clear_output = vscode.commands.registerCommand('isaacsim-vscode-edition.clearOutput', () => {
        outputChannelRun.clear();
    });
    let command_insert_snippet = vscode.commands.registerCommand('isaacsim-vscode-edition.insertSnippet', (args) => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active editor found');
            return;
        }
        editor.insertSnippet(new vscode.SnippetString(args)).then(() => { }, err => {
            vscode.window.showWarningMessage(`Unable to insert snippet: ${err}`);
        });
    });
    let command_create_template = vscode.commands.registerCommand('isaacsim-vscode-edition.createTemplate', (template) => {
        switch (template) {
            case "extension":
                extensionTemplates.createExtension(context);
                return;
            case "behavior-script":
                extensionTemplates.createBehaviorScript(context);
                return;
            case "standalone-application":
                extensionTemplates.createStandaloneApplication(context);
                return;
        }
    });
    let command_open_resource = vscode.commands.registerCommand('isaacsim-vscode-edition.openResource', (title, url, openInternal) => {
        // internal view
        if (openInternal == "true") {
            const panel = vscode.window.createWebviewPanel('resource', // type of the webview panel
            title, // panel title
            vscode.ViewColumn.Beside, // editor column to show the panel in
            {
                enableScripts: true,
                enableFindWidget: true,
                retainContextWhenHidden: true
            });
            panel.webview.html = _getResourceWebviewHtml(url);
        }
        // external view
        else {
            vscode.env.openExternal(vscode.Uri.parse(url));
        }
    });
    context.subscriptions.push(command_run_local);
    context.subscriptions.push(command_run_local_selected_text);
    context.subscriptions.push(command_run_remote);
    context.subscriptions.push(command_run_remote_selected_text);
    context.subscriptions.push(command_execute_from_terminal);
    context.subscriptions.push(command_clear_output);
    context.subscriptions.push(command_insert_snippet);
    context.subscriptions.push(command_create_template);
    context.subscriptions.push(command_open_resource);
    // create TreeDataProvider
    const commandTreeView = new extensionViews.CommandTreeView();
    const snippetIsaacSimTreeView = new extensionViews.SnippetTreeView("isaac-sim", "python");
    const snippetKitUsdTreeView = new extensionViews.SnippetTreeView("kit-usd", "python");
    const templateTreeView = new extensionViews.TemplateTreeView();
    const resourceTreeView = new extensionViews.ResourceTreeView();
}
exports.activate = activate;
// method called when the extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map