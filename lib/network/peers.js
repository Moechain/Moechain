const router = require('koa-router')()
const os = require('os')
const joi = require('joi')
// const level = require('level')
// const appRoot = require('app-root-path')
const BN = require('ethereumjs-util').BN

const Utils = require('../utils')
const utils = new Utils()

const blockchain = require('../block/blockchain')

const cache = require('./peerCache').cache

router.prefix('/api/peer')

/**
 * api/peer/ping will return version, os name and the height of blocks
 */
router.get('/ping', async (ctx, next) => {
  let block = await blockchain.getHead()
  ctx.body = {
    version: 'v1.0',
    os: os.type(),
    blockHeight: new BN(block.header.number).toString()
  }
})

/**
 * receive the url of peer and return your peer list to this peer
 */
router.post('/connect', async (ctx, next) => {
  const req = ctx.request
  const body = req.body

  const schema = {
    host: joi.string().required(),
    port: joi.number().integer()
  }
  const result = joi.validate(body, schema)
  if (result.error !== null) {
    ctx.body = { msg: 'ip or other request is wrong:(' }
  }
  const key = utils.hash(body.host + body.port).toString('hex')
  // body.state = 2
  let storeObj = {
    host: body.host,
    port: body.port,
    state: 2
  }
  let received = {}

  cache.set(key, storeObj)
  cache.forEach(function(value, key, cache) {
    if (value.state === 2) {
      received[key] = value
    }
  })

  // return res.json(received)
  ctx.body = received
})

router.get('/getPeers', async (ctx, next) => {
  var received = {}

  cache.forEach(function(value, key, cache) {
    if (value.state === 2) {
      received[key] = value
    }
  })

  ctx.body = received
})

// router.post('/receiveTransaction', async (ctx, next) => {
// })

// router.post('/getBlocks', async (ctx, next) => {
// })

module.exports = router
