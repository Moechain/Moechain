const Utils = require('../lib/utils')
const BlockHeader = require('../lib/block/blockHeader')
const Miner = require('../lib/miner/miner')

const utils = new Utils()
const key = utils.generatorKeyPair('this is secret!')
const header = new BlockHeader(key)

const c = utils.generatorSignature('Moechain is comming', key.secretKey)
console.log('signature:' + c)
console.log(utils.verifySignature('moechsiniscomming', c, key.publicKey))
console.log(utils.verifySignature('Moechain is comming', c, key.publicKey))
console.log(utils.generatorAddress(key.publicKey))

console.log(header.blockTimestamp())
let a = utils.generatorBlockHash({a: 233333, b: 33333332})
console.log(a)
let miner = new Miner()
miner.mine(23, 1024)
