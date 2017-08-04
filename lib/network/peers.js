const router = require('koa-router')()
const os = require('os')
const joi = require('joi')
const Peer = require('../models/index').Peer
router.prefix('/api/peer')

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
    ctx.body = {msg: 'ip or other request is wrong:('}
    console.log(result)
    return
  }
  const key = '.peer.' + body.id
  body.state = 2
  console.log(body, key)
  // Peer.create(body)
  ctx.body = await Peer.create(body).then(() => {
    return Peer.findAll({
      where: {
        state: 2
      }
    }).then((result) => JSON.stringify(result))
  }).catch(() => {
    return {message: 'meow, a cat can not found  peers O.O '}
  })
})

router.get('/getPeers', async (ctx, next) => {
  ctx.body = await Peer.findAll({
    where: {
      state: 2
    }
  }).then((result) => {
    return JSON.stringify(result)
  })
})

router.post('/receiveTransaction', async (ctx, next) => {
})

router.post('/getBlocks', async (ctx, next) => {
})

module.exports = router
