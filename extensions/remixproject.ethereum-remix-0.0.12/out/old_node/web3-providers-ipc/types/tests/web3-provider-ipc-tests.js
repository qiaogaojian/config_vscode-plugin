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
 * @file web3-provider-ipc-tests.ts
 * @author Josh Stevens <joshstevens19@hotmail.co.uk>
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
Object.defineProperty(exports, "__esModule", { value: true });
const net = __importStar(require("net"));
const web3_providers_1 = require("web3-providers");
const ipcProvider = new web3_providers_1.IpcProvider('/Users/myuser/Library/Ethereum/geth.ipc', new net.Server());
// $ExpectType any
ipcProvider.responseCallbacks;
// $ExpectType any
ipcProvider.notificationCallbacks;
// $ExpectType any
ipcProvider.connection;
// $ExpectType boolean
ipcProvider.connected;
// $ExpectType void
ipcProvider.addDefaultEvents();
// $ExpectType boolean
ipcProvider.supportsSubscriptions();
// $ExpectType void
ipcProvider.send({}, (error) => { });
// $ExpectType void
ipcProvider.send({}, (error, result) => { });
// $ExpectType void
ipcProvider.on('type', () => { });
// $ExpectType void
ipcProvider.once('type', () => { });
// $ExpectType void
ipcProvider.removeListener('type', () => { });
// $ExpectType void
ipcProvider.removeAllListeners('type');
// $ExpectType void
ipcProvider.reset();
// $ExpectType void
ipcProvider.reconnect();
//# sourceMappingURL=web3-provider-ipc-tests.js.map