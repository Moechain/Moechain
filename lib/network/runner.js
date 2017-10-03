const request = require('request')
const [db, findOption] = require('../db')
const _ = require('lodash')
const schedule = require('node-schedule')

function _getPeers (id, data) {
  request('http://' + data.ip + ':' + data.port + '/api/peer/ping', {timeout: 1200}, function (err, res, body) {
    if (err) {
      data.state = 1
      db.put(id, data)
      return
    }
// 循环，保存
    _.forOwn(body, (value, key) => {
      db.put(key, body[key])
    })
  })
}

function _check (id, data) {
  request('http://' + data.ip + ':' + data.port + '/api/peer/ping', {timeout: 1200}, function (err, res, body) {
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
  let option = findOption('.peer')
  var received = {}
  db.createReadStream(option)
   .progress((data) => {
     received[data.key] = data.value
   })
    .then(() => {
      _.forOwn(received, (value, key) => {
        let data = received[key]
        if (data.state === 2) {
          _getPeers(key, data)
        }
      })
    })
    .done()
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
