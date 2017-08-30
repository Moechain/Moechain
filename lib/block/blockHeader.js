const Utils = require('../utils')

class BlockHeader {
  constructor (key) {
    /* this._version = version
    this._height = height
    this._timestamp = timestamp
    this._previousHash = previousHash
    // this._blockHash = blockHash
    this._address = address
    this._blockSignature = blockSignature */
    this._utils = new Utils()
    this._secretKey = key.secretKey
    this._publicKey = key.publicKey
  }

  prefixHeader () {
    return {
      version: this.blockVersion,
      height: this.blockHeight,
      timestamp: this.blockTimestamp,
      previousHash: this.blockPreviousHash,
      blockSignature: this.blockSignature
    }
  }

  header () {
    let pre = this.prefixHeader()
    pre.blockHash = this.blockHash()
  }

  blockVersion () {
    return 0
  }
  blockTimestamp () {
    return this._utils.timestamp()
  }

  blockHeight () {
    return 0
  }

  blockPreviousHash () {
    return null
  }

  blockAdress () {
    return this._utils.generatorAddress(this._publicKey)
  }

  blockSignature () {
    return this._utils.generatorSignature(this.blockHash, this._secretKey)
  }

  blockHash () {
    return this._utils.generatorBlockHash(this.prefixHeader())
  }
}

module.exports = BlockHeader
