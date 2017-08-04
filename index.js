const program = require('commander')
const Koa = require('koa')
const app = new Koa()
const bodyParser = require('koa-bodyparser')
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
app.use(bodyParser())
app.use(peer.routes(), peer.allowedMethods())

// app.use(bodyparser({
//  enableTypes: ['json', 'form', 'text']
// }))
app.listen(config.port)

// peerRunner.checkPeerState()

console.log('Moechain is listening on port: %s :-)', config.port)
