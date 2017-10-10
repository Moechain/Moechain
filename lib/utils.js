const { randomBytes } = require('crypto')
const secp256k1 = require('secp256k1')

// const crypto = require('crypto')
// const bs58 = require('bs58')
const _ = require('lodash')
const ethUtil = require('ethereumjs-util')

class Utils {
  hash(str) {
    return ethUtil.sha3(str)
  }
  rlpDecode(str) {
    return ethUtil.rlp.decode(str)
  }
  rlpEncode(str) {
    return ethUtil.rlp.encode(str)
  }
  dataFee(data) {
    data = Buffer.from(data, 'hex')
    // console.log(this.raw[4])
    var cost = new ethUtil.BN(0)
    for (var i = 0; i < data.length; i++) {
      data[i] === 0 ? cost.iaddn(0.2) : cost.iaddn(0.5)
    }
    return cost
  }
  toBuffer(v) {
    return ethUtil.toBuffer(v)
  }
  bufferToInt(v) {
    return ethUtil.bufferToInt(v)
  }
  generatorPrivateKey() {
    let privateKey
    do {
      privateKey = randomBytes(32)
    } while (!secp256k1.privateKeyVerify(privateKey))
    return privateKey
  }

  generatorPublicKey(privateKey) {
    privateKey = _.isBuffer(privateKey) ? privateKey : Buffer.from(privateKey)
    if (secp256k1.privateKeyVerify(privateKey)) {
      return secp256k1.publicKeyCreate(privateKey, false).slice(1)
    }
    return 'wrong privateKey'
  }

  validatePrivateKey(privateKey) {
    return secp256k1.privateKeyVerify(privateKey)
  }

  validatePublicKey(publicKey) {
    if (publicKey.length === 64) {
      return secp256k1.publicKeyVerify(
        Buffer.concat([Buffer.from([4]), publicKey])
      )
    }
  }
  privateToAddress(privateKey) {
    return ethUtil.privateToAddress(privateKey)
  }
  publicToAddress(publicKey) {
    return ethUtil.publicToAddress(publicKey)
  }
  timestamp() {
    return Math.floor(Date.now() / 1000)
  }
  microTimeStamp() {
    return Date.now()
  }
}

module.exports = Utils
