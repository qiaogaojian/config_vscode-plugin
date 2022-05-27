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
 * @file iban-tests.ts
 * @author Josh Stevens <joshstevens19@hotmail.co.uk>
 * @date 2018
 */
Object.defineProperty(exports, "__esModule", { value: true });
const web3_eth_iban_1 = require("web3-eth-iban");
const iban = 'XE7338O073KYGTWWZN0F2WZ0R8PX5ZPPZS';
const address = '0x45cd08334aeedd8a06265b2ae302e3597d8faa28';
// $ExpectType Iban
const ibanClass = new web3_eth_iban_1.Iban(iban);
// $ExpectType boolean
ibanClass.isDirect();
// $ExpectType boolean
ibanClass.isIndirect();
// $ExpectType string
ibanClass.checksum();
// $ExpectType string
ibanClass.institution();
// $ExpectType string
ibanClass.client();
// $ExpectType string
ibanClass.toAddress();
// $ExpectType string
web3_eth_iban_1.Iban.toAddress(iban);
// $ExpectError
web3_eth_iban_1.Iban.toAddress(345);
// $ExpectError
web3_eth_iban_1.Iban.toAddress({});
// $ExpectError
web3_eth_iban_1.Iban.toAddress(true);
// $ExpectError
web3_eth_iban_1.Iban.toAddress(['string']);
// $ExpectError
web3_eth_iban_1.Iban.toAddress([4]);
// $ExpectError
web3_eth_iban_1.Iban.toAddress(null);
// $ExpectError
web3_eth_iban_1.Iban.toAddress(undefined);
// $ExpectType string
web3_eth_iban_1.Iban.toIban(address);
// $ExpectError
web3_eth_iban_1.Iban.toIban(345);
// $ExpectError
web3_eth_iban_1.Iban.toIban({});
// $ExpectError
web3_eth_iban_1.Iban.toIban(true);
// $ExpectError
web3_eth_iban_1.Iban.toIban(['string']);
// $ExpectError
web3_eth_iban_1.Iban.toIban([4]);
// $ExpectError
web3_eth_iban_1.Iban.toIban(null);
// $ExpectError
web3_eth_iban_1.Iban.toIban(undefined);
// $ExpectType Iban
web3_eth_iban_1.Iban.fromAddress(address);
// $ExpectError
web3_eth_iban_1.Iban.fromAddress(345);
// $ExpectError
web3_eth_iban_1.Iban.fromAddress({});
// $ExpectError
web3_eth_iban_1.Iban.fromAddress(true);
// $ExpectError
web3_eth_iban_1.Iban.fromAddress(['string']);
// $ExpectError
web3_eth_iban_1.Iban.fromAddress([4]);
// $ExpectError
web3_eth_iban_1.Iban.fromAddress(null);
// $ExpectError
web3_eth_iban_1.Iban.fromAddress(undefined);
// $ExpectType Iban
web3_eth_iban_1.Iban.fromBban('ETHXREGGAVOFYORK');
// $ExpectError
web3_eth_iban_1.Iban.fromBban(345);
// $ExpectError
web3_eth_iban_1.Iban.fromBban({});
// $ExpectError
web3_eth_iban_1.Iban.fromBban(true);
// $ExpectError
web3_eth_iban_1.Iban.fromBban(['string']);
// $ExpectError
web3_eth_iban_1.Iban.fromBban([4]);
// $ExpectError
web3_eth_iban_1.Iban.fromBban(null);
// $ExpectError
web3_eth_iban_1.Iban.fromBban(undefined);
const indirectOptions = {
    institution: 'XREG',
    identifier: 'GAVOFYORK'
};
// $ExpectType Iban
web3_eth_iban_1.Iban.createIndirect(indirectOptions);
// $ExpectError
web3_eth_iban_1.Iban.createIndirect(345);
// $ExpectError
web3_eth_iban_1.Iban.createIndirect('string');
// $ExpectError
web3_eth_iban_1.Iban.createIndirect(true);
// $ExpectError
web3_eth_iban_1.Iban.createIndirect(['string']);
// $ExpectError
web3_eth_iban_1.Iban.createIndirect([4]);
// $ExpectError
web3_eth_iban_1.Iban.createIndirect(null);
// $ExpectError
web3_eth_iban_1.Iban.createIndirect(undefined);
// $ExpectType boolean
web3_eth_iban_1.Iban.isValid(iban);
// $ExpectError
web3_eth_iban_1.Iban.isValid(345);
// $ExpectError
web3_eth_iban_1.Iban.isValid({});
// $ExpectError
web3_eth_iban_1.Iban.isValid(true);
// $ExpectError
web3_eth_iban_1.Iban.isValid(['string']);
// $ExpectError
web3_eth_iban_1.Iban.isValid([4]);
// $ExpectError
web3_eth_iban_1.Iban.isValid(null);
// $ExpectError
web3_eth_iban_1.Iban.isValid(undefined);
//# sourceMappingURL=iban-tests.js.map