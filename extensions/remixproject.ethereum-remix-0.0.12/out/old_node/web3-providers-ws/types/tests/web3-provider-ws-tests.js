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
 * @file web3-provider-ws-tests.ts
 * @author Josh Stevens <joshstevens19@hotmail.co.uk>
 * @date 2018
 */
Object.defineProperty(exports, "__esModule", { value: true });
const web3_providers_1 = require("web3-providers");
const options = {
    timeout: 30000,
    headers: {
        authorization: 'Basic username:password'
    }
};
const wsProvider = new web3_providers_1.WebsocketProvider('ws://localhost:8545', options);
// $ExpectType boolean
wsProvider.isConnecting();
// $ExpectType boolean
wsProvider.connected;
// $ExpectType void
wsProvider.disconnect(100, 'reason');
// $ExpectType any
wsProvider.responseCallbacks;
// $ExpectType any
wsProvider.notificationCallbacks;
// $ExpectType any
wsProvider.connection;
// $ExpectType boolean
wsProvider.connected;
// $ExpectType void
wsProvider.addDefaultEvents();
// $ExpectType boolean
wsProvider.supportsSubscriptions();
// $ExpectType void
wsProvider.send({}, (error) => { });
// $ExpectType void
wsProvider.send({}, (error, result) => { });
// $ExpectType void
wsProvider.on('type', () => { });
// $ExpectType void
wsProvider.once('type', () => { });
// $ExpectType void
wsProvider.removeListener('type', () => { });
// $ExpectType void
wsProvider.removeAllListeners('type');
// $ExpectType void
wsProvider.reset();
//# sourceMappingURL=web3-provider-ws-tests.js.map