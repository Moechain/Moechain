const rlp = require('ethereumjs-util').rlp
const Trie = require('merkle-patricia-tree')
const level = require('level')
const appRoot = require('app-root-path')
const accountDb = level(appRoot + '/data/accountDb')
const transactionDb = level(appRoot + '/data/transactionDb')
const Tx = require('../tx/tx')

let root = 'bc5da86938a31afe119e9ec293a41a4dfe168e463192fb394dac9b3ab30d2fd2'
let trie = new Trie(accountDb, Buffer.from(root, 'hex'))
// let root = '247db8a930493b363e67cb487dd5ac3938188e2caee4034c35648f203dd000e6'

// let trie = new Trie(accountDb,Buffer.from(root,'hex'))

var stream = trie.createReadStream()
stream.on('data', function (d) {
    // console.log(rlp.decode(d.key.toString()))
    // console.log(d.value.toString())
    // console.log(rlp.decode(d.key).toString('hex'))
  console.log(d.value.toString())
})
