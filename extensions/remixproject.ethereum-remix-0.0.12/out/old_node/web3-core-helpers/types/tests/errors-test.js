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
 * @file errors-test.ts
 * @author Josh Stevens <joshstevens19@hotmail.co.uk>
 * @date 2019
 */
Object.defineProperty(exports, "__esModule", { value: true });
const web3_core_helpers_1 = require("web3-core-helpers");
// $ExpectType Error
web3_core_helpers_1.errors.ErrorResponse(new Error('hey'));
// $ExpectType Error
web3_core_helpers_1.errors.InvalidNumberOfParams(1, 3, 'method');
// $ExpectType Error
web3_core_helpers_1.errors.InvalidConnection('https://localhost:2345432');
// $ExpectType Error
web3_core_helpers_1.errors.InvalidProvider();
// $ExpectType Error
web3_core_helpers_1.errors.InvalidResponse(new Error('hey'));
// $ExpectType Error
web3_core_helpers_1.errors.ConnectionTimeout('timeout');
//# sourceMappingURL=errors-test.js.map