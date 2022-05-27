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
const engine_vscode_1 = require("@remixproject/engine-vscode");
const path_1 = require("@remixproject/engine-vscode/util/path");
const vscode_1 = require("vscode");
class VscodeFileManager extends engine_vscode_1.FileManagerPlugin {
    constructor() {
        super();
        this.type = "localhost";
        this.methods = [
            ...this.methods,
            "getOpenedFiles",
            "exists",
            "getProviderByName",
            "getProviderOf",
        ];
    }
    /**
     * Async API method getProviderOf
     * @param {string} file
     *
     */
    getProviderOf(file) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.currentFileProvider();
        });
    }
    /**
     * Async API method getProviderByName
     * @param {string} name
     *
     */
    getProviderByName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.currentFileProvider();
        });
    }
    setContext(context) {
        this.context = context;
    }
    addNormalizedName(path, url) {
        this.context.workspaceState.update(this.type + "/" + path, url);
        this.context.workspaceState.update("reverse-" + url, this.type + "/" + path);
    }
    getNormalizedName(path) {
        return this.context.workspaceState.get(path);
    }
    getPathFromUrl(url) {
        return this.context.workspaceState.get("reverse-" + url);
    }
    currentFileProvider() {
        return this;
    }
    getProvider(type) {
        return this;
    }
    fileProviderOf(url) {
        //console.log("PROVIDER of ", url);
        return this;
    }
    getOpenedFiles() {
        return vscode_1.workspace.textDocuments.map((x) => path_1.relativePath(x.fileName));
    }
    isConnected() {
        return true;
    }
    exists(path) {
        path = this.getPathFromUrl(path) || path;
        var unprefixedpath = this.removePrefix(path);
        const absPath = path_1.absolutePath(unprefixedpath);
        const uri = vscode_1.Uri.file(absPath);
        return new Promise((resolve, reject) => {
            try {
                vscode_1.workspace.fs.stat(uri).then(() => {
                    resolve(true);
                }, () => {
                    resolve(false);
                });
            }
            catch (e) {
                reject();
            }
        });
    }
    removePrefix(path) {
        path = path.indexOf(this.type) === 0 ? path.replace(this.type, "") : path;
        if (path === "")
            return "/";
        return path;
    }
    get(path, cb) {
        cb = cb || function () { };
        path = this.getPathFromUrl(path) || path;
        var unprefixedpath = this.removePrefix(path);
        this.exists(unprefixedpath).then(() => {
            this.readFile(unprefixedpath).then((content) => {
                cb(null, content);
            }, () => {
                cb(null, null);
            });
        }, () => {
            cb(null, null);
        });
    }
    set(path, content, cb) {
        cb = cb || function () { };
        var unprefixedpath = this.removePrefix(path);
        try {
            console.log("write to", unprefixedpath);
            this.writeFile(unprefixedpath, content).then(() => {
                cb();
            });
        }
        catch (e) {
            cb(e);
        }
    }
    addExternal(path, content, url) {
        if (url)
            this.addNormalizedName(path, url);
        return this.set(path, content, undefined);
    }
}
exports.default = VscodeFileManager;
//# sourceMappingURL=file_manager.js.map