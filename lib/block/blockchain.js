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

// if genesis is nil, it will create one
function checkGenesis() {
    blockchain.getBlock(0, function (err, block) {
        if (_.isNil(block)) {
            let genesisBlock = new Block()
            genesisBlock.setGenesisParams()
            blockchain.putGenesis(genesisBlock, () => { })
        }
    })
}

const block = new Block()

block.transactions = [
    ['0x0000000000000000000000000000000000000000',
        '0x01',
        '0x6fb472a266d0bd89c13706a4132ccfb16f7c3b9fcb6192f257',
        '0x7f7465737432000000000000000000000000000000000000000000000000000000600057',
        '0x1917d458ff21b8893c04f2de577332055bf8f058f4886ae500db52817b54ae2298ca1b7e9017263a03a0482ed7a785cbffc34aac4ac3cf6f8788c3685b50d90e',
        '0xb4bd5378cdd3be7e7ebb66703b5054727d1b9c126c9eec999684806197b34610'],
    ['0x0000000000000000000000000000000000000000',
        '0x01',
        '0x6fb472a266d0bd89c13706a4132ccfb16f7c3b9fcb6192f257',
        '0x7f7465737432000000000000000000000000000000000000000000000000000000600057',
        '0x1917d458ff21b8893c04f2de577332055bf8f058f4886ae500db52817b54ae2298ca1b7e9017263a03a0482ed7a785cbffc34aac4ac3cf6f8788c3685b50d90e',
        '0xb4bd5378cdd3be7e7ebb66703b5054727d1b9c126c9eec999684806197b34610']
]

// block.genTxTrie((root) => {
//     block.header.transactionsTrie = root
// })

// genAccountTrie receive a transactions array, a stateRoot and a callback function to return stateRoot

function genAccountTrie(txs, stateRoot, cb) {
    let transactions = []

    txs.forEach(item => {
        var tx = new Tx(item)
        transactions.push(tx)
    })
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
    console.log(from)
    // let trie = new Trie(accountDb)
    let root
    if (_.isBuffer(stateRoot)) {
        root = stateRoot
    } else {
        root = Buffer.from(stateRoot, 'hex')
    }
    // let root = 'a62ad013a6ab1f9e0d172e387b1aa16be116ab0e6d00e49606b44192862e0800'
    // _.forEach(to, function (value, key) {
    //     if (key === Object.keys(to).pop()) {
    //         trie.put(key, value, function () {
    //             cb(trie.root)
    //         })
    //         return
    //     }
    //     trie.put(key, value)
    // });
    function putFromAccount(cb) {
        let trie = new Trie(accountDb, root)
        _.forEach(from, function (value, key) {
            if (key === Object.keys(from).pop()) {
                trie.get(key, (e, v) => {
                    if (_.isNil(v)) {
                        trie.put(key, '-' + value, function () {
                            cb(trie.root)
                        })
                        return
                    } else {
                        trie.put(key, new BI(v.toString()).subtract(new BI(value)).toString(), function () {
                            cb(trie.root)
                        })
                        return
                    }
                })
            }
            trie.get(key, (e, v) => {
                if (_.isNil(v)) {
                    trie.put(key, '-' + value)
                } else {
                    trie.put(key, new BI(v.toString()).subtract(new BI(value)).toString())
                }
            })
        });
    }
    putFromAccount((root) => {
        let trie = new Trie(accountDb, root)
        _.forEach(to, function (value, key) {
            if (key === Object.keys(to).pop()) {
                trie.get(key, (e, v) => {
                    if (_.isNil(v)) {
                        trie.put(key, value, function () {
                            cb(trie.root)
                        })
                        return
                    } else {
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
                    trie.put(key, new BI(value).add(new BI(v.toString())).toString())
                }
            })
        });
    })

}
genAccountTrie(block.transactions, 'a62ad013a6ab1f9e0d172e387b1aa16be116ab0e6d00e49606b44192862e0800', root => console.log(root.toString('hex')))
// console.log(block.serialize())

// let extraData = "0x11bbe8db4e347b4e8c937c1c8370e4b5ed33adb3db69cbdb7a38e1e50b1b82fa"

// console.log(ethUtil.rlp.decode(Buffer.from(extraData, 'hex')))
