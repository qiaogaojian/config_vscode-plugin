"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Provider = exports.TransactionOrderForkEvent = exports.TransactionForkEvent = exports.BlockForkEvent = exports.ForkEvent = void 0;
const bytes_1 = require("@ethersproject/bytes");
const properties_1 = require("@ethersproject/properties");
const logger_1 = require("@ethersproject/logger");
const _version_1 = require("./_version");
const logger = new logger_1.Logger(_version_1.version);
;
;
//export type CallTransactionable = {
//    call(transaction: TransactionRequest): Promise<TransactionResponse>;
//};
class ForkEvent extends properties_1.Description {
    static isForkEvent(value) {
        return !!(value && value._isForkEvent);
    }
}
exports.ForkEvent = ForkEvent;
class BlockForkEvent extends ForkEvent {
    constructor(blockHash, expiry) {
        if (!bytes_1.isHexString(blockHash, 32)) {
            logger.throwArgumentError("invalid blockHash", "blockHash", blockHash);
        }
        super({
            _isForkEvent: true,
            _isBlockForkEvent: true,
            expiry: (expiry || 0),
            blockHash: blockHash
        });
    }
}
exports.BlockForkEvent = BlockForkEvent;
class TransactionForkEvent extends ForkEvent {
    constructor(hash, expiry) {
        if (!bytes_1.isHexString(hash, 32)) {
            logger.throwArgumentError("invalid transaction hash", "hash", hash);
        }
        super({
            _isForkEvent: true,
            _isTransactionForkEvent: true,
            expiry: (expiry || 0),
            hash: hash
        });
    }
}
exports.TransactionForkEvent = TransactionForkEvent;
class TransactionOrderForkEvent extends ForkEvent {
    constructor(beforeHash, afterHash, expiry) {
        if (!bytes_1.isHexString(beforeHash, 32)) {
            logger.throwArgumentError("invalid transaction hash", "beforeHash", beforeHash);
        }
        if (!bytes_1.isHexString(afterHash, 32)) {
            logger.throwArgumentError("invalid transaction hash", "afterHash", afterHash);
        }
        super({
            _isForkEvent: true,
            _isTransactionOrderForkEvent: true,
            expiry: (expiry || 0),
            beforeHash: beforeHash,
            afterHash: afterHash
        });
    }
}
exports.TransactionOrderForkEvent = TransactionOrderForkEvent;
///////////////////////////////
// Exported Abstracts
class Provider {
    constructor() {
        logger.checkAbstract(new.target, Provider);
        properties_1.defineReadOnly(this, "_isProvider", true);
    }
    // Alias for "on"
    addListener(eventName, listener) {
        return this.on(eventName, listener);
    }
    // Alias for "off"
    removeListener(eventName, listener) {
        return this.off(eventName, listener);
    }
    static isProvider(value) {
        return !!(value && value._isProvider);
    }
}
exports.Provider = Provider;
//# sourceMappingURL=index.js.map