const peerCache = require('./peerCache').cache
const _ = require('lodash')

const peers = () => {
  let received = {}
  peerCache.forEach((value, key, cache) => {
    if (value.state === 2) {
      received[key] = value
    }
  })
  return received
}

const broadcast = (peers, type) => {
  _.forOwn(peers, (value, key) => {})
}
exports.peers = peers
