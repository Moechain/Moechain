// const Block = require('./block')
// const Tx = require('../tx/tx')
// var block = new Block()
// block.transactions = [
//     {
//         value:1000,
//         to:'00000000000000000000',
//         data: '7f7465737432000000000000000000000000000000000000000000000000000000600057'
//     }, {
//         value:2000,
//         to:'00000000000000000000',
//         data: '7f7465737432000000000000000000000000000000000000000000000000000000600057'
//     }, {
//         value:3000,
//         to:'00000000000000000000',
//         data: '7f7465737432000000000000000000000000000000000000000000000000000000600057'
//     }, {
//         value:4000,
//         to:'00000000000000000000',
//         data: 's'
//     }, {
//         value:5000,
//         to:'00000000000000000000',
//         data: '7f7465737432000000000000000000000000000000000000000000000000000000600057'
//     },{
//         value:2000,
//         to:'00000000000000000000',
//         data: 'saddddddddddddddddddddddddd'
//     },{
//         value:6000,
//         to:'00000000000000000000',
//         data: 'sadddddddddddddddd'
//     },{
//         value:7000,
//         to:'00000000000000000000',
//         data: 'saddddddddddddddddddddddddd'
//     }

// ]

// block.genTxTrie(
//     (t)=>{
//         console.log(t)
//     }
// )
const Trie = require('merkle-patricia-tree')
const level = require('level')
const appRoot = require('app-root-path');
const accountDb = level(appRoot + '/data/accountDb')

let root = '247db8a930493b363e67cb487dd5ac3938188e2caee4034c35648f203dd000e6'
let trie = new Trie(accountDb,Buffer.from(root,'hex'))
var stream = trie.createReadStream()
stream.on('data', function (d) {
    // t.equal(valObj[d.key.toString()], d.value.toString())
    // delete valObj[d.key.toString()]
    console.log(d.key.toString())
    console.log(d.value.toString())
    
})
// const _ = require('lodash')
// console.log(_.isNil(null))
// let a = trie.get(root, (e,v)=>{
//     return _.isNil(v)
// })
// console.log(a)

// var BigInteger = require('jsbn').BigInteger;

// var bi = new BigInteger('10');
// console.log(bi.add(new BigInteger('10')).toString())