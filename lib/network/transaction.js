const router = require('koa-router')()
const joi = require('joi')

const Utils = require('../utils')
const utils = new Utils()
// const cache = require('./peerCache').cache
const Tx = require('../modules/moechain-tx')

const txModel = require('./transactionCache').model
const peerCache = require('./peerCache').cache
const requestJson = require('request-json')
const broadcast = require('./broadcast').broadcast
router.prefix('/api/transaction')

router.post('/sendTransaction', async (ctx, next) => {
  const req = ctx.request
  const body = req.body
  const schema = {
    to: joi
      .string()
      .required()
      .min(40)
      .max(40),
    priviteKey: joi
      .string()
      .min(64)
      .max(64)
      .required(),
    value: joi
      .number()
      .integer()
      .required(),
    data: joi.string(),
    timestamp: joi
      .number()
      .integer()
      .required()
  }

  const result = joi.validate(body, schema)

  if (result.error !== null) {
    return res.json({ msg: 'something wrong, there may have a wrong value' })
  }

  let validatePrivateKey = utils.validatePrivateKey(
    Buffer.from(body.priviteKey, 'hex')
  )

  if (!validatePrivateKey) {
    return res.json({ msg: 'wrong PrivateKey' })
  }

  let tx = new Tx({
    to: Buffer.from(body.to, 'hex'),
    value: body.value,
    timestamp: body.timestamp,
    data: body.data
  })
  tx.sign(Buffer.from(body.priviteKey, 'hex'))
  console.log(tx.toJSON())
  let postData = { serializeTx: tx.serialize().toString('hex') }
  // txModel
  txModel[tx.hash().toString('hex')] = tx.toJSON()
  // board to Moechain net
  broadcast('transaction', postData)
  ctx.body = body
})

router.post('/receiveTransaction', async (ctx, next) => {
  const req = ctx.request
  const body = req.body
  let tx = new Tx(Buffer.from(body.serializeTx, 'hex'))

  let validateTransaction = tx.verifySignature()
  if (!validateTransaction) {
    ctx.body = { msg: 'transactoion is wrong' }
  }

  txModel[tx.hash().toString('hex')] = tx.toJSON()
  ctx.body = { msg: 'transaction is received' }
})

module.exports = router
