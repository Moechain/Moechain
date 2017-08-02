const nacl = require('tweetnacl')
const crypto = require('crypto')
const bs58 = require('bs58')

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
    const encodeHex = Buffer.from(str, 'hex')
    return new Uint8Array(encodeHex)
  }

  _msgBuffer (msg) {
    return Buffer.from(msg)
  }

  generatorSignature (msg, secretKey) {
    const signature = nacl.sign.detached(this._msgBuffer(msg), this._encode(secretKey))
    return Buffer.from(signature).toString('hex')
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
    console.log(checksum)
    let address = Buffer.concat([version, hash, checksum])
    address = bs58.encode(address)
    return address
  }

  timestamp () {
    return Math.floor(Date.now() / 1000)
  }
}

module.exports = Utils
