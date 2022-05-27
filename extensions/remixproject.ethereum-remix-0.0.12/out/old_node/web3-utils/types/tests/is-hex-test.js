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
 * @file is-hex-test.ts
 * @author Josh Stevens <joshstevens19@hotmail.co.uk>
 * @date 2018
 */
Object.defineProperty(exports, "__esModule", { value: true });
const BN = require("bn.js");
const web3_utils_1 = require("web3-utils");
// $ExpectType boolean
web3_utils_1.isHex('0xc1912');
// $ExpectType boolean
web3_utils_1.isHex(345);
// $ExpectError
web3_utils_1.isHex(new BN(3));
// $ExpectError
web3_utils_1.isHex({});
// $ExpectError
web3_utils_1.isHex(true);
// $ExpectError
web3_utils_1.isHex(['string']);
// $ExpectError
web3_utils_1.isHex([4]);
// $ExpectError
web3_utils_1.isHex(null);
// $ExpectError
web3_utils_1.isHex(undefined);
//# sourceMappingURL=is-hex-test.js.map