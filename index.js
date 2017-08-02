const program = require('commander')
const Koa = require('koa')
const app = new Koa()
const bodyParser = require('koa-bodyparser')
const config = require('./config.json')
const peer = require('./lib/network/peers')
const peerRunner = require('./lib/network/runner')

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
app.use(async (ctx) => {
  if (ctx.url === '/' && ctx.method === 'GET') {
    // 当GET请求时候返回表单页面
    let html = `
      <h1>koa2 request post demo</h1>
      <form method="POST" action="/api/peer/connect">
        <p>userName</p>
        <input name="userName" /><br/>
        <p>nickName</p>
        <input name="nickName" /><br/>
        <p>email</p>
        <input name="email" /><br/>
        <button type="submit">submit</button>
      </form>
    `
    ctx.body = html
  }
})

app.listen(config.port)

// peerRunner.checkPeerState()

console.log('Moechain is listening on port: %s :-)', config.port)
