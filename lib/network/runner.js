const request = require('request')
const [db, findOption] = require('../db')
const _ = require('lodash')

function _getPeers (id, ip, data) {
  request(ip + '/api/peer/getPeers', function (err, res, body) {
    if (err) {
      id = '.peer.' + id
      data.state = 1
      db.put(id, data)
    }
// 循环，保存
    _.forOwn(body, (value, key) => {
      db.put(key, body[key])
    })
  })
}
function _check (id, ip, data) {
  request(ip + '/api/peer/ping', {timeout: 1200}, function (err, res, body) {
    id = '.peer.' + id
    if (err) {
      data.state = 1
      db.put(id, data)
    }
    data.staten = 2
    db.put(id, data)
  })
}

/* exports.checkPeerState = () => {
  setInterval(() => {
    _check()
  }, 5000)
}
*/
