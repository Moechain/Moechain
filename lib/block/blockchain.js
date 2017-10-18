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
            json['publicKey'] = new Tx(item.value)
              .getSenderPublicKey()
              .toString('hex')
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
          json['publicKey'] = item.publicKey
          return json
        })
        resolve(finalResult)
      })
    )
  })
}
exports.getBlock = flag => {
  let blockchain = new Blockchain({ blockDb: blockDb, detailsDb: detailsDb })
  return new Promise((resolve, reject) => {
    blockchain.getBlock(flag, function(err, block) {
      if (err) {
        reject(err)
      }
      resolve(block)
    })
  })
}
exports.getBlocks = (start, end) => {
  let blockchain = new Blockchain({ blockDb: blockDb, detailsDb: detailsDb })
  let max = end - start
  return new Promise((resolve, reject) => {
    blockchain.getBlocks(start, max, 0, false, function(err, blocks) {
      if (err) {
        reject(err)
      }
      resolve(blocks)
    })
  })
}
// exports.querySenatorsAndVotes().then(w => console.log(w))
// exports.getBlocks(1, 4).then(b => {
//   b.forEach(item => {
//     console.log(item.header.number)
//   })
// })
// exports.getBlock(1).then(b=>{console.log(b.header.number)})
