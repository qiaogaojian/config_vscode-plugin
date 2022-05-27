"use strict";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');
var linq_1 = require('./linq');
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "markdown-toc" is now active!');
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    var command = vscode.commands.registerCommand('extension.markdownToc', function () {
        new TocGenerator().process();
    });
    context.subscriptions.push(command);
}
exports.activate = activate;
var TocGenerator = (function () {
    function TocGenerator() {
        this._tocStartLine = "<!-- vscode-markdown-toc -->";
        this._tocEndLine = "<!-- /vscode-markdown-toc -->";
        this._tocStartLineNumber = 0;
        this._tocEndLineNumber = 0;
        this._endAnchor = "</a>";
    }
    TocGenerator.prototype.process = function () {
        var _this = this;
        var editor = vscode.window.activeTextEditor;
        var doc = editor.document;
        this._configuration = this.readConfiguration(doc);
        var headers = this.buildHeaders(this.buildLineHeaders(doc));
        var tocSummary = this.buildSummary(headers);
        console.log(tocSummary);
        editor.edit(function (editBuilder) {
            headers.ForEach(function (header) {
                var lineText = "";
                for (var index = 0; index < (header.level + _this._configuration.MaxLevel - _this._configuration.MinLevel); index++) {
                    lineText = lineText.concat('#');
                }
                if (_this._configuration.Numbering) {
                    lineText = lineText.concat(" " + _this.buildNumbering(header.numbering));
                }
                if (_this._configuration.Anchor) {
                    lineText = lineText.concat(" <a name='" + header.anchor + "'></a>");
                }
                lineText = lineText.concat(header.title);
                editBuilder.replace(new vscode.Range(header.lineNumber, 0, header.lineNumber, header.lineLength), lineText);
            });
            if (_this._tocStartLineNumber + _this._tocEndLineNumber == 0) {
                editBuilder.insert(new vscode.Position(0, 0), tocSummary);
            }
            else {
                editBuilder.replace(new vscode.Range(_this._tocStartLineNumber, 0, _this._tocEndLineNumber, _this._tocEndLine.length), tocSummary);
            }
            return Promise.resolve();
        });
        if (this._configuration.AutoSave) {
            doc.save();
        }
    };
    TocGenerator.prototype.buildSummary = function (headers) {
        var _this = this;
        var tocSummary = this._tocStartLine + "\r\n";
        headers.ForEach(function (header) {
            var tocLine = "";
            for (var i = 0; i < header.level; i++) {
                tocLine = tocLine.concat("\t");
            }
            tocLine = tocLine.concat("*");
            if (_this._configuration.Numbering) {
                var numbering = _this.buildNumbering(header.numbering);
                if (numbering != "") {
                    tocLine = tocLine.concat(numbering);
                }
            }
            if (_this._configuration.Anchor) {
                tocLine = tocLine.concat(" [" + header.title + "](#" + header.anchor + ")");
            }
            else {
                tocLine = tocLine.concat(" " + header.title);
            }
            if (tocLine != null && tocLine != "") {
                tocSummary = tocSummary.concat(tocLine + "\n");
            }
        });
        tocSummary = tocSummary.concat("\n" + this._configuration.Build());
        tocSummary = tocSummary.concat("\n" + this._tocEndLine);
        return tocSummary;
    };
    TocGenerator.prototype.buildNumbering = function (numberings) {
        var numbering = " ";
        var lastLevel = (this._configuration.MaxLevel - this._configuration.MinLevel);
        for (var i = 0; i <= lastLevel; i++) {
            if (numberings[i] > 0) {
                numbering = numbering.concat(numberings[i] + ".");
            }
        }
        return numbering;
    };
    TocGenerator.prototype.buildHeaders = function (lines) {
        var _this = this;
        var headers = new linq_1.List();
        var levels = new Array();
        for (var index = this._configuration.MinLevel; index <= this._configuration.MaxLevel; index++) {
            levels.push(0);
        }
        lines.Where(function (x) { return x.level >= _this._configuration.MinLevel && x.level <= _this._configuration.MaxLevel; }).ForEach(function (header) {
            header.level = header.level - (_this._configuration.MaxLevel - _this._configuration.MinLevel);
            if (_this._configuration.Anchor) {
                header.setAnchorUnique(headers.Count(function (x) { return x.anchor == header.anchor; }));
            }
            if (_this._configuration.Numbering) {
                // Have to reset the sublevels
                for (var index = header.level; index < _this._configuration.MaxLevel - _this._configuration.MinLevel; index++) {
                    levels[index + 1] = 0;
                }
                // increment current level
                levels[header.level]++;
                header.numbering = copyObject(levels);
            }
            headers.Add(header);
        });
        return headers;
    };
    TocGenerator.prototype.readConfiguration = function (doc) {
        var tocConfiguration = new TocConfiguration();
        var readingConfiguration = false;
        for (var lineNumber = 0; lineNumber < doc.lineCount; lineNumber++) {
            var lineText = doc.lineAt(lineNumber).text.trim();
            // Break the loop, cause we read the configuration
            if (lineText.startsWith(tocConfiguration.EndLine)) {
                break;
            }
            if (lineText.startsWith(tocConfiguration.StartLine)) {
                readingConfiguration = true;
                continue;
            }
            if (readingConfiguration) {
                tocConfiguration.Read(lineText);
            }
        }
        return tocConfiguration;
    };
    TocGenerator.prototype.buildLineHeaders = function (doc) {
        var headers = new linq_1.List();
        var insideTripleBacktickCodeBlock = false;
        for (var lineNumber = 0; lineNumber < doc.lineCount; lineNumber++) {
            var aLine = doc.lineAt(lineNumber);
            //Ignore empty lines
            if (aLine.isEmptyOrWhitespace)
                continue;
            //Ignore pre-formatted code blocks in the markdown
            if (aLine.firstNonWhitespaceCharacterIndex > 3)
                continue;
            var lineText = aLine.text.trim();
            // Locate if toc was already generated
            if (lineText.startsWith(this._tocStartLine)) {
                this._tocStartLineNumber = lineNumber;
                continue;
            }
            else if (lineText.startsWith(this._tocEndLine)) {
                this._tocEndLineNumber = lineNumber;
                continue;
            }
            //If we are within a triple-backtick code blocks, then ignore
            if (lineText.startsWith("```")) {
                insideTripleBacktickCodeBlock = !insideTripleBacktickCodeBlock;
            }
            if (insideTripleBacktickCodeBlock) {
                continue;
            }
            if (lineText.startsWith("#")) {
                var headerLevel = lineText.indexOf(" ");
                var title = lineText.substring(headerLevel + 1);
                // Remove anchor in the title
                if (title.indexOf(this._endAnchor) > 0) {
                    title = title.substring(title.indexOf(this._endAnchor) + this._endAnchor.length);
                }
                headers.Add(new Header(headerLevel, title, lineNumber, lineText.length));
            }
        }
        return headers;
    };
    return TocGenerator;
}());
exports.TocGenerator = TocGenerator;
function copyObject(object) {
    var objectCopy = {};
    for (var key in object) {
        if (object.hasOwnProperty(key)) {
            objectCopy[key] = object[key];
        }
    }
    return objectCopy;
}
var TocConfiguration = (function () {
    function TocConfiguration(numbering, anchor, autoSave, minLevel, maxLevel) {
        if (numbering === void 0) { numbering = true; }
        if (anchor === void 0) { anchor = true; }
        if (autoSave === void 0) { autoSave = true; }
        if (minLevel === void 0) { minLevel = 2; }
        if (maxLevel === void 0) { maxLevel = 4; }
        this.StartLine = "<!-- vscode-markdown-toc-config";
        this.EndLine = "/vscode-markdown-toc-config -->";
        this._numberingKey = "numbering=";
        this._anchorKey = "anchor=";
        this._autoSaveKey = "autoSave=";
        this._minLevelKey = "minLevel=";
        this._maxLevelKey = "maxLevel=";
        this.Numbering = numbering;
        this.Anchor = anchor;
        this.AutoSave = autoSave;
        this.MinLevel = minLevel;
        this.MaxLevel = maxLevel;
    }
    TocConfiguration.prototype.Read = function (lineText) {
        if (this.readable(lineText, this._numberingKey)) {
            this.Numbering = this.toBoolean(lineText, this._numberingKey);
        }
        else if (this.readable(lineText, this._autoSaveKey)) {
            this.AutoSave = this.toBoolean(lineText, this._autoSaveKey);
        }
        // else if (this.readable(lineText, this._anchorKey)) {
        //   this.Anchor = this.toBoolean(lineText, this._anchorKey);
        // } else if (this.readable(lineText, this._minLevelKey)) {
        //   this.MinLevel = this.toNumber(lineText, this._minLevelKey);
        // } else if (this.readable(lineText, this._maxLevelKey)) {
        //   this.MaxLevel = this.toNumber(lineText, this._maxLevelKey);
        // }
    };
    TocConfiguration.prototype.Build = function () {
        var configuration = this.StartLine;
        configuration = configuration.concat("\n\t" + this._numberingKey + this.Numbering);
        configuration = configuration.concat("\n\t" + this._autoSaveKey + this.AutoSave);
        // configuration = configuration.concat("\n\t" + this._anchorKey + this.Anchor);
        // configuration = configuration.concat("\n\t" + this._minLevelKey + this.MinLevel);
        // configuration = configuration.concat("\n\t" + this._maxLevelKey + this.MaxLevel);
        configuration = configuration.concat("\n\t" + this.EndLine);
        return configuration;
    };
    TocConfiguration.prototype.readable = function (lineText, key) {
        return (lineText.startsWith(key));
    };
    TocConfiguration.prototype.toBoolean = function (lineText, key) {
        lineText = this.extractValue(lineText, key);
        return (lineText.startsWith("y") || lineText.startsWith("true"));
    };
    TocConfiguration.prototype.toNumber = function (lineText, key) {
        return Number.parseInt(this.extractValue(lineText, key));
    };
    TocConfiguration.prototype.extractValue = function (lineText, key) {
        return lineText.substr(key.length, (lineText.length - key.length)).trim().toLowerCase();
    };
    return TocConfiguration;
}());
/**
 * Header
 */
var Header = (function () {
    function Header(headerLevel, title, lineNumber, lineLength) {
        this.level = headerLevel;
        this.title = title;
        this.lineNumber = lineNumber;
        this.lineLength = lineLength;
        this.anchor = this.title.replace(/[^a-z0-9\-_:\.]|^[^a-z]+/gi, "");
    }
    Header.prototype.setAnchorUnique = function (index) {
        if (index > 0) {
            this.anchor = this.anchor + "-" + index;
        }
    };
    return Header;
}());
//# sourceMappingURL=extension.js.map