const rlp = require('ethereumjs-util').rlp
const Trie = require('merkle-patricia-tree')
const level = require('level')
const appRoot = require('app-root-path')
const accountDb = level(appRoot + '/data/accountDb')
const transactionDb = level(appRoot + '/data/transactionDb')
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


