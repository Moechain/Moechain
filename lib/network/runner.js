const request = require('request')
const requestJson = require('request-json');
const [db, findOption] = require('../db')
const _ = require('lodash')
const schedule = require('node-schedule')
const cache = require('./peerCache').cache
const config = require('../../config.json')
const Utils = require('../utils')
const utils = new Utils()
/**
 * 
 * @param {string} id is a string ,and i forget it
 * @param {object} data is from cache, it include host, port
 * if this peer is bad, this stete will be 1, and will be given a lockTimestamp(s)
 * after 6 hour(21600s) it will be release
 */
function _getPeers(id, data) {
  let url = 'http://' + data.host + ':' + data.port + '/api/peer/'
  let client = requestJson.createClient(url);

  let postData = { host: config.host, port: config.port }

  client.post('connect/', postData, function (err, res, body) {
    if (err) {
      console.log('err')
      console.log(err)
      data.state = 1
      data.lockTimestamp = utils.timestamp()
      cache.set(id, data)
      return
    }
    console.log(res.statusCode, body);
    _.forOwn(body, (value, key) => {
      cache.set(key, body[key])
    })
  });
}

function _check(id, data) {
  request('http://' + data.ip + ':' + data.port + '/api/peer/ping', { timeout: 1200 }, function (err, res, body) {
    console.log(body)
    if (err) {
      console.log(err)
      data.state = 1
      db.put(id, data)
      console.log('nooooooo')
      return
    }
    data.staten = 2
    console.log('yeah')
    db.put(id, data)
  })
}

const check = () => {
  let option = findOption('.peer')
  var received = {}
  db.createReadStream(option)
    .progress((data) => {
      received[data.key] = data.value
    })
    .then(() => {
      _.forOwn(received, (value, key) => {
        let data = received[key]
        _check(key, data)
        console.log(data.ip)
      })
    })
    .done()
}

let getPeers = () => {
  let received = []
  cache.forEach(function (value, key, cache) {
    if (value.state == 2) {
      received[key] = value
    }

    _.forOwn(received, (value, key) => {
      if (value.state === 2) {
        _getPeers(key, value)
      }
    })
  })
}

const peerRunner = () => {
  schedule.scheduleJob('*/30 * * * * *', () => {
    console.log('get peers ' + new Date())
    getPeers()
  })
}

const checkRunner = () => {
  schedule.scheduleJob('10 */10 * * * *', () => {
    console.log('check peers' + new Date())
    check()
  })
}

exports.runner = () => {
  checkRunner()
  peerRunner()
}
