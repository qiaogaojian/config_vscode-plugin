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
 * @file get-signature-params-tests.ts
 * @author Aalok Singh <aalok_2@live.com>
 * @date 2018
 */
Object.defineProperty(exports, "__esModule", { value: true });
const BN = require("bn.js");
const web3_utils_1 = require("web3-utils");
// $ExpectType { r: string; s: string; v: number; }
web3_utils_1.getSignatureParameters('0x90dc0e49b5a80eef86fcedcb863dcc727aeae5c11187c001fd3d18780ead2cc7701ba1986099a49164702f3d8b2c8dbbd45a6d1beb37d212d21fb1be4bb762a400');
// $ExpectError
web3_utils_1.getSignatureParameters(345);
// $ExpectError
web3_utils_1.getSignatureParameters(new BN(3));
// $ExpectError
web3_utils_1.getSignatureParameters({});
// $ExpectError
web3_utils_1.getSignatureParameters(true);
// $ExpectError
web3_utils_1.getSignatureParameters(['string']);
// $ExpectError
web3_utils_1.getSignatureParameters([4]);
// $ExpectError
web3_utils_1.getSignatureParameters(null);
// $ExpectError
web3_utils_1.getSignatureParameters(undefined);
//# sourceMappingURL=get-signature-params-test.js.map