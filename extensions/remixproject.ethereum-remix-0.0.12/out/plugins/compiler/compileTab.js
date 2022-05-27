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
const remix_solidity_1 = require("@remix-project/remix-solidity");
const engine_1 = require("@remixproject/engine");
const profile = {
    name: "solidity-logic",
    displayName: "Solidity compiler logic",
    description: "Compile solidity contracts - Logic",
    version: "0.0.1",
    methods: ["compile"],
};
class CompileTab extends engine_1.Plugin {
    constructor() {
        super(profile);
        this.compiler = new remix_solidity_1.Compiler((url, cb) => __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.call("contentImport", "resolveAndSave", url, "");
                cb(null, result);
            }
            catch (e) {
                cb(e.message);
            }
        }));
        this.init();
    }
    init() {
        this.optimize = true;
        this.compiler.set("optimize", this.optimize);
        this.runs = this.runs || 200;
        this.compiler.set("runs", this.runs);
        this.evmVersion = null;
        this.compiler.set("evmVersion", this.evmVersion);
        console.log("COMPILER");
        console.log(this.compiler);
    }
    /**
     * Compile a specific file of the file manager
     * @param {string} target the path to the file to compile
     */
    compile(target) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!target)
                throw new Error("No target provided for compiliation");
            let content = yield this.call("fileManager", "readFile", target);
            const sources = { [target]: { content } };
            console.log(sources);
            this.compiler.loadRemoteVersion('https://binaries.soliditylang.org/wasm/soljson-v0.8.4+commit.c7e474f2.js');
            //this.compiler.loadVersion(false, urlFromVersion('0.8.4'))
            this.compiler.event.register('compilationFinished', (success, compilationData, source) => {
                console.log(compilationData);
            });
            this.compiler.event.register('compilerLoaded', _ => {
                console.log("loaded");
            }); //this.compiler.compile(sources, target))
        });
    }
}
exports.default = CompileTab;
//# sourceMappingURL=compileTab.js.map