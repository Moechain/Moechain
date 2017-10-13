const router = require('koa-router')()

const joi = require('joi')
const Tx = require('../modules/moechain-tx')
const blockchain = require('../block/blockchain')
router.prefix('/api/consensus')

// sign in senator , moechain will select the person with the most votes
// to be a senator and select a speaker in chronological order
//  'username' to transaction data
// transaction type 01 is registerSenator
router.post('/registerSenator', async (ctx, next) => {
  try {
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
    const result = joi.validate(ctx.request.body, schema)
    console.log(result.error)
    if (result.error !== null) {
      ctx.body = {
        msg: 'something write wrong'
      }
    }

    let fee = new Tx({
      type: 1,
      timestamp: ctx.request.body.timestamp,
      data: ctx.request.body.data
    })
      .getDataFee()
      .toNumber()
    let tx = new Tx({
      type: 1,
      value: fee,
      timestamp: ctx.request.body.timestamp,
      data: ctx.request.body.data
    })

    tx.sign(Buffer.from(ctx.request.body.priviteKey, 'hex'))
    console.log(tx.toJSON())
    ctx.body = tx.data.toString()
  } catch (error) {
    console.log(error)
  }
})

// 02 is add vote

router.post('/addVote', async (ctx, next) => {
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
  const result = joi.validate(ctx.request.body, schema)

  if (result.error !== null) {
    ctx.body = {
      msg: 'something write wrong'
    }
  }
  let fee = new Tx({
    type: 2,
    timestamp: ctx.request.body.timestamp,
    data: ctx.request.body.data
  })
    .getDataFee()
    .toNumber()
  // 02 is add vote
  console.log(fee)
  let tx = new Tx({
    type: 2,
    value: fee,
    timestamp: ctx.request.body.timestamp,
    data: ctx.request.body.data
  })

  tx.sign(Buffer.from(ctx.request.body.priviteKey, 'hex'))
  console.log(tx.toJSON())
  ctx.body = tx.data.toString()
})

router.get('/getSenators', async (ctx, next) => {
  try {
    const senators = await blockchain.querySenatorsAndVotes()
    ctx.status = 200
    ctx.body = senators
  } catch (error) {
    // console.log(error)
    ctx.status = 404
    ctx.body = { msg: 'senators not found' }
  }
})
module.exports = router
