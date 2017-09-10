
const rlp = require('rlp')
const Utils = require('../utils')
const utils = new Utils()

/*
account schema  should have blance, nonce and key is address
*/
class Account {
    constructor (data) {
        this.blance = data[0] ? data[0] : Buffer.from([]),
        this.nonce = data[1] ? data[1] : Buffer.from([])
    }
    serialize() {
        return rlp.encode([this.blance, this.nonce])
    }
   
}

module.exports = Account