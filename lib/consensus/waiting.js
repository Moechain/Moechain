// let waitting = async (stateRoot = 'tan90', block) => {
//   if ((stateRoot = 'tan90')) {

//   }
// }
const _ = require('lodash')
const blockchain = require('../block/blockchain')

let waitting = {
  set: (w, prop, value) => {
    if (prop === 'block' || prop === 'stateRoot' || prop === 'votes') {
      w[prop] = value
    }
    let id
    if(!_.isNil(w.block)){
        id = w.block.hash().toString('hex')
    }
    if (!_.isNil(w.votes)) {
      if (w.votes.id > 2 * (Math.floor((101 - 1) / 3))) {

        if (!_.isNil(w.stateRoot)) {
          let block = { block: w.block, stateRoot: w.stateRoot }
          setImmediate(async () => {
            try {
              await blockchain.commitBlock(block)
            } catch (error) {
              console.log(error)
            }
          })
        } else {
          let block = w.block
          setImmediate(async () => {
            try {
              await blockchain.commitBlock(block)
            } catch (error) {
              console.log(error)
            }
          })
        }

      }
    }
    // if (_.size(txs) > 2) {
    //   chain
    //     .putBlock(transactions)
    //     .then(hash => console.log(hash))
    //     .catch(err => console.log(err))

    //   chain.getHead().then(n => {
    //     console.log(n.header.number)
    //   })
    // }
  }
}

let waitting = new Proxy({}, waitting)
