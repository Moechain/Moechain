const request = require('request')

function _check () {
  request('http://localhost:3001/api/peer/ping', function (err, res, body) {
    if (err) { // remove this peer
    }
    console.log(body)
  })
}
exports.checkPeerState = () => {
  setInterval(() => {
    _check()
  }, 5000)
}
