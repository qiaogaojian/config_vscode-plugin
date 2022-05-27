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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const solc = __importStar(require("solc"));
const axios_1 = __importDefault(require("axios"));
let missingInputs = [];
let cachedSolc;
let counter = 0;
function findImports(path, root) {
    missingInputs.push(path);
    return { 'error': 'Deferred import' };
}
process.on("message", (m) => __awaiter(void 0, void 0, void 0, function* () {
    if (m.command === "compile") {
        const vnReg = /(^[0-9].[0-9].[0-9]\+commit\..*?)+(\.)/g;
        const vnRegArr = vnReg.exec(solc.version());
        // @ts-ignore
        const vn = 'v' + (vnRegArr ? vnRegArr[1] : '');
        const input = m.payload;
        missingInputs = [];
        // check cached version
        let solcToUse = solc;
        if (cachedSolc && cachedSolc.version()) {
            //process.send({processMessage: "Using cached version " +  cachedSolc.version()})
            solcToUse = cachedSolc;
        }
        //
        if (m.version === vn || m.version === 'latest' || (cachedSolc && cachedSolc.version())) {
            try {
                counter++;
                process.send({ processMessage: "Compiling with local or cached version: " + solcToUse.version() + "... step:" + counter });
                const output = yield solcToUse.compile(JSON.stringify(input), { import: (path) => findImports(path, m.root) });
                // @ts-ignore
                process.send({ compiled: output, version: solcToUse.version(), sources: input.sources, missingInputs });
                // we should not exit process here as findImports still might be running
            }
            catch (e) {
                console.error(e);
                // @ts-ignore
                process.send({ error: e });
                // @ts-ignore
                process.exit(1);
            }
        }
        else {
            const v = m.version.replace('soljson-', '').replace('.js', '');
            console.log("Loading remote version " + v + "...");
            process.send({ processMessage: "Loading remote version " + v + "... please wait" });
            solc.loadRemoteVersion(v, (err, newSolc) => __awaiter(void 0, void 0, void 0, function* () {
                process.send({ processMessage: "Remote version " + v + " loaded." });
                if (err) {
                    console.error(err);
                    // @ts-ignore
                    process.send({ error: e });
                }
                else {
                    cachedSolc = newSolc;
                    console.log("compiling with remote version ", newSolc.version());
                    try {
                        const output = yield newSolc.compile(JSON.stringify(input), { import: (path) => findImports(path, m.root) });
                        // @ts-ignore
                        process.send({ compiled: output, version: newSolc.version(), sources: input.sources, missingInputs });
                    }
                    catch (e) {
                        console.error(e);
                        // @ts-ignore
                        process.send({ error: e });
                        // @ts-ignore
                        process.exit(1);
                    }
                }
            }));
        }
    }
    if (m.command === "fetch_compiler_verison") {
        axios_1.default
            .get("https://solc-bin.ethereum.org/bin/list.json")
            .then((res) => {
            // @ts-ignore
            process.send({ versions: res.data.releases });
        })
            .catch((e) => {
            // @ts-ignore
            process.send({ error: e });
            // @ts-ignore
            process.exit(1);
        });
    }
}));
//# sourceMappingURL=compile_worker.js.map