const Utils = require('./utils')

class Block {
  // the header is blockHeader.js
  constructor (header, body) {
    /* this.transactions = block.transactions || {}
    this.utils = new Utils() */
    this.utils = new Utils()
  }
}

module.exports = Block
