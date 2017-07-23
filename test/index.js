const Utils = require('../lib/utils')

const utils = new Utils()
const key = utils.generatorKeyPair('this is secret!')

const c = utils.generatorSignature('Moechain is comming', key.secretKey)
console.log('signature:' + c)
console.log(utils.verifySignature('moechsiniscomming', c, key.publicKey))
console.log(utils.generatorAddress(key.publicKey))
