var express = require('express')
var router = express.Router()
const os = require('os')
const joi = require('joi')
// const level = require('level')
// const appRoot = require('app-root-path')
const BN = require('ethereumjs-util').BN

const Utils = require('../utils')
const utils = new Utils()

const blockchain = require('../block/blockchain')

const cache = require('./peerCache').cache

/**
 * api/peer/ping will return version, os name and the height of blocks
 */
router.get('/ping', (req, res) => {
  blockchain.getHead().then(block => {
    return res.status(200).json({
      version: 'v1.0',
      os: os.type(),
      blockHeight: new BN(block.header.number).toString()
    })
  })
})

/**
 * receive the url of peer and return your peer list to this peer
 */
router.post('/connect', (req, res) => {
  const body = req.body

  const schema = {
    host: joi.string().required(),
    port: joi.number().integer()
  }
  const result = joi.validate(body, schema)
  if (result.error !== null) {
    return res.json({ msg: 'ip or other request is wrong:(' })
  }
  const key = utils.hash(body.host + body.port).toString('hex')
  // body.state = 2
  let storeObj = {
    host: body.host,
    port: body.port,
    state: 2
  }
  var received = {}

  cache.set(key, storeObj)
  cache.forEach(function(value, key, cache) {
    if (value.state === 2) {
      received[key] = value
    }
  })

  return res.json(received)
})

router.get('/getPeers', (req, res) => {
  var received = {}

  cache.forEach(function(value, key, cache) {
    if (value.state === 2) {
      received[key] = value
    }
  })

  return res.json(received)
})

// router.post('/receiveTransaction', async (ctx, next) => {
// })

// router.post('/getBlocks', async (ctx, next) => {
// })

module.exports = router
