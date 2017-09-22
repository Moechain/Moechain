const appRoot = require('app-root-path');
const Blockchain = require('moechain-chain')
const Block = require('./block')
const level = require('level')
var fs= require("fs")
   
if(!fs.existsSync(appRoot+'/data')){
    fs.mkdirSync(appRoot+'/data')
}
const blockDb = level(appRoot + '/data/blockDb')
const detailsDb = level(appRoot + '/data/detailsDb')
let blockchain = new Blockchain({ blockDb: blockDb, detailsDb: detailsDb })

const block = new Block()
block.transactions = [
    {
        value:1000,
        to:'00000000000000000000',
        data: '7f7465737432000000000000000000000000000000000000000000000000000000600057'
    }, {
        value:2000,
        to:'00000000000000000000',
        data: '7f7465737432000000000000000000000000000000000000000000000000000000600057'
    }, {
        value:3000,
        to:'00000000000000000000',
        data: '7f7465737432000000000000000000000000000000000000000000000000000000600057'
    }, {
        value:4000,
        to:'00000000000000000000',
        data: 's'
    }, {
        value:5000,
        to:'00000000000000000000',
        data: '7f7465737432000000000000000000000000000000000000000000000000000000600057'
    },{
        value:2000,
        to:'00000000000000000000',
        data: 'saddddddddddddddddddddddddd'
    },{
        value:6000,
        to:'00000000000000000000',
        data: 'sadddddddddddddddd'
    },{
        value:7000,
        to:'00000000000000000000',
        data: 'saddddddddddddddddddddddddd'
    }

]
block.genTxTrie((root)=>{
    block.header.transactionsTrie = root
})
console.log(block.serialize())
