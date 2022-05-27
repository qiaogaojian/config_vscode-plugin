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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const engine_1 = require("@remixproject/engine");
const ipfs_http_client_1 = __importDefault(require("ipfs-http-client"));
const path_1 = require("@remixproject/engine-vscode/util/path");
const vscode_1 = require("vscode");
const nodepath = require('path');
const profile = {
    name: 'dGitProvider',
    displayName: 'Decentralized git',
    description: '',
    icon: 'assets/img/fileManager.webp',
    version: '0.0.1',
    methods: ['init', 'status', 'log', 'commit', 'add', 'remove', 'rm', 'lsfiles', 'readblob', 'resolveref', 'branches', 'branch', 'checkout', 'currentbranch', 'push', 'pull', 'setIpfsConfig', 'zip'],
    kind: 'file-system'
};
class DGitProvider extends engine_1.Plugin {
    constructor() {
        super(profile);
        this.ipfsconfig = {
            host: 'ipfs.remixproject.org',
            port: 443,
            protocol: 'https',
            ipfsurl: 'https://ipfs.remixproject.org/ipfs/'
        };
    }
    print(m) {
        this.call("terminal", "log", m);
    }
    getGitConfig() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    status(cmd) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    add(cmd) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    rm(cmd) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    checkout(cmd) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    log(cmd) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    branch(cmd) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    currentbranch() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    branches() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    commit(cmd) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    lsfiles(cmd) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    resolveref(cmd) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    readblob(cmd) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    setIpfsConfig(config) {
        return __awaiter(this, void 0, void 0, function* () {
            this.ipfsconfig = config;
            return new Promise((resolve, reject) => {
                resolve(this.checkIpfsConfig());
            });
        });
    }
    checkIpfsConfig() {
        return __awaiter(this, void 0, void 0, function* () {
            this.ipfs = ipfs_http_client_1.default(this.ipfsconfig);
            try {
                yield this.ipfs.config.getAll();
                return true;
            }
            catch (e) {
                return false;
            }
        });
    }
    push() {
        return __awaiter(this, void 0, void 0, function* () {
            this.print("Pushing to IPFS please wait....");
            if (!this.checkIpfsConfig())
                return false;
            let files = yield this.getDirectory('');
            this.filesToSend = [];
            //console.log(files)
            //return;
            for (const file of files) {
                const absPath = path_1.absolutePath(file);
                const uri = vscode_1.Uri.file(absPath);
                const c = "";
                const v = yield vscode_1.workspace.fs.readFile(uri);
                //console.log(v)
                const ob = {
                    path: file,
                    content: v
                };
                this.filesToSend.push(ob);
            }
            const addOptions = {
                wrapWithDirectory: true
            };
            //console.log(this.filesToSend)
            const r = yield this.ipfs.add(this.filesToSend, addOptions);
            console.log(r.cid.string);
            this.print(`Files to published to IPFS ${r.cid.string} checkout at ${this.ipfsconfig.ipfsurl}/${r.cid.string}`);
            return r.cid.string;
        });
    }
    pull(cmd) {
        return __awaiter(this, void 0, void 0, function* () {
            //const cid = cmd.cid
            //let cid = "QmYMX1RnqPBe1NdMjKyTKZKjvRi2KzW5GSmxiNC3JDmRHS"
            let options = {
                prompt: "Clone from Remix using IPFS?",
                value: cmd
            };
            const input = yield vscode_1.window.showInputBox(options);
            if (!input || input === "")
                return;
            const cid = input;
            if (!this.checkIpfsConfig())
                return false;
            let files = this.ipfs.get(cid);
            for (const file of files) {
                file.path = file.path.replace(cid, '');
                if (!file.content) {
                    continue;
                }
                const content = [];
                for (const chunk of file.content) {
                    content.push(chunk);
                }
                const dir = nodepath.dirname(file.path);
                try {
                    //console.log("create dir ", dir)
                }
                catch (e) { }
                try {
                    const absPath = path_1.absolutePath(`${file.path}`);
                    const uri = vscode_1.Uri.file(absPath);
                    yield vscode_1.workspace.fs.writeFile(uri, Buffer.concat(content));
                    console.log("create file ", uri.path);
                }
                catch (e) { }
            }
        });
    }
    zip() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    createDirectories(strdirectories) {
        return __awaiter(this, void 0, void 0, function* () {
            const ignore = ['.', '/.', ''];
            if (ignore.indexOf(strdirectories) > -1)
                return false;
            const directories = strdirectories.split('/');
            for (let i = 0; i < directories.length; i++) {
                let previouspath = '';
                if (i > 0)
                    previouspath = '/' + directories.slice(0, i).join('/');
                const finalPath = previouspath + '/' + directories[i];
                try {
                    //window.remixFileSystem.mkdirSync(finalPath)
                }
                catch (e) { }
            }
        });
    }
    getDirectory(dir) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = [];
            let files;
            try {
                files = yield this.call("fileManager", "readdir", dir);
            }
            catch (e) {
                console.log(e);
                return;
            }
            const fileArray = normalize(files);
            //console.log(fileArray)
            //console.log("DIR", dir)
            for (const fi of fileArray) {
                //console.log(fi)
                //console.log(await this.call("fileManager","isDirectory",fi.data))
                if (fi) {
                    const type = yield this.call("fileManager", "isDirectory", dir + "/" + fi.data);
                    if (type === true) {
                        result = [
                            ...result,
                            ...(yield this.getDirectory(`${dir}/${fi.data}`))
                        ];
                    }
                    else {
                        result = [...result, `${dir}/${fi.data}`];
                    }
                }
            }
            return result;
        });
    }
}
exports.default = DGitProvider;
const normalize = (filesList) => {
    const folders = [];
    const files = [];
    Object.keys(filesList || {}).forEach(key => {
        if (filesList[key].isDirectory) {
            folders.push({
                filename: key,
                data: filesList[key]
            });
        }
        else {
            files.push({
                filename: key,
                data: filesList[key]
            });
        }
    });
    return [...folders, ...files];
};
//# sourceMappingURL=dGitProvider.js.map