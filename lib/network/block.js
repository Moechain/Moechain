const router = require('koa-router')()
const ethUtil = require('ethereumjs-util')

const Utils = require('../utils')
const utils = new Utils()
const Block = require('../modules/moechain-block')
const blockchain = require('../block/blockchain')
const Tx = require('../modules/moechain-tx')
const ethUtils = require('../utils').ethUtils
const waitting = require('../consensus/waiting').observer

router.prefix('/api/block')


router.post('/vote', async ctx => {
  const data = ctx.request.body.data
 let votes = waitting.get('votes.'+data.h)
  waitting.set('votes.'+data.h, votes + 1)
  ctx.body = { 'msg':'add a vote' }
})

router.post('/receiveBlock', async ctx => {
  const data = ctx.request.body.data
  const type = ctx.request.body.type
  if (type === 'toCommitBlock') {
    let v = utils.verifySignature(data.h, data.s, data.k)
    if (!v) {
      ctx.body = { msg: 'wrong signature' }
    }
    let block = new Block(Buffer.from(data.b, 'hex'))
    let preBlock = await blockchain.getHead()
    let preBlockNumber = new ethUtil.BN(preBlock.header.number).toNumber()
    let blockNumber = new ethUtil.BN(block.header.number).toNumber()
    if (blockNumber + 1 !== preBlockNumber) {
      ctx.body = { msg: 'wrong number' }
    }
    let txs = block.transactions
    if (txs !== undefined) {
      var txErrors = block.validateTransactions(true)
      if (txErrors !== '') {
        ctx.body = { msg: 'transaction is wrong' }
      }
    }
    // 1: success
    if (_.isNil(waitting.get('block.'+data.h))) {
    ctx.body = { msg: 'this block already in peer' }
    }
    waitting.set('block.'+data.h, data.b)
    ctx.body = { msg: 'block is true', state: 1 }
  }
})

module.exports = router
