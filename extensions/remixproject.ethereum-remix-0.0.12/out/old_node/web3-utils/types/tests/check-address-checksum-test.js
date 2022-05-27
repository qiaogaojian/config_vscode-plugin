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
 * @file check-address-checksum-test.ts
 * @author Josh Stevens <joshstevens19@hotmail.co.uk>
 * @date 2018
 */
Object.defineProperty(exports, "__esModule", { value: true });
const BN = require("bn.js");
const web3_utils_1 = require("web3-utils");
// $ExpectType boolean
web3_utils_1.checkAddressChecksum('0x8ee7f17bb3f88b01247c21ab6603880b64ae53e811f5e01138822e558cf1ab51');
// $ExpectType boolean
web3_utils_1.checkAddressChecksum('0xFb6916095CA1dF60bb79CE92ce3Ea74C37c5D359', 31);
// $ExpectType boolean
web3_utils_1.checkAddressChecksum('0xFb6916095CA1dF60bb79CE92ce3Ea74C37c5D359', undefined);
// $ExpectError
web3_utils_1.checkAddressChecksum([4]);
// $ExpectError
web3_utils_1.checkAddressChecksum(['string']);
// $ExpectError
web3_utils_1.checkAddressChecksum(345);
// $ExpectError
web3_utils_1.checkAddressChecksum(new BN(3));
// $ExpectError
web3_utils_1.checkAddressChecksum({});
// $ExpectError
web3_utils_1.checkAddressChecksum(true);
// $ExpectError
web3_utils_1.checkAddressChecksum(null);
// $ExpectError
web3_utils_1.checkAddressChecksum(undefined);
// $ExpectError
web3_utils_1.checkAddressChecksum('0xd1220a0cf47c7b9be7a2e6ba89f429762e7b9adb', 'string');
// $ExpectError
web3_utils_1.checkAddressChecksum('0xd1220a0cf47c7b9be7a2e6ba89f429762e7b9adb', [4]);
// $ExpectError
web3_utils_1.checkAddressChecksum('0xd1220a0cf47c7b9be7a2e6ba89f429762e7b9adb', new BN(3));
// $ExpectError
web3_utils_1.checkAddressChecksum('0xd1220a0cf47c7b9be7a2e6ba89f429762e7b9adb', {});
// $ExpectError
web3_utils_1.checkAddressChecksum('0xd1220a0cf47c7b9be7a2e6ba89f429762e7b9adb', true);
// $ExpectError
web3_utils_1.checkAddressChecksum('0xd1220a0cf47c7b9be7a2e6ba89f429762e7b9adb', null);
//# sourceMappingURL=check-address-checksum-test.js.map