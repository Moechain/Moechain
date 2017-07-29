const Utils = require('../lib/utils')

const utils = new Utils()
const key = utils.generatorKeyPair('this is secret!')
const DB = require('../lib/db')
const db = new DB()

const c = utils.generatorSignature('Moechain is comming', key.secretKey)
console.log('signature:' + c)
console.log(utils.verifySignature('moechsiniscomming', c, key.publicKey))
console.log(utils.verifySignature('Moechain is comming', c, key.publicKey))
console.log(utils.generatorAddress(key.publicKey))

db.get('233')
.then(value => console.log(value))
.catch((err) => console.log(err))
