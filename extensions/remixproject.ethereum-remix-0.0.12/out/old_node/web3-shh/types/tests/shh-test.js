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
 * @file shh-tests.ts
 * @author Josh Stevens <joshstevens19@hotmail.co.uk>
 * @date 2018
 */
Object.defineProperty(exports, "__esModule", { value: true });
const web3_shh_1 = require("web3-shh");
// $ExpectType Shh
const shh_empty = new web3_shh_1.Shh();
// $ExpectType Shh
const shh = new web3_shh_1.Shh('https://localhost:5000');
// $ExpectType provider
shh.currentProvider;
// $ExpectType any
web3_shh_1.Shh.givenProvider;
// $ExpectType any
shh.givenProvider;
// $ExpectType boolean
shh.setProvider('https://localhost:2100');
// $ExpectType BatchRequest
new shh.BatchRequest();
// $ExpectType any
shh.extend({ property: 'test', methods: [{ name: 'method', call: 'method' }] });
// $ExpectType Promise<number>
shh.net.getId();
// $ExpectType Promise<number>
shh.net.getId((error, id) => { });
// $ExpectType Promise<boolean>
shh.net.isListening();
// $ExpectType Promise<boolean>
shh.net.isListening((error, listening) => { });
// $ExpectType Promise<number>
shh.net.getPeerCount();
// $ExpectType Promise<number>
shh.net.getPeerCount((error, peerCount) => { });
// $ExpectType Promise<string>
shh.getVersion();
// $ExpectType Promise<string>
shh.getVersion((error, version) => { });
// $ExpectType Promise<Info>
shh.getInfo();
// $ExpectType Promise<Info>
shh.getInfo((error, info) => { });
// $ExpectType Promise<boolean>
shh.setMaxMessageSize(1234565);
// $ExpectType Promise<boolean>
shh.setMaxMessageSize(1234565, (error, result) => { });
// $ExpectType Promise<boolean>
shh.setMinPoW(0.9);
// $ExpectType Promise<boolean>
shh.setMinPoW(0.9, (error, result) => { });
// $ExpectType Promise<boolean>
shh.markTrustedPeer('test');
// $ExpectType Promise<boolean>
shh.markTrustedPeer('test', (error, result) => { });
// $ExpectType Promise<string>
shh.newKeyPair();
// $ExpectType Promise<string>
shh.newKeyPair((error, key) => { });
// $ExpectType Promise<string>
shh.addPrivateKey('0x8bda3abeb454847b515fa9b404cede50b1cc63cfdeddd4999d074284b4c21e15');
// $ExpectType Promise<string>
shh.addPrivateKey('0x8bda3abeb454847b515fa9b404cede50b1cc63cfdeddd4999d074284b4c21e15', (error, privateKey) => { });
// $ExpectType Promise<boolean>
shh.deleteKeyPair('3e22b9ffc2387e18636e0a3d0c56b023264c16e78a2adcba1303cefc685e610f');
// $ExpectType Promise<boolean>
shh.deleteKeyPair('3e22b9ffc2387e18636e0a3d0c56b023264c16e78a2adcba1303cefc685e610f', (error, result) => { });
// $ExpectType Promise<boolean>
shh.hasKeyPair('fe22b9ffc2387e18636e0a3d0c56b023264c16e78a2adcba1303cefc685e610f');
// $ExpectType Promise<boolean>
shh.hasKeyPair('fe22b9ffc2387e18636e0a3d0c56b023264c16e78a2adcba1303cefc685e610f', (error, result) => { });
// $ExpectType Promise<string>
shh.getPublicKey('3e22b9ffc2387e18636e0a3d0c56b023264c16e78a2adcba1303cefc685e610f');
// $ExpectType Promise<string>
shh.getPublicKey('3e22b9ffc2387e18636e0a3d0c56b023264c16e78a2adcba1303cefc685e610f', (error, publicKey) => { });
// $ExpectType Promise<string>
shh.getPrivateKey('3e22b9ffc2387e18636e0a3d0c56b023264c16e78a2adcba1303cefc685e610f');
// $ExpectType Promise<string>
shh.getPrivateKey('3e22b9ffc2387e18636e0a3d0c56b023264c16e78a2adcba1303cefc685e610f', (error, privateKey) => { });
// $ExpectType Promise<string>
shh.newSymKey();
// $ExpectType Promise<string>
shh.newSymKey((error, key) => { });
// $ExpectType Promise<string>
shh.addSymKey('0x5e11b9ffc2387e18636e0a3d0c56b023264c16e78a2adcba1303cefc685e610f');
// $ExpectType Promise<string>
shh.addSymKey('0x5e11b9ffc2387e18636e0a3d0c56b023264c16e78a2adcba1303cefc685e610f', (error, key) => { });
// $ExpectType Promise<string>
shh.generateSymKeyFromPassword('Never use this password - password!');
// $ExpectType Promise<string>
shh.generateSymKeyFromPassword('Never use this password - password!', (error, key) => { });
// $ExpectType Promise<boolean>
shh.hasSymKey('f6dcf21ed6a17bd78d8c4c63195ab997b3b65ea683705501eae82d32667adc92');
// $ExpectType Promise<boolean>
shh.hasSymKey('f6dcf21ed6a17bd78d8c4c63195ab997b3b65ea683705501eae82d32667adc92', (error, result) => { });
// $ExpectType Promise<string>
shh.getSymKey('af33b9ffc2387e18636e0a3d0c56b023264c16e78a2adcba1303cefc685e610f');
// $ExpectType Promise<string>
shh.getSymKey('af33b9ffc2387e18636e0a3d0c56b023264c16e78a2adcba1303cefc685e610f', (error, key) => { });
// $ExpectType Promise<boolean>
shh.deleteSymKey('bf31b9ffc2387e18636e0a3d0c56b023264c16e78a2adcba1303cefc685e610f');
// $ExpectType Promise<boolean>
shh.deleteSymKey('bf31b9ffc2387e18636e0a3d0c56b023264c16e78a2adcba1303cefc685e610f', (error, result) => { });
// $ExpectType Promise<string>
shh.post({
    symKeyID: 'sd3',
    sig: 'sds5',
    ttl: 10,
    topic: '0xffaadd11',
    payload: '0xffffffdddddd1122',
    powTime: 3,
    powTarget: 0.5
});
// $ExpectType Promise<string>
shh.post({
    symKeyID: 'sd3',
    sig: 'sds5',
    ttl: 10,
    topic: '0xffaadd11',
    payload: '0xffffffdddddd1122',
    powTime: 3,
    powTarget: 0.5
}, (error, result) => { });
// $ExpectType Subscribe
shh.subscribe('messages', {
    symKeyID: 'bf31b9ffc2387e18636e0a3d0c56b023264c16e78a2adcba1303cefc685e610f',
    sig: '0x04d1574d4eab8f3dde4d2dc7ed2c4d699d77cbbdd09167b8fffa099652ce4df00c4c6e0263eafe05007a46fdf0c8d32b11aeabcd3abbc7b2bc2bb967368a68e9c6',
    ttl: 20,
    topics: ['0xffddaa11'],
    minPow: 0.8
});
// $ExpectType Subscribe
shh.subscribe('messages', {
    symKeyID: 'bf31b9ffc2387e18636e0a3d0c56b023264c16e78a2adcba1303cefc685e610f',
    sig: '0x04d1574d4eab8f3dde4d2dc7ed2c4d699d77cbbdd09167b8fffa099652ce4df00c4c6e0263eafe05007a46fdf0c8d32b11aeabcd3abbc7b2bc2bb967368a68e9c6',
    ttl: 20,
    topics: ['0xffddaa11'],
    minPow: 0.8
}, (error, message, subscription) => { });
// $ExpectType Promise<string>
shh.newMessageFilter();
// $ExpectType Promise<boolean>
shh.deleteMessageFilter('2b47fbafb3cce24570812a82e6e93cd9e2551bbc4823f6548ff0d82d2206b326');
// $ExpectType Promise<Notification[]>
shh.getFilterMessages('2b47fbafb3cce24570812a82e6e93cd9e2551bbc4823f6548ff0d82d2206b326');
//# sourceMappingURL=shh-test.js.map