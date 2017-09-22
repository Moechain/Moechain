const Block = require('./block')
const Tx = require('../tx/tx')
var block = new Block()
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

block.genTxTrie(
    (t)=>{
        console.log(t)
    }
)
