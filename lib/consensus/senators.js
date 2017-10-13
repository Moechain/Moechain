const router = require('koa-router')()

const joi = require('joi')
const Tx = require('../modules/moechain-tx')
router.prefix('/api/consensus')

// sign in senator , moechain will select the person with the most votes
// to be a senator and select a speaker in chronological order
//  'username' to transaction data
// transaction type 01 is registerSenator
router.post('/registerSenator', async (ctx, next) => {
  const req = ctx.request
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
    ctx.body = {
      msg: 'something write wrong'
    }
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
  ctx.body = tx.data.toString()
})

// 02 is add vote

router.post('/addVote', async (ctx, next) => {
  const req = ctx.request

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
    ctx.body = {
      msg: 'something write wrong'
    }
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
  ctx.body = tx.data.toString()
})

module.exports = router
