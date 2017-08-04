const Router = require('koa-router')
const os = require('os')
const joi = require('joi')

const router = new Router({
  prefix: '/api/peer'
})

router.get('/ping', async (ctx, next) => {
  /* const instance = peerSchema.lookupType('peerPackage.peer')
  ctx.body = await db.get('.peer.1').then(val => {
    let msg = instance.decode(val)
    return msg
  }) */
  ctx.body = {
    version: 'v1.0',
    os: os.hostname,
    state: 'alive',
    blockHeight: ''
  }
})

router.post('/connect', async (ctx, next) => {
  const body = ctx.request.body
  console.log(body)
  const schema = {
    id: joi.string(),
    ip: joi.string().ip({
      version: [
        'ipv4',

        'ipv6'
      ],
      cidr: 'optional'
    }),
    port: joi.number().integer()
  }
  const result = joi.validate(body, schema)
  if (result.error !== null) {
    ctx.body = {msg: 'wrong ip or other thing'}
    console.log(result)
    return
  }
  const key = '.peer.' + body.id
  body.state = 2
  console.log(body, key)
  /* db.put(key, body)
  .then(ctx.body = {msg: 'connected'})
  .catch(err => {
    ctx.body = err
  }) */

  // store(body.id, body.address)
})

router.get('/getPeers', async (ctx, next) => {
  const option = {prefix: '.peer', limit: 200}
  ctx.body = await db.find(option, function (key, value) {
    return new Promise((resolve) => {
      console.log(key)
      return resolve(key)
    })
  })
})

router.post('/receiveTransaction', async (ctx, next) => {
})

router.post('/getBlocks', async (ctx, next) => {
})

module.exports = router
