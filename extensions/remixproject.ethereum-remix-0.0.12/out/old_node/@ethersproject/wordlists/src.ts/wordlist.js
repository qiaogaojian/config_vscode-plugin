"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wordlist = exports.logger = void 0;
// This gets overridden by rollup
const exportWordlist = false;
const hash_1 = require("@ethersproject/hash");
const properties_1 = require("@ethersproject/properties");
const logger_1 = require("@ethersproject/logger");
const _version_1 = require("./_version");
exports.logger = new logger_1.Logger(_version_1.version);
class Wordlist {
    constructor(locale) {
        exports.logger.checkAbstract(new.target, Wordlist);
        properties_1.defineReadOnly(this, "locale", locale);
    }
    // Subclasses may override this
    split(mnemonic) {
        return mnemonic.toLowerCase().split(/ +/g);
    }
    // Subclasses may override this
    join(words) {
        return words.join(" ");
    }
    static check(wordlist) {
        const words = [];
        for (let i = 0; i < 2048; i++) {
            const word = wordlist.getWord(i);
            /* istanbul ignore if */
            if (i !== wordlist.getWordIndex(word)) {
                return "0x";
            }
            words.push(word);
        }
        return hash_1.id(words.join("\n") + "\n");
    }
    static register(lang, name) {
        if (!name) {
            name = lang.locale;
        }
        /* istanbul ignore if */
        if (exportWordlist) {
            try {
                const anyGlobal = window;
                if (anyGlobal._ethers && anyGlobal._ethers.wordlists) {
                    if (!anyGlobal._ethers.wordlists[name]) {
                        properties_1.defineReadOnly(anyGlobal._ethers.wordlists, name, lang);
                    }
                }
            }
            catch (error) { }
        }
    }
}
exports.Wordlist = Wordlist;
//# sourceMappingURL=wordlist.js.map