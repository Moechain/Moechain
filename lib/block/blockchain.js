const appRoot = require('app-root-path');
const level = require('level')
const fs = require("fs")
const BI = require("jsbn").BigInteger
const ethUtil = require('ethereumjs-util')
const BN = ethUtil.BN
const _ = require('lodash')
const Trie = require('merkle-patricia-tree')

const Blockchain = require('../modules/moechain-chain')
const Block = require('../modules/moechain-block')
const Tx = require('../modules/moechain-tx')

const Account = require('../account/account')

if (!fs.existsSync(appRoot + '/data')) {
    fs.mkdirSync(appRoot + '/data')
}

const blockDb = level(appRoot + '/data/blockDb')
const detailsDb = level(appRoot + '/data/detailsDb')
const accountDb = level(appRoot + '/data/accountDb')
const transactionDb = level(appRoot + '/data/transactionDb')

let blockchain = new Blockchain({ blockDb: blockDb, detailsDb: detailsDb })

function checkGenesis() {
    blockchain.getBlock(0, function (err, block) {
        if (_.isNil(block)) {
            let genesisBlock = new Block()
            genesisBlock.setGenesisParams()
            blockchain.putGenesis(genesisBlock, () => { })
        }
    })
}


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

    let root
    if (_.isBuffer(stateRoot)) {
        root = stateRoot
    } else {
        root = Buffer.from(stateRoot, 'hex')
    }

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
function genTxTrie(txs, cb) {
    let txTrie = new Trie(transactionDb)
    txs.forEach((item, index) => {
        const tx = new Tx(item)
        const serializedTx = tx.serialize()

        if (index === txs.length - 1) {
            txTrie.put(ethUtil.rlp.encode(index), serializedTx, function () {
                cb(txTrie.root)
            })
            return
        }
        txTrie.put(ethUtil.rlp.encode(index), serializedTx)
    })
}

// checkGenesis()