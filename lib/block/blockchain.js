const appRoot = require('app-root-path')
const level = require('level')
const fs = require('fs')
const BI = require('jsbn').BigInteger
const ethUtil = require('ethereumjs-util')
const BN = ethUtil.BN
const _ = require('lodash')
const Trie = require('merkle-patricia-tree')
const concat = require('concat-stream')

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
const transactionDb = level(appRoot + '/data/transactionDb', {
  valueEncoding: 'json'
})

exports.getAccounts = txs => {
  let transactions = []

  txs.forEach(item => {
    const tx = new Tx(item)
    transactions.push(tx)
  })

  let to = {}
  let from = {}

  transactions.forEach((item, index) => {
    const value = new BI(item.value.toString('hex'))
    const toAccount = item.to.toString('hex')
    if (to.hasOwnProperty(toAccount)) {
      to[toAccount] = new BI(to[toAccount]).add(value).toString()
    } else {
      to[toAccount] = value.toString()
    }
  })

  transactions.forEach((item, index) => {
    const value = new BI(item.value.toString('hex'))
    const fromAccount = item.from.toString('hex')
    if (from.hasOwnProperty(fromAccount)) {
      from[fromAccount] = new BI(from[fromAccount]).add(value).toString()
    } else {
      from[fromAccount] = value.toString()
    }
  })
  transactions = null
  from = _.mapValues(from, v => {
    return new BI(v).multiply(new BI('-1')).toString()
  })
  _.mapKeys(from, (value, key) => {
    if (_.has(to, key)) {
      const trueValue = new BI(to[key]).add(new BI(value)).toString()
      to[key] = trueValue
    }
    to[key] = value
  })
  return Promise.resolve(to)
}
exports.genAccountTrie = async (txs, stateRoot) => {
  let account = await exports.getAccounts(txs)
  stateRoot = _.isNil(stateRoot) ? Buffer.from('', 'hex') : stateRoot
  let rootHash = _.isBuffer(stateRoot)
    ? stateRoot
    : Buffer.from(stateRoot, 'hex')
  // console.log('r', rootHash)
  return new Promise((resolve, reject) => {
    const trie =
      rootHash.toString('hex') === ''
        ? new Trie(accountDb)
        : new Trie(accountDb, rootHash)
    trie.checkpoint()
    _.forEach(account, (value, key) => {
      if (key === Object.keys(account).pop()) {
        trie.get(key, (e, v) => {
          if (_.isNil(v)) {
            trie.put(key, value, err => {
              if (err) reject(err)
              resolve(trie)
            })
          } else {
            trie.put(
              key,
              new BI(v.toString()).add(new BI(value)).toString(),
              err => {
                if (err) reject(err)
                resolve(trie)
              }
            )
          }
        })
      }
      trie.get(key, (e, v) => {
        if (_.isNil(v)) {
          trie.put(key, value, err => {
            if (err) reject(err)
          })
        } else {
          trie.put(
            key,
            new BI(v.toString()).add(new BI(value)).toString(),
            err => {
              if (err) reject(err)
            }
          )
        }
      })
    })
  })
}

exports.getHead = () => {
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
exports.genTxTrie = (txs, isGenesis) => {
  let txTrie = new Trie()
  // txTrie.checkpoint()
  return new Promise((resolve, reject) => {
    txs.forEach((item, index) => {
      const tx = new Tx(item)
      const serializedTx = tx.serialize()
      // console.log(tx)
      if (index === txs.length - 1) {
        txTrie.put(ethUtil.rlp.encode(index), serializedTx, function() {
          resolve(txTrie)
        })
        return
      }
      txTrie.put(ethUtil.rlp.encode(index), serializedTx)
    })
  })
}

exports.generateBlock = txs => {
  // let blockchain = new Blockchain({ blockDb: blockDb, detailsDb: detailsDb })
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
        let getTireHash = async () => {
          let parentStateRoot = b.header.isGenesis()
            ? '0xd7f8974fb5ac78d9ac099b9ad5018bedc2ce0a72dad1827a1709da30580f0544'
            : b.header.stateRoot
          let stateRoot = await exports.genAccountTrie(
            block.transactions,
            parentStateRoot
          )
          let transactionsTrie = await exports.genTxTrie(block.transactions)
          return { stateRoot, transactionsTrie }
        }

        getTireHash().then(result => {
          const { stateRoot, transactionsTrie } = result
          block.header.transactionsTrie = transactionsTrie.root
          block.header.stateRoot = stateRoot.root
          resolve({ stateRoot, block })
        })
      } else {
        // console.log('交易不存在')
        block.header.stateRoot = b.header.stateRoot
        resolve(block)
      }
    })
  })
}

