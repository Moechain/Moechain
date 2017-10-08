const appRoot = require('app-root-path')
const level = require('level')
const fs = require('fs')
const BI = require('jsbn').BigInteger
const ethUtil = require('ethereumjs-util')
const BN = ethUtil.BN
const _ = require('lodash')
const Trie = require('merkle-patricia-tree')

const Blockchain = require('../modules/moechain-chain')
const Block = require('../modules/moechain-block')
const Tx = require('../modules/moechain-tx')

// const Account = require('../account/account')

if (!fs.existsSync(appRoot + '/data')) {
  fs.mkdirSync(appRoot + '/data')
}

const blockDb = level(appRoot + '/data/blockDb')
const detailsDb = level(appRoot + '/data/detailsDb')
const accountDb = level(appRoot + '/data/accountDb')
const transactionDb = level(appRoot + '/data/transactionDb')

// let transactions = [['0x',
//   '0x0000000000000000000000000000000000000000',
//   '0x',
//   '0x7f7465737432000000000000000000000000000000000000000000000000000000600057',
//   '0x25',
//   '0x27db2b90c8fb144e0b82fc23c392d1ef315811f3fb11347e986589320b79b260',
//   '0x0ace1f4ec6f34c894f2487502a43d69156a9c166f0665d82725590d4b211e696'],
// ['0x',
//   '0x1111222200000000000000000000001111111111',
//   '0x20',
//   '0x7f7465737432000000000000000000000000000000000000000000000000000000600057',
//   '0x25',
//   '0xcc47502d28aa357710d58f60e5789bf3ac64fbf4175b6204364db7a0484fd720',
//   '0x532c8a036fe882a7a94d6c6f4d7a311fa837ab3255f940e918d5dd6743571a69']]

// const privateKey = Buffer.from('e331b6d69882b4cb4ea581d88e0b604039a3de5967688d3dcffdd2270c0fd109', 'hex')

// function checkGenesis() {

//     blockchain.getBlock(0, function (err, block) {
//         if (_.isNil(block)) {
//             let genesisBlock = new Block()
//             genesisBlock.setGenesisParams()
//             blockchain.putGenesis(genesisBlock, () => { })
//         }
//     })
// }

exports.genAccountTrie = function (txs, stateRoot, cb) {
  let transactions = []

  txs.forEach(item => {
    var tx = new Tx(item)
    transactions.push(tx)
  })

  let to = {}
  let from = {}

  transactions.forEach((item, index) => {
    let value = new BI(item.value.toString('hex'))
    let toAccount = item.to.toString('hex')
    if (to.hasOwnProperty(toAccount)) {
      to[toAccount] = new BI(to[toAccount]).add(value).toString()
    } else {
      to[toAccount] = value.toString()
    }
  })

  transactions.forEach((item, index) => {
    let value = new BI(item.value.toString('hex'))
    let fromAccount = item.from.toString('hex')
    if (from.hasOwnProperty(fromAccount)) {
      from[fromAccount] = new BI(from[fromAccount]).add(value).toString()
    } else {
      from[fromAccount] = value.toString()
    }
  })
  //   console.log('from:',from)
  //   console.log('to:',to)
  //   return
  // console.log(stateRoot)
  // let root
  // if (_.isBuffer(stateRoot)) {
  //     root = stateRoot
  // } else {
  //     root = Buffer.from(stateRoot, 'hex')
  // }
  stateRoot = _.isNil(stateRoot) ? Buffer.from('', 'hex') : stateRoot

  let rootHash = _.isBuffer(stateRoot) ? stateRoot : Buffer.from(stateRoot, 'hex')
  function putFromAccount (cb) {
    let trie = rootHash.toString('hex') === '' ? new Trie(accountDb) : new Trie(accountDb, rootHash)
    _.forEach(from, function (value, key) {
      if (key === Object.keys(from).pop()) {
        trie.get(key, (e, v) => {
          if (_.isNil(v)) {
            trie.put(key, '-' + value, function () {
              cb(trie.root)
            })
          } else {
            trie.put(key, new BI(v.toString()).subtract(new BI(value)).toString(), function () {
              cb(trie.root)
            })
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
    })
  }
  putFromAccount((fromRootHash) => {
    let trie = new Trie(accountDb, fromRootHash)
    _.forEach(to, function (value, key) {
      if (key === Object.keys(to).pop()) {
        trie.get(key, (e, v) => {
          if (_.isNil(v)) {
            trie.put(key, value, function () {
              cb(trie.root)
            })
          } else {
            trie.put(key, new BI(value).add(new BI(v.toString())).toString(), function () {
              cb(trie.root)
            })
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
    })
  })
}
exports.genTxTrie = function (txs, cb) {
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

exports.putBlock = function (txs) {
  let blockchain = new Blockchain({ blockDb: blockDb, detailsDb: detailsDb })
  return exports.getHead().then((b) => {
    return new Promise((resolve, reject) => {
      var block = new Block()
      block.header.parentHash = b.hash()
      let number = b.header.number.toString('hex') === '' ? 1 : new BN(b.header.number).add(new BN('1')).toNumber()
      block.header.number = ethUtil.toBuffer(number)

      let timestamp = Math.floor(Date.now() / 1000).toString(16)
      block.header.timestamp = Buffer.from(timestamp, 'hex')
      block.transactions = txs

      if (!_.isNil(block.transactions)) {
        // console.log('交易存在')
        exports.genTxTrie(block.transactions, (rootHash) => {
          block.header.transactionsTrie = rootHash
          let parentStateRoot = b.header.isGenesis() ? '0xd7f8974fb5ac78d9ac099b9ad5018bedc2ce0a72dad1827a1709da30580f0544' : b.header.stateRoot
          exports.genAccountTrie(block.transactions, parentStateRoot, (stateRoot) => {
            block.header.stateRoot = stateRoot
            blockchain.putBlock(block, (err) => {
              if (err) {
                reject(err)
              }
              resolve(block.hash().toString('hex'))
            })
          })
        })
      } else {
        // console.log('交易不存在')
        block.header.stateRoot = b.header.stateRoot
        blockchain.putBlock(block, (err) => {
          if (err) {
            reject(err)
          }
          resolve(block.hash().toString('hex'))
        })
      }
    })
  })
}

// exports.putBlock(transactions)
// exports.genAccountTrie(transactions, '0xd7f8974fb5ac78d9ac099b9ad5018bedc2ce0a72dad1827a1709da30580f0544', (r) => console.log(r.toString('hex')))
exports.getHead = function () {
  let blockchain = new Blockchain({ blockDb: blockDb, detailsDb: detailsDb })

  return new Promise((resolve, reject) => {
    blockchain.getHead((err, block) => {
      if (err) { reject(err) }
      resolve(block)
    })
  })
}
// exports.putBlock().then((v) => {
//   console.log(v)
// })
// exports.getHead().then((v)=>{
//     console.log(new ethUtil.BN(v.header.number).toString())
// })
