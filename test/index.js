const Utils = require('../lib/utils')

// const rlp = require('rlp')

const utils = new Utils()
const key = utils.generatorKeyPair('this is secret!')
// const Account = require('../lib/account/account')
const c = utils.generatorSignature('Moechain is comming', key.secretKey)
console.log('s k :',key.secretKey)
console.log('p k :',key.publicKey)
console.log('p l :', key.publicKey.length)
console.log('p k :',utils.secretKeyToPubliclKey(key.secretKey))


// console.log('s k length:',key.secretKey.length)

console.log('signature:' + c)
// console.log(utils.verifySignature('moechsiniscomming', c, key.publicKey))
// console.log(utils.verifySignature('Moechain is comming', c, key.publicKey))
// console.log(utils.generatorAddress(key.publicKey))

// let a = utils.generatorBlockHash({a: 233333, b: 33333332})
// console.log(a)
// console.log('blake:',utils.blake('23333'))
// let account = new Account(['23','384'])
// console.log(rlp.decode(account.serialize()).toString())
