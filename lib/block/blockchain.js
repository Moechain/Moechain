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

let transactions = [
  [
    '0x',
    '0x28afa8e02eeeef86d720db1c04dcfabd93ae03a1',
    '0x0a',
    '0x015eed7557ee',
    '0x',
    '0x1b',
    '0x2e7251cabdd37572775542dc0bc0e651583c66db8cf19b1d2cd39a1eaca87703',
    '0x05f753b50688cb48a671f72cd46f415a635545f2d50163a7a2b0b8e73bda930f'
  ],
  [
    '0x',
    '0x38afa8e02eeeef86d720db1c04dcfabd93ae03a1',
    '0x01',
    '0x015eed7557ee',
    '0x',
    '0x1b',
    '0xbfbe9276937212191aa9983e7b8e67d29ffdf9067c73b5ead2942bc6c2b9be61',
    '0x1a9ef4fc01328a3afe10118401d690eb9e09ba17aae9800e92108beb864fa03e'
  ]
]

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

exports.genAccountTrie = function(txs, stateRoot, cb) {
  let transactions = []

  txs.forEach(item => {
    let tx = new Tx(item)
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

  // let formatFrom = []
  // _.keys(from).forEach(key => {
  //   let value = from[key]
  //   let result = {}
  //   result[key] = new BI(value).multiply(new BI('-1')).toString()
  //   formatFrom.push(result)
  // })
  // let formatTo = []
  // _.keys(to).forEach(key => {
  //   let value = to[key]
  //   let result = {}
  //   result[key] = value
  //   formatTo.push(result)
  // })

  // from = formatFrom
  // formatFrom = null
  // to = formatTo
  // formatTo = null
  from = _.mapValues(from, function(v) {
    return new BI(v).multiply(new BI('-1')).toString()
  });
  console.log('from:', from)
  console.log('to:', to)
  console.log('m',_.merge(from, to))

  return
  stateRoot = _.isNil(stateRoot) ? Buffer.from('', 'hex') : stateRoot

  let rootHash = _.isBuffer(stateRoot)
    ? stateRoot
    : Buffer.from(stateRoot, 'hex')
  function putFromAccount(cb) {
    let trie =
      rootHash.toString('hex') === ''
        ? new Trie(accountDb)
        : new Trie(accountDb, rootHash)
    _.forEach(from, function(value, key) {
      if (key === Object.keys(from).pop()) {
        trie.get(key, (e, v) => {
          if (_.isNil(v)) {
            trie.put(key, '-' + value, function() {
              cb(trie.root)
            })
          } else {
            trie.put(
              key,
              new BI(v.toString()).subtract(new BI(value)).toString(),
              function() {
                cb(trie.root)
              }
            )
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
  putFromAccount(fromRootHash => {
    let trie = new Trie(accountDb, fromRootHash)
    _.forEach(to, function(value, key) {
      if (key === Object.keys(to).pop()) {
        trie.get(key, (e, v) => {
          if (_.isNil(v)) {
            trie.put(key, value, function() {
              cb(trie.root)
            })
          } else {
            trie.put(
              key,
              new BI(value).add(new BI(v.toString())).toString(),
              function() {
                cb(trie.root)
              }
            )
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
exports.genTxTrie = function(txs, cb) {
  let txTrie = new Trie(transactionDb)
  txs.forEach((item, index) => {
    const tx = new Tx(item)
    const serializedTx = tx.serialize()
    // console.log(tx)
    if (index === txs.length - 1) {
      txTrie.put(ethUtil.rlp.encode(index), serializedTx, function() {
        cb(txTrie.root)
      })
      return
    }
    txTrie.put(ethUtil.rlp.encode(index), serializedTx)
  })
}

exports.putBlock = function(txs) {
  let blockchain = new Blockchain({ blockDb: blockDb, detailsDb: detailsDb })
  return exports.getHead().then(b => {
    return new Promise((resolve, reject) => {
      let block = new Block()
      block.header.parentHash = b.hash()
      let number =
        b.header.number.toString('hex') === ''
          ? 1
          : new BN(b.header.number).add(new BN('1')).toNumber()
      block.header.number = ethUtil.toBuffer(number)

      let timestamp = Math.floor(Date.now() / 1000).toString(16)
      block.header.timestamp = Buffer.from(timestamp, 'hex')
      block.transactions = txs

      if (!_.isNil(block.transactions)) {
        // console.log('交易存在')
        exports.genTxTrie(block.transactions, rootHash => {
          block.header.transactionsTrie = rootHash
          let parentStateRoot = b.header.isGenesis()
            ? '0xd7f8974fb5ac78d9ac099b9ad5018bedc2ce0a72dad1827a1709da30580f0544'
            : b.header.stateRoot
          exports.genAccountTrie(
            block.transactions,
            parentStateRoot,
            stateRoot => {
              block.header.stateRoot = stateRoot
              blockchain.putBlock(block, err => {
                if (err) {
                  reject(err)
                }
                resolve(block.hash().toString('hex'))
              })
            }
          )
        })
      } else {
        // console.log('交易不存在')
        block.header.stateRoot = b.header.stateRoot
        blockchain.putBlock(block, err => {
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
exports.getHead = function() {
  let blockchain = new Blockchain({ blockDb: blockDb, detailsDb: detailsDb })

  return new Promise((resolve, reject) => {
    blockchain.getHead((err, block) => {
      if (err) {
        reject(err)
      }
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
exports.genAccountTrie(transactions)
