const appRoot = require('app-root-path');
const Blockchain = require('moechain-chain')
const Block = require('./block')
const level = require('level')
const fs = require("fs")
const Account = require('../account/account')
const Tx = require('../tx/tx')
const bigInt = require("big-integer")
const ethUtil = require('ethereumjs-util')
const BN = ethUtil.BN
const _ = require('lodash')
const isBuffer = require('is-buffer')

if (!fs.existsSync(appRoot + '/data')) {
    fs.mkdirSync(appRoot + '/data')
}
const blockDb = level(appRoot + '/data/blockDb')
const detailsDb = level(appRoot + '/data/detailsDb')
let blockchain = new Blockchain({ blockDb: blockDb, detailsDb: detailsDb })

const block = new Block()
block.transactions = [
    {
        value: 1,
        to: '0x0000000000000000000000000000000000000011', 
        data: '7f7465737432000000000000000000000000000000000000000000000000000000600057'
    }, {
        value: 2,
        to: '0x0000000000000000000000000000000000000011', 
        data: '7f7465737432000000000000000000000000000000000000000000000000000000600057'
    }, {
        value: 3,
        to: '0x0000000000000000000000000000000000000011', 
        data: '7f7465737432000000000000000000000000000000000000000000000000000000600057'
    }, {
        value: 4,
        to: '0x2200000000000000000000000000000000000000', 
        data: 's'
    }, {
        value: 5,
        to: '0x0000000000000000000000000000000000000000', 
        data: '7f7465737432000000000000000000000000000000000000000000000000000000600057'
    }, {
        value: 5,
        to: '0x0000000000000000000000000000000000000000', 
        data: 'saddddddddddddddddddddddddd'
    }, {
        value: 7,
        to: '0x0000000000000000000000000000000000000000', 
        data: 'sadddddddddddddddd'
    }, {
        value: 8,
        to: '0x0000000000000000000000000000000000000000', 
        data: 'saddddddddddddddddddddddddd'
    }

]

block.genTxTrie((root) => {
    block.header.transactionsTrie = root
})

function genAccountTrie() {
    let transactions = []

    // if i use foreach, transacations will not well
    for (i = 0; i < block.transactions.length; i++) {
        var tx = new Tx(block.transactions[i])
        const privateKey = Buffer.from('e331b6d69882b4cb4ea581d88e0b604039a3de5967688d3dcffdd2270c0fd109', 'hex')
        tx.sign(privateKey)
        console.log(tx.from.toString('hex'))
        transactions.push(tx)
    }

    for (i = 0; i< transactions.length;i++) {
        console.log(transactions[i].to.toString('hex'))
    }


    // let toA = transactions.filter((item => item.to === to[1]))
    // console.log(toA)
    // for (let i =0; i<to.length;i++) {
    //     let v = []
    //     transactions.forEach(function(item) {
    //         console.log(to[i] === item.to)
    //         console.log(to[i])
    //         console.log(item.to)
    //         if (item.to = to[i]) {
    //             v.push(item.value)
    //         }
    //     })
    //     console.log('========================i ci===================')

    //     console.log(i)
    // }
    //根据 to数组中的元素查找交易数据，相加

    // for (let i = 0; i < transactions.length; i++) {
    //     if (to.hasOwnProperty(transactions[i].to)) {
    //         to[transactions[i].to] = new BN(to[transactions[i].to]).add(new BN(transactions[i].value)).toString()
    //         console.log('if',new BN(to[transactions[i].to]).add(new BN(transactions[i].value)).toString())
    //     } else {
    //         to[transactions[i].to] = new BN(transactions[i].value).toString('hex')
    //     }
    // }

    // for (let i = 0; i < transactions.length; i++) {
    //     if (from.hasOwnProperty(transactions[i].from.toString('hex'))) {
    //         from[transactions[i].from.toString('hex')] = new BN(from[transactions[i].from]).add(new BN(transactions[i].value)).toString()
    //         console.log('if',new BN(from[transactions[i].from]).add(new BN(transactions[i].value)).toString())
    //     } else {
    //         from[transactions[i].from.toString('hex')] = new BN(transactions[i].value).toString('hex')
    //     }
    // }
    // console.log(to)
    // console.log(from)

}
genAccountTrie()
console.log(block.serialize())

var raw = {
    nonce: '',
    balance: '0x03e7',
};


const account = new Account(raw)
console.log(account)
console.log(account.balance.toString('hex'))

