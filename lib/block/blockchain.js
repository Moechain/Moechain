const appRoot = require('app-root-path');
// const Blockchain = require('moechain-chain')
const Blockchain = require('../modules/moechain-chain')
const Block = require('../modules/moechain-block')
const level = require('level')
const fs = require("fs")
const Account = require('../account/account')
// const Tx = require('../tx/tx')
const Tx = require('../modules/moechain-block/tx')
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
const transactionDb = level(appRoot + '/data/transactionDb')
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
// genTxTrie(block.transactions, (root) => {console.log(root.toString('hex'))})


// blockchain.getHead((e,b)=>{
//     // console.log(b.hash())
//     let hash = b.hash()
//     blockchain.getBlock(hash,(e,b)=>{
//     console.log(e)
//     console.log(b.hash())
// })
// })
// blockchain.getHead((e, b)=>{
//     console.log(b.header.number)
// })
// blockchain.getHead((e, b) => {
//     let t = [
//         ['0x0000000000000000000000000000000000000000',
//             '0x01',
//             '0x6fb472a266d0bd89c13706a4132ccfb16f7c3b9fcb6192f257',
//             '0x7f7465737432000000000000000000000000000000000000000000000000000000600057',
//             '0x1917d458ff21b8893c04f2de577332055bf8f058f4886ae500db52817b54ae2298ca1b7e9017263a03a0482ed7a785cbffc34aac4ac3cf6f8788c3685b50d90e',
//             '0xb4bd5378cdd3be7e7ebb66703b5054727d1b9c126c9eec999684806197b34610'],
//         ['0x0000000000000000000000000000000000000000',
//             '0x01',
//             '0x6fb472a266d0bd89c13706a4132ccfb16f7c3b9fcb6192f257',
//             '0x7f7465737432000000000000000000000000000000000000000000000000000000600057',
//             '0x1917d458ff21b8893c04f2de577332055bf8f058f4886ae500db52817b54ae2298ca1b7e9017263a03a0482ed7a785cbffc34aac4ac3cf6f8788c3685b50d90e',
//             '0xb4bd5378cdd3be7e7ebb66703b5054727d1b9c126c9eec999684806197b34610']
//     ]
//     let hash = b.hash()
//     var block = new Block()
//     block.header.number = ethUtil.toBuffer(2)
//     block.header.parentHash = hash
//     block.transactions = t
//     let timestamp = Math.floor(Date.now() / 1000).toString(16)
//     block.header.timestamp = new Buffer(timestamp, 'hex')
//     // genTxTrie(t,(root)=>{
//     //     block.header.transactionsTrie = root 
//     //     blockchain.putBlock(block, function (err) {
//     //         console.log(err)
//     //     })
//     // })

//     blockchain.putBlock(block, function (err) {
//         console.log(err)
//     })
//     // block.genTxTrie((cb)=>{console.log(cb)}) 
// })
// blockchain.getHead((e, b)=>{
//     console.log(b.header.number)
// })

const privateKey = Buffer.from('e331b6d69882b4cb4ea581d88e0b604039a3de5967688d3dcffdd2270c0fd109', 'hex')

const txParams = {
    nonce: '0x00',
    to: '0x0000000000000000000000000000000000000000',
    value: '0x00',
    data: '0x7f7465737432000000000000000000000000000000000000000000000000000000600057',
    // EIP 155 chainId - mainnet: 1, ropsten: 3
    chainId: 1
}
const txParams2 = {
    nonce: '0',
    to: '0x1111222200000000000000000000001111111111',
    value: '1000',
    data: '0x7f7465737432000000000000000000000000000000000000000000000000000000600057',
    chainId: 1
}
const tx = new Tx(txParams2)
tx.sign(privateKey)

const tx2 = new Tx(txParams)
tx2.sign(privateKey)
let moetx = [tx.toJSON(), tx2.toJSON()]
//   console.log(moetx)


blockchain.getHead((e, b) => {
    let h = b.hash()
    var block = new Block()
    block.header.number = ethUtil.toBuffer(1 + parseInt(b.header.number))
    block.header.parentHash = h
    block.transactions = moetx
    let timestamp = Math.floor(Date.now() / 1000).toString(16)
    block.header.timestamp = new Buffer(timestamp, 'hex')
    genTxTrie(moetx, (root)=>{
    //     block.transactionsTrie = root
    //     blockchain.putBlock(block, function (err) {
    //         console.log(err)
    //         console.log(block.hash().toString('hex'))
    //     })
    // console.log(block.hash())
    console.log(root)
    
    })
    blockchain.putBlock(block, function (err) {
        console.log(err)
        console.log(block.hash().toString('hex'))
    })
    // console.log(block.hash())
})



// blockchain.getHead(1,(e,b)=>console.log(b.hash().toString('hex')))