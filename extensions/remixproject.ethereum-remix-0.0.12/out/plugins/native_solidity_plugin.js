"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const engine_vscode_1 = require("@remixproject/engine-vscode");
const vscode_1 = require("vscode");
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
const path_1 = require("@remixproject/engine-vscode/util/path");
const semver = require("semver");
const profile = {
    name: "solidity",
    displayName: "Solidity compiler",
    description: "Compile solidity contracts",
    kind: "compiler",
    permission: true,
    location: "sidePanel",
    documentation: "https://remix-ide.readthedocs.io/en/latest/solidity_editor.html",
    version: "0.0.1",
    methods: [
        "getCompilationResult",
        "compile",
        "compileWithParameters",
        "setCompilerConfig",
    ],
};
class NativeSolcPlugin extends engine_vscode_1.CommandPlugin {
    constructor() {
        super(profile);
        this.version = "latest";
        this.handleImportCall = (url, cb) => {
            this.call("contentImport", "resolveAndSave", url, "")
                .then((result) => cb(null, result))
                .catch((error) => cb(error.message));
        };
        this.loadSolidityVersions();
        this.compilerOpts = {
            language: "Solidity",
            optimize: false,
            runs: 200,
        };
    }
    getVersion() {
        return 0.1;
    }
    createWorker() {
        // enable --inspect for debug
        // return fork(path.join(__dirname, "compile_worker.js"), [], {
        //   execArgv: ["--inspect=" + (process.debugPort + 1)]
        // });
        return child_process_1.fork(path.join(__dirname, "compile_worker.js"));
    }
    print(m) {
        this.call("terminal", "log", m);
    }
    /**
     * @dev Gather imports for compilation
     * @param files file sources
     * @param importHints import file list
     * @param cb callback
     */
    gatherImports(files, importHints, cb) {
        //console.log("gather imports", files, importHints);
        //this.print("Processing imports " + JSON.stringify(Object.keys(files)))
        importHints = importHints || [];
        // FIXME: This will only match imports if the file begins with one '.'
        // It should tokenize by lines and check each.
        const importRegex = /^\s*import\s*['"]([^'"]+)['"];/g;
        for (const fileName in files) {
            let match;
            while ((match = importRegex.exec(files[fileName].content))) {
                let importFilePath = match[1];
                if (importFilePath.startsWith("./")) {
                    const path = /(.*\/).*/.exec(fileName);
                    importFilePath = path
                        ? importFilePath.replace("./", path[1])
                        : importFilePath.slice(2);
                }
                if (!importHints.includes(importFilePath))
                    importHints.push(importFilePath);
            }
        }
        while (importHints.length > 0) {
            const m = importHints.pop();
            if (m && m in files)
                continue;
            if (this.handleImportCall) {
                this.handleImportCall(m, (err, content) => {
                    if (err && cb)
                        cb(err);
                    else {
                        files[m] = { content };
                        this.gatherImports(files, importHints, cb);
                    }
                });
            }
            return;
        }
        if (cb) {
            cb(null, { sources: files });
        }
    }
    setVersion(_version) {
        return __awaiter(this, void 0, void 0, function* () {
            this.version = _version == 'latest' ? 'latest' : (_version in this.versions ? this.versions[_version] : this.version);
        });
    }
    compile(_version, opts, file) {
        return __awaiter(this, void 0, void 0, function* () {
            //this.print("Compile with " + _version + " or cached " + this.version)
            const fileName = file || (yield this.call("fileManager", "getCurrentFile"));
            let versionFromPragma;
            try {
                versionFromPragma = yield this._setCompilerVersionFromPragma(fileName);
            }
            catch (_a) {
                versionFromPragma = 'latest';
            }
            this.version = this.version ? (_version in this.versions ? this.versions[_version] : this.version) : versionFromPragma;
            this.compilerOpts = opts ? opts : this.compilerOpts;
            opts = this.compilerOpts;
            //this.print(`Compiling ${fileName} ... with version ${this.version}`);
            const editorContent = file
                ? yield this.call("fileManager", "readFile", file)
                : undefined || vscode_1.window.activeTextEditor
                    ? vscode_1.window.activeTextEditor.document.getText()
                    : undefined;
            const sources = {};
            if (fileName) {
                sources[fileName] = {
                    content: editorContent,
                };
            }
            const solcWorker = this.createWorker();
            console.log(`Solidity compiler invoked with WorkerID: ${solcWorker.pid}`);
            this.print(`Compiling with version ${this.version}`);
            var input = {
                language: opts.language,
                sources,
                settings: {
                    outputSelection: {
                        "*": {
                            "": ["ast"],
                            "*": [
                                "abi",
                                "metadata",
                                "devdoc",
                                "userdoc",
                                "evm.legacyAssembly",
                                "evm.bytecode",
                                "evm.deployedBytecode",
                                "evm.methodIdentifiers",
                                "evm.gasEstimates",
                                "evm.assembly",
                            ],
                        },
                    },
                    optimizer: {
                        enabled: opts.optimize === true || opts.optimize === 1,
                        runs: opts.runs || 200,
                        details: {
                            yul: Boolean(opts.language === "Yul" && opts.optimize),
                        },
                    },
                    libraries: opts.libraries,
                },
            };
            if (opts.evmVersion) {
                input.settings.evmVersion = opts.evmVersion;
            }
            if (opts.language) {
                input.language = opts.language;
            }
            if (opts.language === "Yul" && input.settings.optimizer.enabled) {
                if (!input.settings.optimizer.details)
                    input.settings.optimizer.details = {};
                input.settings.optimizer.details.yul = true;
            }
            console.clear();
            solcWorker.send({
                command: "compile",
                root: vscode_1.workspace.workspaceFolders[0].uri.fsPath,
                payload: input,
                version: this.version,
            });
            solcWorker.on("message", (m) => {
                if (m.error) {
                    this.print(m.error);
                    console.error(m.error);
                }
                else if (m.processMessage) {
                    this.print(m.processMessage);
                }
                else if (m.data && m.path) {
                    this.print(`Compiling ${m.path}...`);
                    sources[m.path] = {
                        content: m.data.content,
                    };
                    solcWorker.send({
                        command: "compile",
                        root: vscode_1.workspace.workspaceFolders[0].uri.fsPath,
                        payload: input,
                        version: this.version,
                    });
                }
                else if (m.compiled) {
                    const languageVersion = this.version;
                    const compiled = JSON.parse(m.compiled);
                    //console.log("missing inputs", m);
                    if (m.missingInputs && m.missingInputs.length > 0) {
                        //return false
                        //console.log("gathering imports");
                        this.gatherImports(m.sources, m.missingInputs, (error, files) => {
                            //console.log("FILES", files);
                            input.sources = files.sources;
                            solcWorker.send({
                                command: "compile",
                                root: vscode_1.workspace.workspaceFolders[0].uri.fsPath,
                                payload: input,
                                version: this.version,
                            });
                        });
                    }
                    if (compiled.errors) {
                        //console.log(compiled.errors)
                        // this.print(
                        //   `Compilation error while compiling ${fileName} with solidity version ${m?.version}.`
                        // );
                        logError(compiled === null || compiled === void 0 ? void 0 : compiled.errors);
                    }
                    if (compiled.contracts) {
                        //console.log("COMPILED");
                        const source = { sources, target: fileName };
                        const data = JSON.parse(m.compiled);
                        this.compilationResult = {
                            source: {
                                sources,
                                target: fileName,
                            },
                            data,
                        };
                        const contracts = Object.keys(compiled.contracts).join(", ");
                        this.print(`Compilation finished for ${fileName} with solidity version ${m === null || m === void 0 ? void 0 : m.version}.`);
                        this.emit("compilationFinished", fileName, source, languageVersion, data);
                    }
                }
            });
            const errorKeysToLog = ["formattedMessage"];
            const logError = (errors) => {
                for (let i in errors) {
                    if (["number", "string"].includes(typeof errors[i])) {
                        if (errorKeysToLog.includes(i) &&
                            !errors[i].includes("Deferred import"))
                            this.print(errors[i]);
                    }
                    else {
                        logError(errors[i]);
                    }
                }
            };
        });
    }
    compileWithSolidityExtension() {
        return __awaiter(this, void 0, void 0, function* () {
            vscode_1.commands
                .executeCommand("solidity.compile.active")
                .then((listOFiles) => __awaiter(this, void 0, void 0, function* () {
                if (listOFiles)
                    for (let file of listOFiles) {
                        yield this.parseSolcOutputFile(file);
                    }
            }));
        });
    }
    parseSolcOutputFile(file) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(file);
            this.print(`Compiling with Solidity Extension`);
            const content = yield this.call("fileManager", "readFile", file);
            const parsedContent = JSON.parse(content);
            const sourcePath = parsedContent.sourcePath;
            const solcOutput = `${path
                .basename(parsedContent.sourcePath)
                .split(".")
                .slice(0, -1)
                .join(".")}-solc-output.json`;
            const outputDir = path.dirname(file);
            let raw = yield this.call("fileManager", "readFile", `${outputDir}/${solcOutput}`);
            console.log(`${outputDir}/${solcOutput}`);
            const relativeFilePath = path_1.relativePath(sourcePath);
            var re = new RegExp(`${sourcePath}`, "gi");
            raw = raw.replace(re, relativeFilePath);
            const compiled = JSON.parse(raw);
            let source = {};
            const fileKeys = Object.keys(compiled.sources);
            for (let s of fileKeys) {
                source[s] = { content: yield this.call("fileManager", "readFile", s) };
            }
            this.compilationResult = {
                source: {
                    sources: source,
                    target: relativeFilePath,
                },
                data: compiled,
            };
            this.print(`Compilation finished for ${relativeFilePath} with solidity version ${parsedContent === null || parsedContent === void 0 ? void 0 : parsedContent.compiler.version}.`);
            this.emit("compilationFinished", relativeFilePath, { sources: source }, parsedContent === null || parsedContent === void 0 ? void 0 : parsedContent.compiler.version, compiled);
        });
    }
    getCompilationResult() {
        return this.compilationResult;
    }
    loadSolidityVersions() {
        const solcWorker = this.createWorker();
        solcWorker.send({ command: "fetch_compiler_verison" });
        solcWorker.on("message", (m) => {
            this.versions = m.versions;
        });
    }
    getSolidityVersions() {
        return this.versions;
    }
    // Load solc compiler version according to pragma in contract file
    _setCompilerVersionFromPragma(filename) {
        return __awaiter(this, void 0, void 0, function* () {
            let data = yield this.call("fileManager", "readFile", filename);
            let versionFound;
            const pragmaArr = data.match(/(pragma solidity (.+?);)/g);
            if (pragmaArr && pragmaArr.length === 1) {
                const pragmaStr = pragmaArr[0].replace("pragma solidity", "").trim();
                const pragma = pragmaStr.substring(0, pragmaStr.length - 1);
                console.log(pragma);
                //console.log(this.versions)
                for (let version of Object.keys(this.versions)) {
                    //console.log(version)
                    if (semver.satisfies(version, pragma)) {
                        versionFound = this.versions[version];
                    }
                }
            }
            return new Promise((resolve, reject) => {
                if (versionFound) {
                    resolve(versionFound);
                }
                else {
                    reject();
                }
            });
        });
    }
}
exports.default = NativeSolcPlugin;
//# sourceMappingURL=native_solidity_plugin.js.map