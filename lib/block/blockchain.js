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

let transactions = [['0x',
    '0x0000000000000000000000000000000000000000',
    '0x',
    '0x7f7465737432000000000000000000000000000000000000000000000000000000600057',
    '0x25',
    '0x27db2b90c8fb144e0b82fc23c392d1ef315811f3fb11347e986589320b79b260',
    '0x0ace1f4ec6f34c894f2487502a43d69156a9c166f0665d82725590d4b211e696'],
['0x',
    '0x1111222200000000000000000000001111111111',
    '0x20',
    '0x7f7465737432000000000000000000000000000000000000000000000000000000600057',
    '0x25',
    '0xcc47502d28aa357710d58f60e5789bf3ac64fbf4175b6204364db7a0484fd720',
    '0x532c8a036fe882a7a94d6c6f4d7a311fa837ab3255f940e918d5dd6743571a69']]

// const privateKey = Buffer.from('e331b6d69882b4cb4ea581d88e0b604039a3de5967688d3dcffdd2270c0fd109', 'hex')
let genesisHash = Buffer.from('2923f3fa0babe5df18c4d7f5fab35e40a079314678f7511895d611828d1410aa', 'hex')

let block1Hash = Buffer.from('f2a1e6739570fcf47f265a0ef90a8722a0c8975b3169e0a38e10bd713bacae76', 'hex')
let block2Hash = Buffer.from('eaea9aa880d44549f9e08e5a69bdaff26546a07ab016d721c67d4469787a84e6', 'hex')
let block3Hash = Buffer.from('efbee2ae5eccd5f7540017a1bc44da72495e750cacba17e88a5fc84390feb89e', 'hex')
let block4Hash = Buffer.from('', 'hex')

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
        // console.log(tx)
        if (index === txs.length - 1) {
            txTrie.put(ethUtil.rlp.encode(index), serializedTx, function () {
                cb(txTrie.root)
            })
            return
        }
        txTrie.put(ethUtil.rlp.encode(index), serializedTx)
    })
}

function put(txs) {
    checkGenesis()
    blockchain.getHead((e, b) => {
        var block = new Block()
        block.header.parentHash = b.hash()
        let number = parseInt(b.header.number.toString('hex')) + 1
        console.log(number)
        block.header.number = ethUtil.toBuffer(number)
  
        let timestamp = Math.floor(Date.now() / 1000).toString(16)
        block.header.timestamp = new Buffer(timestamp, 'hex')
        block.transactions = txs

        if (block.transactions.length) {
            genTxTrie(block.transactions, (rootHash) => {
                block.header.transactionsTrie = rootHash
                blockchain.putBlock(block, (err) => {
                    if (err) {
                        console.log(err)
                        return
                    }
                    console.log(block.hash().toString('hex'))
                })
            })
        } else {
            blockchain.putBlock(block, (err) => {
                if (err) {
                    console.log(err)
                    return
                }
                console.log(block.hash().toString('hex'))
            })
        }
    })
}

// put(transactions)
// blockchain.getHead((err, block) => {
//     console.log(block.hash().toString('hex'))
//     // console.log(block.transactions)
//     console.log(parseInt(block.header.number.toString('hex')))
// })