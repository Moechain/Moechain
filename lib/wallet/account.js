const router = require('koa-router')()
const cache = require('./cache').cache
const Utils = require('../utils')
const utils = new Utils()

router.prefix('/api/wallet/account')

router.get('/', async ctx => {
  ctx.body = { w: 'www' }
})

router.get('/createAccount', async ctx => {
  const privateKey = utils.generatorPrivateKey()
  const publicKey = utils.generatorPublicKey(privateKey).toString('hex')
  const address = utils.privateToAddress(privateKey).toString('hex')
  ctx.body = { privateKey: privateKey.toString('hex'), publicKey, address }
})

//it is not safely
router.post('/login', async ctx => {
  let privateKey = ctx.request.body.privateKey
  privateKey = Buffer.from(privateKey, 'hex')
  const publicKey = utils.generatorPublicKey(privateKey)
  cache.privateKey = privateKey.toString('hex')
  cache.publicKey = publicKey
  cache.address = utils.publicToAddress(publicKey)
  ctx.body = { msg: 'login successful' }
})
module.exports = router
