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
 * @file ens-test.ts
 * @author Samuel Furter <samuel@ethereum.org>, Josh Stevens <joshstevens19@hotmail.co.uk>
 * @date 2018
 */
Object.defineProperty(exports, "__esModule", { value: true });
const web3_eth_ens_1 = require("web3-eth-ens");
const web3_eth_1 = require("web3-eth");
const ens = new web3_eth_ens_1.Ens(new web3_eth_1.Eth('http://localhost:8545'));
// $ExpectType string | null
ens.registryAddress;
// $ExpectType Registry
ens.registry;
// $ExpectType Promise<Contract>
ens.resolver('name');
// $ExpectType Promise<Contract>
ens.resolver('name', (value) => { });
// $ExpectType Promise<Contract>
ens.resolver('name', (error, contract) => { });
// $ExpectType Promise<Contract>
ens.getResolver('name');
// $ExpectType Promise<Contract>
ens.getResolver('name', (error, contract) => { });
// $ExpectType Promise<Contract>
ens.getResolver('name', (value) => { });
// $ExpectType PromiEvent<TransactionReceipt | TransactionRevertInstructionError>
ens.setResolver('name', '0x0...');
// $ExpectType PromiEvent<TransactionReceipt | TransactionRevertInstructionError>
ens.setResolver('name', '0x0...', {});
// $ExpectType PromiEvent<TransactionReceipt | TransactionRevertInstructionError>
ens.setResolver('name', '0x0...', {}, (error, receipt) => { });
// $ExpectType PromiEvent<TransactionReceipt | TransactionRevertInstructionError>
ens.setSubnodeOwner('name', 'label', '0x...');
// $ExpectType PromiEvent<TransactionReceipt | TransactionRevertInstructionError>
ens.setSubnodeOwner('name', 'label', '0x...', {});
// $ExpectType PromiEvent<TransactionReceipt | TransactionRevertInstructionError>
ens.setSubnodeOwner('name', 'label', '0x...', {}, (error, receipt) => { });
// $ExpectType PromiEvent<TransactionReceipt | TransactionRevertInstructionError>
ens.setRecord('name', 'owner', 'resolver', '100000');
// $ExpectType PromiEvent<TransactionReceipt | TransactionRevertInstructionError>
ens.setRecord('name', 'owner', 'resolver', 100000);
// $ExpectType PromiEvent<TransactionReceipt | TransactionRevertInstructionError>
ens.setRecord('name', 'owner', 'resolver', 100000, {});
// $ExpectType PromiEvent<TransactionReceipt | TransactionRevertInstructionError>
ens.setRecord('name', 'owner', 'resolver', 100000, {}, (error, receipt) => { });
// $ExpectType PromiEvent<TransactionReceipt | TransactionRevertInstructionError>
ens.setSubnodeRecord('name', 'label', 'owner', 'resolver', '100000');
// $ExpectType PromiEvent<TransactionReceipt | TransactionRevertInstructionError>
ens.setSubnodeRecord('name', 'label', 'owner', 'resolver', 100000);
// $ExpectType PromiEvent<TransactionReceipt | TransactionRevertInstructionError>
ens.setSubnodeRecord('name', 'label', 'owner', 'resolver', 100000, {});
// $ExpectType PromiEvent<TransactionReceipt | TransactionRevertInstructionError>
ens.setSubnodeRecord('name', 'label', 'owner', 'resolver', 100000, {}, (error, receipt) => { });
// $ExpectType PromiEvent<TransactionReceipt | TransactionRevertInstructionError>
ens.setApprovalForAll('name', true);
// $ExpectType PromiEvent<TransactionReceipt | TransactionRevertInstructionError>
ens.setApprovalForAll('name', false, {});
// $ExpectType PromiEvent<TransactionReceipt | TransactionRevertInstructionError>
ens.setApprovalForAll('name', true, {}, (error, receipt) => { });
// $ExpectType Promise<boolean>
ens.isApprovedForAll('owner', 'operator');
// $ExpectType Promise<boolean>
ens.isApprovedForAll('owner', 'operator', (error, result) => { });
// $ExpectType Promise<boolean>
ens.isApprovedForAll('owner', 'operator', (value) => { });
// $ExpectType Promise<boolean>
ens.recordExists('name');
// $ExpectType Promise<boolean>
ens.recordExists('name', (error, result) => { });
// $ExpectType Promise<boolean>
ens.recordExists('name', (value) => { });
// $ExpectType Promise<string>
ens.getTTL('name');
// $ExpectType Promise<string>
ens.getTTL('name', (error, ttl) => { });
// $ExpectType Promise<string>
ens.getTTL('name', (value) => { });
// $ExpectType PromiEvent<TransactionReceipt | TransactionRevertInstructionError>
ens.setTTL('name', 10000);
// $ExpectType PromiEvent<TransactionReceipt | TransactionRevertInstructionError>
ens.setTTL('name', 10000, {});
// $ExpectType PromiEvent<TransactionReceipt | TransactionRevertInstructionError>
ens.setTTL('name', '0xa', {}, (error, receipt) => { });
// $ExpectType Promise<string>
ens.getOwner('name');
// $ExpectType Promise<string>
ens.getOwner('name', (value) => { });
// $ExpectType Promise<string>
ens.getOwner('name', (error, owner) => { });
// $ExpectType PromiEvent<TransactionReceipt | TransactionRevertInstructionError>
ens.setOwner('name', '0x...');
// $ExpectType PromiEvent<TransactionReceipt | TransactionRevertInstructionError>
ens.setOwner('name', '0x...', {});
// $ExpectType PromiEvent<TransactionReceipt | TransactionRevertInstructionError>
ens.setOwner('name', '0x...', {}, (error, receipt) => { });
// $ExpectType Promise<boolean>
ens.supportsInterface('name', 'interfaceId');
// $ExpectType Promise<boolean>
ens.supportsInterface('name', 'interfaceId', (error, supportsInterface) => { });
// $ExpectType Promise<boolean>
ens.supportsInterface('name', 'interfaceId', (value) => { });
// $ExpectType Promise<string>
ens.getAddress('name');
// $ExpectType Promise<string>
ens.getAddress('name', (error, address) => { });
// $ExpectType Promise<string>
ens.getAddress('name', (value) => { });
// $ExpectType PromiEvent<TransactionReceipt | TransactionRevertInstructionError>
ens.setAddress('name', 'address');
// $ExpectType PromiEvent<TransactionReceipt | TransactionRevertInstructionError>
ens.setAddress('name', 'address', {});
// $ExpectType PromiEvent<TransactionReceipt | TransactionRevertInstructionError>
ens.setAddress('name', 'address', {}, (error, result) => { });
// $ExpectType Promise<{ [x: string]: string; }>
ens.getPubkey('name');
// $ExpectType Promise<{ [x: string]: string; }>
ens.getPubkey('name', (error, result) => { });
// $ExpectType Promise<{ [x: string]: string; }>
ens.getPubkey('name', (value) => { });
// $ExpectType PromiEvent<TransactionReceipt | TransactionRevertInstructionError>
ens.setPubkey('name', 'x', 'y');
// $ExpectType PromiEvent<TransactionReceipt | TransactionRevertInstructionError>
ens.setPubkey('name', 'x', 'y', {});
// $ExpectType PromiEvent<TransactionReceipt | TransactionRevertInstructionError>
ens.setPubkey('name', 'x', 'y', {}, (error, result) => { });
// $ExpectType Promise<string>
ens.getText('name', 'key');
// $ExpectType Promise<string>
ens.getText('name', 'key', (error, ensName) => { });
// $ExpectType Promise<string>
ens.getText('name', 'key', (value) => { });
// $ExpectType PromiEvent<TransactionReceipt | TransactionRevertInstructionError>
ens.setText('name', 'key', 'value');
// $ExpectType PromiEvent<TransactionReceipt | TransactionRevertInstructionError>
ens.setText('name', 'key', 'value', {});
// $ExpectType PromiEvent<TransactionReceipt | TransactionRevertInstructionError>
ens.setText('name', 'key', 'value', {}, (error, result) => { });
// $ExpectType Promise<string>
ens.getContent('name');
// $ExpectType Promise<string>
ens.getContent('name', (error, contentHash) => { });
// $ExpectType Promise<string>
ens.getContent('name', (value) => { });
// $ExpectType PromiEvent<TransactionReceipt | TransactionRevertInstructionError>
ens.setContent('name', 'hash');
// $ExpectType PromiEvent<TransactionReceipt | TransactionRevertInstructionError>
ens.setContent('name', 'hash', {});
// $ExpectType PromiEvent<TransactionReceipt | TransactionRevertInstructionError>
ens.setContent('name', 'hash', {}, (error, result) => { });
// $ExpectType Promise<string>
ens.getMultihash('name');
// $ExpectType Promise<string>
ens.getMultihash('name', (error, multihash) => { });
// $ExpectType Promise<string>
ens.getMultihash('name', (value) => { });
// $ExpectType PromiEvent<TransactionReceipt | TransactionRevertInstructionError>
ens.setMultihash('name', 'hash');
// $ExpectType PromiEvent<TransactionReceipt | TransactionRevertInstructionError>
ens.setMultihash('name', 'hash', {}, (error, result) => { });
// $ExpectType PromiEvent<TransactionReceipt | TransactionRevertInstructionError>
ens.setMultihash('name', 'hash', {});
// $ExpectType Promise<ContentHash>
ens.getContenthash('name');
// $ExpectType Promise<ContentHash>
ens.getContenthash('name', (error, contenthash) => { });
// $ExpectType Promise<ContentHash>
ens.getContenthash('name', (value) => { });
// $ExpectType PromiEvent<TransactionReceipt | TransactionRevertInstructionError>
ens.setContenthash('name', 'hash');
// $ExpectType PromiEvent<TransactionReceipt | TransactionRevertInstructionError>
ens.setContenthash('name', 'hash', {});
// $ExpectType PromiEvent<TransactionReceipt | TransactionRevertInstructionError>
ens.setContenthash('name', 'hash', {}, (error, result) => { });
//# sourceMappingURL=ens-test.js.map