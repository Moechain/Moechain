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
const Trie = require('merkle-patricia-tree')

if (!fs.existsSync(appRoot + '/data')) {
    fs.mkdirSync(appRoot + '/data')
}
const blockDb = level(appRoot + '/data/blockDb')
const detailsDb = level(appRoot + '/data/detailsDb')
const accountDb = level(appRoot + '/data/accountDb')
let blockchain = new Blockchain({ blockDb: blockDb, detailsDb: detailsDb })

const block = new Block()
block.transactions = [
    ['0x',
        '0x0000000000000000000000000000000000000011',
        '0x01',
        '0x376637343635373337343332303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030363030303537',
        '0x1b',
        '0x2bbb050bb38ea91acdc195d2ba06d020923fc8789fd60493f2ed93ef0036b1ae',
        '0x3de68fbf01ee5664c9964c563629e07acd4b713d366fbd513fb1b12378a3880c'],
    ['0x',
        '0x2220000000000000000000000000000000000011',
        '0x01',
        '0x376637343635373337343332303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030363030303537',
        '0x1b',
        '0x2bbb050bb38ea91acdc195d2ba06d020923fc8789fd60493f2ed93ef0036b1ae',
        '0x3de68fbf01ee5664c9964c563629e07acd4b713d366fbd513fb1b12378a3880c']
]
// block.transactions = [
//     {
//         value: 1,
//         to: '0x0000000000000000000000000000000000000011',
//         data: '7f7465737432000000000000000000000000000000000000000000000000000000600057'
//     }, {
//         value: 2,
//         to: '0x0000000000000000000000000000000000000011',
//         data: '7f7465737432000000000000000000000000000000000000000000000000000000600057'
//     }, {
//         value: 3,
//         to: '0x0000000000000000000000000000000000000011',
//         data: '7f7465737432000000000000000000000000000000000000000000000000000000600057'
//     }, {
//         value: 4,
//         to: '0x2200000000000000000000000000000000000000',
//         data: 's'
//     }, {
//         value: 5,
//         to: '0x0000000000000000000000000000000000000000',
//         data: '7f7465737432000000000000000000000000000000000000000000000000000000600057'
//     }, {
//         value: 5,
//         to: '0x0000000000000000000000000000000000000000',
//         data: 'saddddddddddddddddddddddddd'
//     }, {
//         value: 7,
//         to: '0x0000000000000000000000000000000000000000',
//         data: 'sadddddddddddddddd'
//     }, {
//         value: 8,
//         to: '0x0000000000000000000000000000000000000000',
//         data: 'saddddddddddddddddddddddddd'
//     }

// ]

block.genTxTrie((root) => {
    block.header.transactionsTrie = root
})

function genAccountTrie(txs, stateRoot, cb) {
    let transactions = []

    // if i use foreach, transacations will not well
    for (i = 0; i < txs.length; i++) {
        var tx = new Tx(txs[i])
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
    console.log(to)
    // let trie = new Trie(accountDb)
    let root
    if (_.isBuffer(stateRoot)) {
        root = stateRoot
    } else {
        root = Buffer.from(stateRoot, 'hex')
    }
    // let root = 'a62ad013a6ab1f9e0d172e387b1aa16be116ab0e6d00e49606b44192862e0800'
    let trie = new Trie(accountDb, root)
    // _.forEach(to, function (value, key) {
    //     if (key === Object.keys(to).pop()) {
    //         trie.put(key, value, function () {
    //             cb(trie.root)
    //         })
    //         return
    //     }
    //     trie.put(key, value)
    // });

    _.forEach(to, function (value, key) {
        if (key === Object.keys(to).pop()) {
            console.log("last")
            trie.get(key, (e, v) => {
                if (_.isNil(v)) {
                    console.log("last1")
                    trie.put(key, value, function () {
                        cb(trie.root)
                    })
                    return
                } else {
                    console.log("last2")
                    console.log()
                    trie.put(key, new BI(value).add(new BI(v.toString())).toString(), function () {
                        cb(trie.root)
                    })
                    return
                }
            })
        }
        trie.get(key, (e, v) => {
            if (_.isNil(v)) {
                trie.put(key, value)
            } else {
                console.log('emm,', value)
                console.log(new BI(value).add(new BI(v.toString())))
                trie.put(key, new BI(value).add(new BI(v.toString())).toString())
            }
        })
    });
    _.forEach(from, function (value, key) {
        if (key === Object.keys(from).pop()) {
            console.log("last")
            trie.get(key, (e, v) => {
                if (_.isNil(v)) {
                    console.log("last1")
                    trie.put(key, '-'+value, function () {
                        cb(trie.root)
                    })
                    return
                } else {
                    console.log("last2")
                    console.log()
                    trie.put(key, new BI(v.toString()).subtract(new BI(value)).toString(), function () {
                        cb(trie.root)
                    })
                    return
                }
            })
        }
        trie.get(key, (e, v) => {
            if (_.isNil(v)) {
                trie.put(key, '-'+value)
            } else {
                trie.put(key, new BI(v.toString()).subtract(new BI(value)).toString())
            }
        })
    });
}
genAccountTrie(block.transactions, 'a62ad013a6ab1f9e0d172e387b1aa16be116ab0e6d00e49606b44192862e0800', root => console.log(root.toString('hex')))
console.log(block.serialize())

var raw = {
    nonce: '',
    balance: '0x03e7',
};

/*
const account = new Account(raw)
console.log(account)
console.log(account.balance.toString('hex'))

var txp = {
    value: 1,
    to: '0x0000000000000000000000000000000000000011',
    data: '7f7465737432000000000000000000000000000000000000000000000000000000600057',
    from: '2200000000000000000000000000000000000000'
}
let tx =new Tx([ '0x',
'0x0000000000000000000000000000000000000011',
'0x01',
'0x376637343635373337343332303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030363030303537',
'0x1b',
'0x2bbb050bb38ea91acdc195d2ba06d020923fc8789fd60493f2ed93ef0036b1ae',
'0x3de68fbf01ee5664c9964c563629e07acd4b713d366fbd513fb1b12378a3880c' ])
const privateKey = Buffer.from('e331b6d69882b4cb4ea581d88e0b604039a3de5967688d3dcffdd2270c0fd109', 'hex')
// tx.sign(privateKey)
console.log(tx.from.toString('base64'))
*/

let tx = new Tx(['0x',
    '0x0000000000000000000000000000000000000011',
    '0x01',
    '0x376637343635373337343332303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030363030303537',
    '0x1b',
    '0x2bbb050bb38ea91acdc195d2ba06d020923fc8789fd60493f2ed93ef0036b1ae',
    '0x3de68fbf01ee5664c9964c563629e07acd4b713d366fbd513fb1b12378a3880c'])
// const privateKey = Buffer.from('e331b6d69882b4cb4ea581d88e0b604039a3de5967688d3dcffdd2270c0fd109', 'hex')
console.log('tx:')
console.log(tx.from.toString('hex'))