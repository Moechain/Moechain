'use strict'
const ethUtil = require('ethereumjs-util')
const Utils = require('../utils')
const utils = new Utils()
const bs58 = require('bs58')

/**
 * Creates a new transaction object.
 * this module is based on ethereumjs-tx and moechain have changed many code.
 * the origin module link: https://github.com/ethereumjs/ethereumjs-tx 
 * @example
 * var rawTx = {
 *   to: '0000000000000000000000000000000000000000',
 *   value: '00',
 *   data: '7f7465737432000000000000000000000000000000000000000000000000000000600057',
 * };
 * var tx = new Transaction(rawTx);
 * 
 * */

class Transaction {
    constructor(data) {
        data = data || {}
        // Define Properties
        const fields = [{
            name: 'to',
            allowZero: true,
            length: 20,
            default: new Buffer([])
        }, {
            name: 'value',
            length: 32,
            allowLess: true,
            default: new Buffer([])
        }, {
            name: 'data',
            alias: 'input',
            allowZero: true,
            default: new Buffer([])
        }, {
            name: 'from',
            allowZero: true,
            length: 25,
            default: new Buffer([])
        }, {
            name: 'signature',
            length: 128,
            allowZero: true,
            allowLess: true,
            default: new Buffer([])
        }, {
            name: 'senderPublicKey',
            length: 32,
            allowZero: true,
            allowLess: true,
            default: new Buffer([])
        }]

        /**
         * Returns the rlp encoding of the transaction
         * @method serialize
         * @return {Buffer}
         * @memberof Transaction
         * @name serialize
         */
        // attached serialize
        ethUtil.defineProperties(this, fields, data)

        // /**
        //  * @property {Buffer} from (read only) sender address of this transaction, mathematically derived from other parameters.
        //  * @name from
        //  * @memberof Transaction
        //  */
        // Object.defineProperty(this, 'from', {
        //     enumerable: true,
        //     configurable: true,
        //     get: this.getSenderAddress.bind(this)
        // })
    }

    /**
     * If the tx's `to` is to the creation address
     * @return {Boolean}
     */
    toCreationAddress() {
        return this.to.toString('hex') === ''
    }

    /**
     * Computes a sha3-256 hash of the serialized tx
     * @param {Boolean} [includeSignature=true] whether or not to inculde the signature
     * @return {Buffer}
     */
    hash(includeSignature) {
        if (includeSignature === undefined) includeSignature = true

        let items
        if (includeSignature) {
            items = this.raw
        } else {
            items = this.raw.slice(0, 4)
        }

        // create hash
        return ethUtil.rlphash(items)
    }

    /**
     * returns the sender's address
     * @return {Buffer}
     */
    getSenderAddress() {
        if (this._from) {
            return this._from
        }
        const pubkey = this.getSenderPublicKey()
        this._from = bs58.decode(utils.generatorAddress(pubkey))
        return this._from
    }

    /**
     * returns the public key of the sender
     * @return {Buffer}
     */
    getSenderPublicKey(secretKey) {
        // if (!this._senderPubKey || !this._senderPubKey.length) {
        //     if (!this.verifySignature()) throw new Error('Invalid Signature')
        // }
        return utils.secretKeyToPubliclKey(this.secretKey)
        // return this._senderPubKey
    }

    /**
     * Determines if the signature is valid
     * @return {Boolean}
     */
    verifySignature() {
        const msgHash = this.hash(false)
        return utils.verifySignature(msgHash, this.signature, this.getSenderPublicKey())
    }

    /**
     * sign a transaction with a given a private key
     * @param {Buffer} privateKey
     */
    sign(secretKey) {
        this.secretKey = secretKey
        this.from = this.getSenderAddress()
        this.senderPublicKey = Buffer.from(utils.secretKeyToPubliclKey(secretKey), 'hex')
        const msgHash = this.hash(false)
        const sig = utils.generatorSignature(msgHash, secretKey)
        this.signature = Buffer.from(sig, 'hex')
        return sig
    }

}

module.exports = Transaction
