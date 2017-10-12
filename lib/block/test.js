const rlp = require('ethereumjs-util').rlp
const Trie = require('merkle-patricia-tree')
const level = require('level')
const appRoot = require('app-root-path')
const concat = require('concat-stream')
const accountDb = level(appRoot + '/data/accountDb')
const transactionDb = level(appRoot + '/data/transactionDb',{ valueEncoding: 'json' })

var valueStream = transactionDb.createReadStream().pipe(
  concat(result => {
    result.map((item,index)=>{console.log(item.value.value)})
  })
)
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
