// let waitting = async (stateRoot = 'tan90', block) => {
//   if ((stateRoot = 'tan90')) {

//   }
// }
const _ = require('lodash')
const blockchain = require('../block/blockchain')
const observe = require('observe')
const Block = require('../modules/moechain-block')
let object = { block: {}, votes: {}, stateRoot: {} }
let stateRootStore = {
  set: (s, prop, value) => {
    s[prop] = value
  }
}

let stateRootModel = new Proxy({}, stateRootStore)

exports.stateRootModel = stateRootModel

let waitting = observe(object)
waitting.on('change', function(change) {
  console.log(change)
  if (change.property[0] === 'block') {
    //   console.log(waitting.subject.block)
    let p = change.property[1]
    console.log(waitting.block[p])
  }
  if (change.property[0] === 'votes') {
    let p = change.property[1]
    // console.log(waitting.votes[p])
    if (waitting.votes[p] > 2 * Math.floor((101 - 1) / 3)) {
      let block = new Block(waitting.block[p])
      if (_.isNil(block.transactions)) {
        blockchain.commitBlock(block)
      } else {
        let stateRoot = stateRootModel[p]
        blockchain.commitBlock({ block, stateRoot })
      }
    }
  }
})

exports.observer = waitting