exports.putBlock = block => {
  let blockchain = new Blockchain({ blockDb: blockDb, detailsDb: detailsDb })
  return new Promise((resolve, reject) => {
    blockchain.putBlock(block, err => {
      if (err) {
        reject(err)
      }
      resolve(block)
    })
  })
}
exports.revertBlock = async block => {
  try {
    // let result = await exports.generateBlock(transactions)
    let result = block
    // stateRoot.revert()
    if (_.isNil(result.stateRoot)) {
      return Promise.resolve('revert success')
    } else {
      result.stateRoot.revert()
      // result.transactionsTrie.revert()
      return Promise.resolve('revert success')
    }
  } catch (err) {
    console.log(err)
  }
}
exports.commitBlock = async block => {
  try {
    // let result = await exports.generateBlock(transactions)
    let result = block
    // stateRoot.revert()
    if (_.isNil(result.stateRoot)) {
      return exports.putBlock(result)
    } else {
      result.stateRoot.commit()
      // result.transactionsTrie.commit()
      return exports.putBlock(result.block)
    }
  } catch (err) {
    console.log(err)
  }
}

exports.querySenatorsAndVotes = async () => {
  return new Promise((resolve, reject) => {
    transactionDb.createReadStream().pipe(
      concat(data => {
        //这里得到重复的议员
        const repetitionSenators = data
          .filter((item, index) => {
            return item.value.type === '0x01' && item.value.data !== '0x'
          })
          .map((item, index) => {
            let json = {}
            json['name'] = ethUtil.toBuffer(item.value.data).toString()
            json['address'] = new Tx(item.value).from.toString('hex')
            return json
          })
        //去重
        const senators = _.uniqWith(repetitionSenators, _.isEqual)
        //过滤获得类型为投票的交易
        const result = data
          .filter((item, index) => {
            return item.value.type === '0x02' && item.value.data !== '0x'
          })
          .map(item => {
            return ethUtil.toBuffer(item.value.data).toString()
          })
        //获取议员及议员票数
        const finalResult = senators.map((item, index) => {
          const name = item.name

          let votes = []
          for (let [index, senator] of result.entries()) {
            senator === name && votes.push(index)
          }

          let json = {}
          json['name'] = name
          json['votes'] = votes.length
          json['address'] = item.address
          return json
        })
        resolve(finalResult)
      })
    )
  })
}
// this is a test

// let w = async transactions => {
//   transactions = [
//     [
//       '0x',
//       '0x28afa8e02eeeef86d720db1c04dcfabd93ae03a1',
//       '0x0a',
//       '0x015eed7557ee',
//       '0x',
//       '0x1b',
//       '0x2e7251cabdd37572775542dc0bc0e651583c66db8cf19b1d2cd39a1eaca87703',
//       '0x05f753b50688cb48a671f72cd46f415a635545f2d50163a7a2b0b8e73bda930f'
//     ],
//     [
//       '0x',
//       '0x38afa8e02eeeef86d720db1c04dcfabd93ae03a1',
//       '0x01',
//       '0x015eed7557ee',
//       '0x',
//       '0x1b',
//       '0xbfbe9276937212191aa9983e7b8e67d29ffdf9067c73b5ead2942bc6c2b9be61',
//       '0x1a9ef4fc01328a3afe10118401d690eb9e09ba17aae9800e92108beb864fa03e'
//     ],
//     [
//       '0x02',
//       '0x',
//       '0x03',
//       '0x015eed7557ee',
//       '0x66756c696e67',
//       '0x1b',
//       '0x8c0fc5a062929de537daabab5d3085bec08201a8a5e27b57aeebd804fbb0b313',
//       '0x5b1a07fd5f52d0451d6df9cd9fdd3c3bac50fb2c696131f760009b44cfd44fa2'
//     ],
//     [
//       '0x01',
//       '0x',
//       '0x03',
//       '0x015eed7557ee',
//       '0x66756c696e67',
//       '0x1c',
//       '0xdba59d90799c56a46a09605296d7297186ca5d7cfb4b266231255e74fa800286',
//       '0x65a12f17edc18633b8124757b66a4b9686f56a14f912191a99ef3953cedc789f'
//     ],
//     [ '0x01',
//     '0x',
//     '0x02',
//     '0x015eed7557ee',
//     '0x6d656f77',
//     '0x1b',
//     '0x46fbb42bd36ee3e706e18b0db39d60ef47d158bf55585d5c0d3f5b35b48558d1',
//     '0x2865555edcb8dc024e0644577b0bcf829f968626cd6bcd0411f9ebb7080cdb55' ]
//   ]
//   try {
//     let result = await exports.generateBlock(transactions)
//     return exports.commitBlock(result)
//   } catch (error) {
//     console.log(error)
//   }

//   /*
// //   //   return exports.commitBlock(result)
// //   //   //  or
// //   //   //  return exports.revertBlock(result)
// */
// }

// w().then(block => {
//   let transactions = block.transactions
//   let blockNumber = new ethUtil.BN(block.header.number).toString()
//   transactions = transactions.map((v, i) => {
//     const key =
//       'block:' + blockNumber + '-hash:' + new Tx(v).hash().toString('hex')
//     const txDetail = {
//       blockNumber: blockNumber,
//       type: _.toString(v[0]),
//       to: _.toString(v[1]),
//       value: _.toString(v[2]),
//       timestamp: _.toString(v[3]),
//       data: _.toString(v[4]),
//       v: _.toString(v[5]),
//       r: _.toString(v[6]),
//       s: _.toString(v[7])
//     }
//     transactionDb.put(key, txDetail, err => {
//       if (err) console.log(err)
//     })
//   })
// })

// exports.getHead().then((b)=>console.log(new ethUtil.BN(b.header.number).toNumber()))
