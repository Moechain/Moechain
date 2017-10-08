
const rlp = require('rlp')
const Utils = require('../utils')
const utils = new Utils()
const ethUtil = require('ethereumjs-util')
/*
account schema  should have blance, nonce and key is address
*/
class Account {
  // constructor (data) {
  //     this.blance = data[0] ? data[0] : Buffer.from([]),
  //     this.nonce = data[1] ? data[1] : Buffer.from([])
  // }
  // serialize() {
  //     return rlp.encode([this.blance, this.nonce])
  // }

  constructor (data) {
    data = data || {}
    // Define Properties
    const fields = [{
      name: 'balance',
      default: new Buffer([])
    }, {
      name: 'nonce',
      default: new Buffer([])
    }]
    ethUtil.defineProperties(this, fields, data)
  }
}

module.exports = Account
