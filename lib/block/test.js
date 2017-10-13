const rlp = require('ethereumjs-util').rlp
const Trie = require('merkle-patricia-tree')
const level = require('level')
const appRoot = require('app-root-path')
const concat = require('concat-stream')
const toBuffer = require('ethereumjs-util').toBuffer
const accountDb = level(appRoot + '/data/accountDb')
const transactionDb = level(appRoot + '/data/transactionDb', {
  valueEncoding: 'json'
})

const _ = require('lodash')

const querySenatorsAndVotes = async () => {
  return new Promise((resolve, reject) => {
    transactionDb.createReadStream().pipe(
      concat(data => {
        //这里得到重复的议员
        const repetitionSenators = data
          .filter((item, index) => {
            return item.value.type === '0x01' && item.value.data !== '0x'
          })
          .map((item, index) => {
            return toBuffer(item.value.data).toString()
          })
        //去重
        const senators = _.uniq(repetitionSenators)
        //过滤获得类型为投票的交易
        const result = data
          .filter((item, index) => {
            return item.value.type === '0x02' && item.value.data !== '0x'
          })
          .map(item => {
            return toBuffer(item.value.data).toString()
          })
        //获取议员及议员票数
        const finalResult = senators.map(item => {
          const name = item
          let json = {}
          json[name] = result.filter(i => {
            return (i = name)
          }).length
          return json
        })
        resolve(finalResult)
      })
    )
  })
}

// let w = async () => {
//   console.log(await querySenatorsAndVotes())
// }
// w()
// querySenators().then(result => {
// console.log(result)
// })
// valueStream.on('data', function(k,v) {
//   // console.log(rlp.decode(d.key.toString()))
//   // console.log(d.value.toString())
//   // console.log(rlp.decode(d.key).toString('hex'))
//   console.log(k)
//   // console.log(d.value.toString())
// })
// var valueStream = db.createValueStream()
// valueStream.on('error', function (err) {
//   console.error('valueStream.on error ' + err.message);
// });
// valueStream.pipe((r)=>{console.log(r)});
// response('error', function (err) {
//   console.error('response error ' + err.message);
// });
// const Tx = require('../tx/tx')

// let trie = new Trie(accountDb, Buffer.from(root, 'hex'))
// let root = '247db8a930493b363e67cb487dd5ac3938188e2caee4034c35648f203dd000e6'

// let trie = new Trie(accountDb,Buffer.from(root,'hex'))
/*
var stream = trie.createReadStream()

stream.on('data', function(d) {
  // console.log(rlp.decode(d.key.toString()))
  // console.log(d.value.toString())
  // console.log(rlp.decode(d.key).toString('hex'))
  console.log('value', d.value)
  console.log(d.value.toString())
})
*/
// let trie = new Trie(level(appRoot + '/data/testDb'))
// trie.checkpoint()
// trie.put('v','vvvvvv',()=>{
//   console.log(trie.root.toString('hex'))
// })
// trie.revert(()=>{
//   console.log(trie.root.toString('hex'))
// })
// let root = '8669a9c1fa522d8ca992eb81f2694353d10be158f664a29d7ffcd4eb4df0d591'
// let trie2 = new Trie(level(appRoot + '/data/testDb'),Buffer.from(root,'hex'))
// trie2.get(Buffer.from('v','hex'),(e,v)=>{
//   console.log(v)
// })
