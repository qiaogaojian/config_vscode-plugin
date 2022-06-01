"use strict";Object.defineProperty(exports,"__esModule",{value:!0});const vscode_1=require("vscode"),fs=require("fs"),path=require("path");class Utilities{static readFile(e){if(fs.existsSync(e))return fs.readFileSync(e,"utf-8")}static getPath(e,t){let i=path.resolve(e.fsPath,"..",t);if(fs.existsSync(i))return vscode_1.Uri.file(i)}static getMethodNameIfInMethodRange(e,t){if(t<0||t>e.length||!e)return;let i=1,r=-1;for(let s=t;s>0;s--){let t=e.charAt(s);if(!Utilities.IsWhiteSpace(t)&&(")"===t?i++:"("===t&&i--,0==i)){r=s;break}}if(-1===r)return;let s=e.substring(0,r).trim(),a=-1;for(let e=r-1;e>0;e--){let t=s.charAt(e);if(Utilities.IsWhiteSpace(t)||"="===t||"("===t||","===t||";"===t){a=e;break}}return-1!==a?s.substring(a+1,r):void 0}static getFirstNonSpaceCharInvInText(e,t){if(!(t<0||t>e.length)&&e)for(let i=t;i>0;i--){let t=e.charAt(i);if(!Utilities.IsWhiteSpace(t))return t}}static getFirstNonSpaceTexInv(e,t){var i=e.lineAt(t.line).text;for(let r=t.character-1;r>0;r--){let s=i.charAt(r);if(!Utilities.IsWhiteSpace(s))return e.getText(e.getWordRangeAtPosition(new vscode_1.Position(t.line,r)))}}static getSecondNonSpaceTexInv(e,t){var i=e.lineAt(t.line).text;let r=1;for(let s=t.character-1;s>0;s--){let a=i.charAt(s);if(!Utilities.IsWhiteSpace(a)){if(!(r>0))return e.getText(e.getWordRangeAtPosition(new vscode_1.Position(t.line,s)));{let i=e.getWordRangeAtPosition(new vscode_1.Position(t.line,s));i&&(s=i.start.character,r--)}}}}static IsWhiteSpace(e){return" "===e||"\t"===e||"\r"===e||"\n"===e}static removeEmptyEntry(e){let t=[];return e&&e.forEach(e=>{e.trim()&&t.push(e)}),t}static GetFullRangeOfDocument(e){return e.validateRange(new vscode_1.Range(0,0,Number.MAX_VALUE,Number.MAX_VALUE))}}exports.default=Utilities;