// const LRU = require("lru-cache")
const _ = require('lodash')

const chain = require('../block/blockchain')

// exports.cache = LRU({
//     max: 500,
//     maxAge: 1000 * 60 * 60
// })

let doSomething = {
  set: (txs, prop, value) => {
    txs[prop] = value
    let transactions = _.values(txs)
    if (_.size(txs) > 2) {
      chain.putBlock(transactions)
        .then((hash) => console.log(hash))
        .catch((err) => console.log(err))

      chain.getHead()
        .then((n) => {
          console.log(n.header.number)
        })
    }
  }
}

let model = new Proxy({}, doSomething)

exports.model = model
