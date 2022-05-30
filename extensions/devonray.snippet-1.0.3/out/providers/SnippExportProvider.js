"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// const path = require("path");
// const cjson = require("cjson");
// const fs = require("fs");
class SnippetExportProvider {
    constructor(context) {
        var _a;
        this.snipps = (_a = context === null || context === void 0 ? void 0 : context.globalState) === null || _a === void 0 ? void 0 : _a.get("snipps", []);
    }
    /**
     *
     * @param {vscode.Uri} uri - a fake uri
     * @returns {string} - settings read from the JSON file
     **/
    provideTextDocumentContent(uri) {
        // console.log();
        // let settingsFilePath = "/path/to/settings/file/settings.json";
        let returnString = { test: "testing" };
        // // read settings file
        // if (fs.existsSync(settingsFilePath)) {
        //   returnString = cjson.load(settingsFilePath);
        // }
        // return JSON object as a string
        return JSON.stringify(this.snipps, null, 4) || ""; // prettify and return
    }
}
exports.default = SnippetExportProvider;
//# sourceMappingURL=SnippExportProvider.js.map