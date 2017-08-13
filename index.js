const program = require('commander')
const express = require('express')
const logger = require('morgan')
const bodyParser = require('body-parser')

const config = require('./config.json')
const peer = require('./lib/network/peers')
// const peerRunner = require('./lib/network/runner')

program
  .version(config.version)
  .option('-i, --integer <n>', 'An integer argument', parseInt)
  .option('-p, --port <n>', 'a port for Moechain', parseInt)
  .parse(process.argv)

if (program.port) {
  config.port = program.port
}

var app = express()

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use('/api/peer', peer)
app.listen(config.port)

// peerRunner.checkPeerState()

console.log('Moechain is listening on port: %s :-)', config.port)

// var schedule = require('node-schedule')

// schedule.scheduleJob('*/2 * * * * *', function () {
 // console.log('scheduleCronstyle:' + new Date())
// })
