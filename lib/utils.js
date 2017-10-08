const { randomBytes } = require('crypto')
const secp256k1 = require('secp256k1')

const crypto = require('crypto')
const bs58 = require('bs58')
const _ = require('lodash')
const ethUtil = require('ethereumjs-util')

class Utils {
  hash (str) {
    return ethUtil.sha3(str)
  }

  toBuffer (v) {
    return ethUtil.toBuffer(v)
  }
  bufferToInt (v) {
    return ethUtil.bufferToInt(v)
  }
  generatorPrivateKey () {
    let privateKey
    do {
      privateKey = randomBytes(32)
    } while (!secp256k1.privateKeyVerify(privateKey))
    return privateKey
  }

  generatorPublicKey (privateKey) {
    privateKey = _.isBuffer(privateKey) ? privateKey : Buffer.from(privateKey)
    if (secp256k1.privateKeyVerify(privateKey)) {
      return secp256k1.publicKeyCreate(privateKey, false).slice(1)
    }
    return 'wrong privateKey'
  }

  validatePrivateKey (privateKey) {
    return secp256k1.privateKeyVerify(privateKey)
  }

  validatePublicKey (publicKey) {
    if (publicKey.length === 64) {
      return secp256k1.publicKeyVerify(Buffer.concat([Buffer.from([4]), publicKey]))
    }
  }
  privateToAddress (privateKey) {
    return ethUtil.privateToAddress(privateKey)
  }
  publicToAddress (publicKey) {
    return ethUtil.publicToAddress(publicKey)
  }
  timestamp () {
    return Math.floor(Date.now() / 1000)
  }
  microTimeStamp () {
    return Date.now()
  }
}

module.exports = Utils
