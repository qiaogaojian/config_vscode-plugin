"use strict";
/*
    This file is part of web3.js.
    web3.js is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.
    web3.js is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.
    You should have received a copy of the GNU Lesser General Public License
    along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
*/
/**
 * @file web3-test.ts
 * @author Josh Stevens <joshstevens19@hotmail.co.uk>, Samuel Furter <samuel@ethereum.org>
 * @date 2018
 */
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
const web3_1 = __importDefault(require("web3"));
const net = __importStar(require("net"));
// $ExpectType Utils
web3_1.default.utils;
// $ExpectType string
web3_1.default.version;
// $ExpectType Modules
web3_1.default.modules;
// $ExpectType Providers
web3_1.default.providers;
// $ExpectType any
web3_1.default.givenProvider;
// $ExpectType Web3
const web3_empty = new web3_1.default();
// $ExpectType Web3
let web3 = new web3_1.default('https://localhost:5000/');
// $ExpectType provider
web3.currentProvider;
// $ExpectType any
web3.extend({ property: 'test', methods: [{ name: 'method', call: 'method' }] });
// $ExpectType any
web3.givenProvider;
// $ExpectType string | null
web3.defaultAccount;
// $ExpectType string | number
web3.defaultBlock;
// $ExpectType boolean
web3.setProvider('https://localhost:2100');
// $ExpectType BatchRequest
new web3.BatchRequest();
// $ExpectType Utils
web3.utils;
// $ExpectType string
web3.version;
// $ExpectType Eth
web3.eth;
// $ExpectType Shh
web3.shh;
// $ExpectType Bzz
web3.bzz;
// $ExpectType Socket
const netSocket = new net.Socket();
// $ExpectType Web3
web3 = new web3_1.default('https://localhost:5000/', netSocket);
// $ExpectType Web3
web3 = new web3_1.default();
class CustomProvider1 {
    sendAsync(payload, callback) { }
}
// $ExpectType Web3
web3 = new web3_1.default(new CustomProvider1());
class CustomProvider2 {
    send(payload, callback) { }
    sendAsync(payload, callback) { }
}
// $ExpectType Web3
web3 = new web3_1.default(new CustomProvider2());
class CustomProvider3 {
    request(args) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    sendAsync(payload, callback) { }
}
// $ExpectType Web3
web3 = new web3_1.default(new CustomProvider3());
//# sourceMappingURL=web3-test.js.map