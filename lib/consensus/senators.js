const express = require('express')
const router = express.Router()
const joi = require('joi')
// const db = require('../db')
const Tx = require('../modules/moechain-tx')
// const Utils = require('../utils')
// const utils = new Utils()

// sign in senator , moechain will select the person with the most votes
// to be a senator and select a speaker in chronological order
//  'username' to transaction data
// transaction type 01 is registerSenator
router.post('/registerSenator', (req, res) => {
  // data: username-xxxx
  const schema = {
    priviteKey: joi
      .string()
      .min(64)
      .max(64)
      .required(),
    data: joi.string().required(),
    timestamp: joi
      .number()
      .integer()
      .required()
  }
  const result = joi.validate(req.body, schema)
  console.log(result.error)
  if (result.error !== null) {
    return res.json({
      msg: 'something write wrong'
    })
  }

  let fee = new Tx({
    type: 1,
    timestamp: req.body.timestamp,
    data: req.body.data
  })
    .getDataFee()
    .toNumber()
  let tx = new Tx({
    type: 1,
    value: fee,
    timestamp: req.body.timestamp,
    data: req.body.data
  })

  tx.sign(Buffer.from(req.body.priviteKey, 'hex'))
  console.log(tx.toJSON())
  return res.json(tx.data.toString())
})

router.post('/addVote', (req, res) => {
  const schema = {
    priviteKey: joi
      .string()
      .min(64)
      .max(64)
      .required(),
    data: joi.string().required(),
    timestamp: joi
      .number()
      .integer()
      .required()
  }
  const result = joi.validate(req.body, schema)

  if (result.error !== null) {
    return res.json({
      msg: 'something write wrong'
    })
  }
  let fee = new Tx({
    type: 2,
    timestamp: req.body.timestamp,
    data: req.body.data
  })
    .getDataFee()
    .toNumber()
  // 02 is add vote
  console.log(fee)
  let tx = new Tx({
    type: 2,
    value: fee,
    timestamp: req.body.timestamp,
    data: req.body.data
  })

  tx.sign(Buffer.from(req.body.priviteKey, 'hex'))
  console.log(tx.toJSON())
  return res.json(tx.data.toString())
})

module.exports = router
