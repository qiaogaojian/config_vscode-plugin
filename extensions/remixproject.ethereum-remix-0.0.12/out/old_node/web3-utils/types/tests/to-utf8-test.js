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
 * @file to-utf8-test.ts
 * @author Josh Stevens <joshstevens19@hotmail.co.uk>
 * @date 2018
 */
Object.defineProperty(exports, "__esModule", { value: true });
const BN = require("bn.js");
const web3_utils_1 = require("web3-utils");
// $ExpectType string
web3_utils_1.toUtf8('0x49206861766520313030e282ac');
// $ExpectError
web3_utils_1.toUtf8(656);
// $ExpectError
web3_utils_1.toUtf8(new BN(3));
// $ExpectError
web3_utils_1.toUtf8(['string']);
// $ExpectError
web3_utils_1.toUtf8([4]);
// $ExpectError
web3_utils_1.toUtf8({});
// $ExpectError
web3_utils_1.toUtf8(true);
// $ExpectError
web3_utils_1.toUtf8(null);
// $ExpectError
web3_utils_1.toUtf8(undefined);
//# sourceMappingURL=to-utf8-test.js.map