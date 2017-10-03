const { randomBytes } = require('crypto')
const secp256k1 = require('secp256k1')
const nacl = require('tweetnacl')
const crypto = require('crypto')
const bs58 = require('bs58')
const blake = require('blakejs')
const _ = require('lodash')
nacl.util = require('tweetnacl-util')
const ethUtil = require('ethereumjs-util')

class Utils {
  hash (str) {
    return crypto.createHash('sha256').update(str).digest()
  }

  generatorKeyPair (secret) {
    const seed = crypto.createHash('sha256').update(secret).digest()
    let keyPair = nacl.sign.keyPair.fromSeed(seed)
    return {
      'publicKey': Buffer.from(keyPair.publicKey).toString('hex'),
      'secretKey': Buffer.from(keyPair.secretKey).toString('hex')
    }
  }

  _encode (str) {
    // const encodeHex = Buffer.from(str, 'hex')
    let encodeHex
    if (!_.isBuffer(str)) {
      encodeHex = Buffer.from(str, 'hex')
    } else {
      encodeHex = str
    }
    return new Uint8Array(encodeHex)
  }

  _msgBuffer (msg) {
    if (!_.isBuffer(msg)) {
      return Buffer.from(msg)
    }
    return msg
  }

  generatorSignature (msg, secretKey) {
    const signature = nacl.sign.detached(this._msgBuffer(msg), this._encode(secretKey))
    return Buffer.from(signature).toString('hex')
  }
  secretKeyToPubliclKey (secretKey) {
    if (!_.isBuffer(secretKey)) {
      secretKey = Buffer.from(secretKey, 'hex')
    }
    let publicKey = nacl.sign.keyPair.fromSecretKey(secretKey)
    publicKey = Buffer.from(publicKey.publicKey).toString('hex')
    return publicKey
  }
  generatorBlockHash (header) {
    header = Buffer.from(JSON.stringify(header)).toString()
    return crypto.createHash('sha256').update(header).digest('hex')
  }
  verifySignature (msg, signature, publicKey) {
    return nacl.sign.detached.verify(this._msgBuffer(msg), this._encode(signature), this._encode(publicKey))
  }

  generatorAddress (publicKey) {
    let hash = crypto.createHash('sha256').update(publicKey).digest()
    hash = crypto.createHash('ripemd160').update(hash).digest()
    let version = Buffer.from('6F', 'hex')
    let checksum = Buffer.concat([version, hash])
    checksum = crypto.createHash('sha256').update(checksum).digest()
    checksum = crypto.createHash('sha256').update(checksum).digest()
    checksum = checksum.slice(0, 4)
    let address = Buffer.concat([version, hash, checksum])
    address = bs58.encode(address)
    // let address = ethUtil.sha3(publicKey).slice(-20)
    return address
  }

  timestamp () {
    return Math.floor(Date.now() / 1000)
  }
}

module.exports = Utils
