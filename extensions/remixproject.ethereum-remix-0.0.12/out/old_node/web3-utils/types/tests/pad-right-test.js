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
 * @file pad-right-test.ts
 * @author Josh Stevens <joshstevens19@hotmail.co.uk>
 * @date 2018
 */
Object.defineProperty(exports, "__esModule", { value: true });
const BN = require("bn.js");
const web3_utils_1 = require("web3-utils");
const bigNumber = new BN(3);
// $ExpectType string
web3_utils_1.padRight('0x3456ff', 20);
// $ExpectType string
web3_utils_1.padRight(0x3456ff, 20);
// $ExpectType string
web3_utils_1.padRight('Hello', 20, 'x');
// $ExpectError
web3_utils_1.padRight(bigNumber, 20);
// $ExpectError
web3_utils_1.padRight(['string'], 20);
// $ExpectError
web3_utils_1.padRight([4], 20);
// $ExpectError
web3_utils_1.padRight({}, 20);
// $ExpectError
web3_utils_1.padRight(true, 20);
// $ExpectError
web3_utils_1.padRight(null, 20);
// $ExpectError
web3_utils_1.padRight(undefined, 20);
// $ExpectError
web3_utils_1.padRight('0x3456ff', bigNumber);
// $ExpectError
web3_utils_1.padRight('0x3456ff', ['string']);
// $ExpectError
web3_utils_1.padRight('0x3456ff', [4]);
// $ExpectError
web3_utils_1.padRight('0x3456ff', {});
// $ExpectError
web3_utils_1.padRight('0x3456ff', true);
// $ExpectError
web3_utils_1.padRight('0x3456ff', null);
// $ExpectError
web3_utils_1.padRight('0x3456ff', undefined);
// $ExpectError
web3_utils_1.padRight('Hello', 20, bigNumber);
// $ExpectError
web3_utils_1.padRight('Hello', 20, ['string']);
// $ExpectError
web3_utils_1.padRight('Hello', 20, [4]);
// $ExpectError
web3_utils_1.padRight('Hello', 20, {});
// $ExpectError
web3_utils_1.padRight('Hello', 20, true);
// $ExpectError
web3_utils_1.padRight('Hello', 20, null);
//# sourceMappingURL=pad-right-test.js.map