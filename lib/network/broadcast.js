const peerCache = require('./peerCache').cache
const _ = require('lodash')
const requestJson = require('request-json')
// const

const Peers = () => {
  let received = {}
  peerCache.forEach((value, key, cache) => {
    if (value.state === 2) {
      received[key] = value
    }
  })
  return received
}

const broadcast = (type, data) => {
  // _.forOwn(peers, (value, key) => {})
  const peers = Peers()
  switch (type) {
    case 'block':
      _.forOwn(peers, (value, key) => {
        let url = 'http://' + value.host + ':' + value.port + '/api/block/'
        let client = requestJson.createClient(url)
        let postData = { type: 'toCommitBlock', data: data }
        client.post('receiveBlock/', postData, (err, res, body) => {})
      })
      break
    case 'transaction':
      _.forOwn(peers, (value, key) => {
        let url =
          'http://' + value.host + ':' + value.port + '/api/transaction/'
        let client = requestJson.createClient(url)
        let postData = { type: 'receiveTransaction', data: data }
        client.post('receiveTransaction/', postData, (err, res, body) => {})
      })
      break
    case 'voteBlock':
      _.forOwn(peers, (value, key) => {
        let url = 'http://' + value.host + ':' + value.port + '/api/block/'
        let client = requestJson.createClient(url)
        let postData = { type: 'voteBlock', data: data }
        client.post('vote/', postData, (err, res, body) => {})
      })
      break
    default:
  }
}
exports.peers = Peers
exports.broadcast = broadcast
