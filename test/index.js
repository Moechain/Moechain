const Utils = require('../lib/utils')
const ethUtil = require('ethereumjs-util')

// const rlp = require('rlp')

const utils = new Utils()
// const key = utils.generatorKeyPair('this is secret!')
// // const Account = require('../lib/account/account')
// const c = utils.generatorSignature('Moechain is comming', key.secretKey)
// console.log('s k :', key.secretKey)
// console.log('p k :', key.publicKey)
// console.log('p l :', key.publicKey.length)
// console.log('p k :', utils.secretKeyToPubliclKey(key.secretKey))

// // console.log('s k length:',key.secretKey.length)

// // console.log('signature:' + c)
// console.log(utils.generatorSignature('Moechain is comming', key.secretKey).length)
// console.log(utils.verifySignature('moechsiniscomming', c, key.publicKey))
// console.log(utils.verifySignature('Moechain is comming', c, key.publicKey))
// console.log(utils.generatorAddress(key.publicKey))

// let a = utils.generatorBlockHash({a: 233333, b: 33333332})
// console.log(a)
// console.log('blake:',utils.blake('23333'))
// let account = new Account(['23','384'])
// console.log(rlp.decode(account.serialize()).toString())
// let ecrecover = function (msgHash, v, r, s) {
//   var signature = Buffer.concat([exports.setLength(r, 32), exports.setLength(s, 32)], 64)
//   var recovery = v - 27
//   if (recovery !== 0 && recovery !== 1) {
//     throw new Error('Invalid signature v value')
//   }
//   var senderPubKey = secp256k1.recover(msgHash, signature, recovery)
//   return secp256k1.publicKeyConvert(senderPubKey, false).slice(1)
// }

// let ecsign = function (msgHash, privateKey) {
//   var sig = secp256k1.sign(msgHash, privateKey)

//   var ret = {}
//   ret.r = sig.signature.slice(0, 32)
//   ret.s = sig.signature.slice(32, 64)
//   ret.v = sig.recovery + 27
//   return ret
// }
console.log(utils.generatorPrivateKey().toString('hex'))
console.log(utils.generatorPublicKey(utils.generatorPrivateKey()).length)
console.log(  utils.timestamp()-1507038991)