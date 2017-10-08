var express = require('express')
var router = express.Router()
const joi = require('joi')

const Utils = require('../utils')
const utils = new Utils()
const cache = require('./peerCache').cache
const Tx = require('../modules/moechain-tx')

const txCache = require('./transactionCache').cache
const txModel = require('./transactionCache').model
const peerCache = require('./peerCache').cache
const requestJson = require('request-json')

router.post('/sendTransaction', (req, res) => {
  const body = req.body
  const schema = {
    to: joi.string().required().min(40).max(40),
    priviteKey: joi.string().min(64).max(64).required(),
    value: joi.number().integer().required(),
    data: joi.string(),
    timestamp: joi.number().integer().required()
  }

  const result = joi.validate(body, schema)

  if (result.error !== null) {
    return res.json({ msg: 'something wrong, there may have a wrong value' })
  }

  let validatePrivateKey = utils.validatePrivateKey(Buffer.from(body.priviteKey, 'hex'))

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
  // txCache.set(tx.hash().toString('hex'), tx.serialize().toString('hex'))
  // board to Moechain net
  peerCache.forEach(function (value, key, cache) {
    if (value.state == 2) {
      let url = 'http://' + value.host + ':' + value.port + '/transaction/'
      let client = requestJson.createClient(url)
      let postData = { serializeTx: tx.serialize().toString('hex') }
      client.post('receiveTransaction/', postData, function (err, res, body) {
        if (err) {
          console.log(err)
        }
      })
    }
  })

  return res.json(body)
})

router.post('/receiveTransaction', (req, res) => {
  const body = req.body
  let tx = new Tx(Buffer.from(body.serializeTx, 'hex'))

  let validateTransaction = tx.verifySignature()
  if (!validateTransaction) {
    return res.json({ msg: 'transactoion is wrong' })
  }

  txCache.set(tx.hash().toString('hex'), tx.toJSON())
  txModel[tx.hash().toString('hex')] = tx.toJSON()

  return res.json({ msg: 'transaction is received' })
})

module.exports = router
