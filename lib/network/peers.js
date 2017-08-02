const Router = require('koa-router')
const os = require('os')
const joi = require('joi')

const router = new Router({
  prefix: '/api/peer'
})

router.get('/ping', async (ctx, next) => {
  ctx.body = {
    version: 'v1.0',
    os: os.hostname,
    state: 'alive',
    blockHeight: ''
  }
})

router.post('/connect', async (ctx, next) => {
  const body = ctx.request.body
  // console.log(body)
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
    ctx.body = 'something wrong'
    return
  }
  ctx.body = body

  // store(body.id, body.address)
})

router.get('/getPeers', async (ctx, next) => {
})

router.post('/receiveTransaction', async (ctx, next) => {
})

router.post('/getBlocks', async (ctx, next) => {
})

module.exports = router
