const router = require('koa-router')()
const ethUtil = require('ethereumjs-util')

const Utils = require('../utils')
const utils = new Utils()
const Block = require('../modules/moechain-block')
const blockchain = require('../block/blockchain')
const Tx = require('../modules/moechain-tx')
const ethUtils = require('../utils').ethUtils
const waitting = require('../consensus/waiting').observer
const stateRootModel = require('../consensus/waiting').stateRootModel
const account = require('../wallet/cache')
const broadcast = require('../network/broadcast').broadcast
const Runner = require('../consensus/runner')
router.prefix('/api/block')

router.post('/vote', async ctx => {
  const data = ctx.request.body.data
  //check whether peer in senatorslist
  //data.h => block hash, data.k => peer publick key, data.s => hash signature
  if (!utils.verifySignature(data.h, data.k)) {
    ctx.body = { msg: 'wrong signature' }
  }
  let runner = new Runner()

  if (runner.getMySenatorId(data.k) === 'tan90') {
    ctx.body = { msg: 'wrong senator' }
  }

  let votes = waitting.get('votes.' + data.h)
  waitting.set('votes.' + data.h, votes + 1)
  ctx.body = { msg: 'add a vote' }
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
    if (_.isNil(waitting.get('block.' + data.h))) {
      ctx.body = { msg: 'this block already in peer' }
    }
    waitting.set('block.' + data.h, data.b)

    if (!_.isNil(block.transactions)) {
      let b = await blockchain.putBlock(block)
      let stateRoot = b.stateRoot
      stateRootModel[data.h] = stateRoot
    }
    let sig = utils.sign(data.h, account.privateKey)
    let newData = {
      h: data.h,
      s: sig,
      k: account.publicKey
    }
    broadcast(voteBlock, newData)
    ctx.body = { msg: 'block is true', state: 1 }
  }
})
router.get('/block')
router.get('/blocks')

module.exports = router
