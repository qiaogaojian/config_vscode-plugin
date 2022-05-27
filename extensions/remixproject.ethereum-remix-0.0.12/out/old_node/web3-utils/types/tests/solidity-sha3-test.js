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
 * @file solidity-sha3-test.ts
 * @author Josh Stevens <joshstevens19@hotmail.co.uk>
 * @date 2018
 */
Object.defineProperty(exports, "__esModule", { value: true });
const BN = require("bn.js");
const web3_utils_1 = require("web3-utils");
// $ExpectType string
web3_utils_1.soliditySha3('234564535', '0xfff23243', true, -10);
// $ExpectType string
web3_utils_1.soliditySha3('Hello!%');
// $ExpectType string
web3_utils_1.soliditySha3('234');
// $ExpectType string
web3_utils_1.soliditySha3(0xea);
// $ExpectType string
web3_utils_1.soliditySha3(new BN(3));
// $ExpectType string
web3_utils_1.soliditySha3({ type: 'uint256', value: '234' });
// $ExpectType string
web3_utils_1.soliditySha3({ t: 'uint', v: new BN('234') });
// $ExpectType string
web3_utils_1.soliditySha3({ t: 'string', v: 'Hello!%' }, { t: 'int8', v: -23 }, { t: 'address', v: '0x85F43D8a49eeB85d32Cf465507DD71d507100C1d' });
// $ExpectType string
web3_utils_1.soliditySha3('0x407D73d8a49eeb85D32Cf465507dd71d507100c1');
// $ExpectError
web3_utils_1.soliditySha3(['hey']);
// $ExpectError
web3_utils_1.soliditySha3([34]);
// $ExpectError
web3_utils_1.soliditySha3(null);
// $ExpectError
web3_utils_1.soliditySha3(undefined);
//# sourceMappingURL=solidity-sha3-test.js.map