const appRoot = require('app-root-path');
const Blockchain = require('moechain-chain')
const Block = require('./block')
const level = require('level')
const fs = require("fs")
const Account = require('../account/account')
const Tx = require('../tx/tx')
const BI = require("jsbn").BigInteger
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
        transactions.push(tx)
    }
    let to = {}
    let from = {}

    transactions.forEach((item, index) => {
        let value = new BI(item.value.toString('hex'))
        let to_account = item.to.toString('hex')
        if (to.hasOwnProperty(to_account)) {
            to[to_account] = new BI(to[to_account]).add(value).toString()
        } else {
            to[to_account] = value.toString()
        }
    })
    transactions.forEach((item, index) => {
        let value = new BI(item.value.toString('hex'))
        let from_account = item.from.toString('hex')
        if (from.hasOwnProperty(from_account)) {
            from[from_account] = new BI(from[from_account]).add(value).toString()
        } else {
            from[from_account] = value.toString()
        }
    })
    console.log(from)
    console.log(to)
}
genAccountTrie()
console.log(block.serialize())

var raw = {
    nonce: '',
    balance: '0x03e7',
};


const account = new Account(raw)
// console.log(account)
// console.log(account.balance.toString('hex'))

