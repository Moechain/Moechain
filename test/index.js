const Utils = require('../lib/utils')
const BlockHeader = require('../lib/block/blockHeader')

const utils = new Utils()
const key = utils.generatorKeyPair('this is secret!')
const header = new BlockHeader()

const c = utils.generatorSignature('Moechain is comming', key.secretKey)
console.log('signature:' + c)
console.log(utils.verifySignature('moechsiniscomming', c, key.publicKey))
console.log(utils.verifySignature('Moechain is comming', c, key.publicKey))
console.log(utils.generatorAddress(key.publicKey))

console.log(header.blockTimestamp())

/* const option {prefix:'ab',limit:2}
db.find(option, function (key, value) {
        if (key && value) {
            //key 和 value 都存在的情况下进行逻辑处理
            //依次返回 key:abc ,value :111  和 key:abd ,value :333 (因为我限制只读取2条记录)
        } else {
            //如果读到最后一个 value 将会是 undefined (这是leveldb自己实现的一种机制,所以我们可以根据 value==undefined 来判断是不是读取完成了)
            //读取完成后做的逻辑处理
        }
*/
