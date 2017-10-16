// 1.判断是第几轮共识
// 2.判断上一次是第几次共识
// 3.推断本轮共识的序号
// 4.如果在议员列表中，序号和本次共识序号相同则成为议长生成区块
// 判断上一个生成区块的议长是否按照次序，如不，则将缺失的交易打包
// 若本次顺序与参议员顺序相等，则打包区块
const blockchain = require('../block/blockchain')
const ethUtil = require('ethereumjs-util')
const Slot = require('./slots')
const slotTool = new Slot()
const _ = require('lodash')
const transactionCatch = require('../network/transactionCache').model
const broadcast = require('../network/broadcast')
const cache = require('../wallet/cache').cache
const senatorList = require('./senatorList').senatorList
const Utils = require('../utils')
const broadcast = require('../network/broadcast')
const utils = new Utils()
const waitting = require('./waiting')
function Runner() {
  this.lastSlot = 0
}

Runner.prototype.addBlock = async function() {
  const transactions = _.values(transactionCatch)
  let block = await this.createBlock(transactions)
  this.lastSlot = currentSlot
  const publicKey = cache.publicKey
  const privateKey = cache.privateKey
  // block.stateRoot is nil ?
  if (_.isNil(block.stateRoot)) {
    let data = {
      h: block.hash().toString('hex'),
      s: utils.sign(block.hash(), privateKey),
      b: block.serialize().toString('hex')
    }
    broadcast.broadcast('block', data)
    waitting.block = block
    // broadcast(block)
  } else {
    let data = {
      h: block.block.hash().toString('hex'),
      s: utils.sign(block.block.hash(), privateKey),
      b: block.block.serialize().toString('hex')
    }
    broadcast.broadcast('block', data)
    waitting.block = block.block
    waitting.stateRoot = block.stateRoot
  }
}

Runner.prototype.createBlock = async function(transactions) {
  try {
    let block
    if (_.isEmpty(transactions)) {
      block = await blockchain.generateBlock()
      return block
    } else {
      block = await blockchain.generateBlock(transactions)
      return block
    }
  } catch (error) {
    console.log(error)
  }
}

Runner.prototype.loop = async function() {
  const currentSlot = slotTool.getSlotNumber()
  const lastBlock = await blockchain.getHead()
  const lastSlot = slotTool.getSlotNumber(
    slotTool.getTime(
      new ethUtil.BN(lastBlock.header.timestamp).toNumber() * 1000
    )
  )
  console.log(broadcast.peers())
  if (
    currentSlot === lastSlot ||
    Date.now() % 10000 > 5000 ||
    this.lastSlot === currentSlot
  ) {
    console.log(currentSlot)
    await this.getSenatorList(currentSlot)
    return Promise.resolve()
  }
  // 0 is 101
  let senatorId = slotTool.getSenatorId()
  senatorId = 0 ? 101 : senatorId
  console.log('senatorId=======================', senatorId)
  // 获取议员列表，查找有无本节点，若有则获取id
  const myId = this.getMySenatorId()

  if (myId !== 'tan90') {
    if (myId === senatorId) {
      console.log('put block now =======')
      console.log('put block now =================================')
    }
  }
  return Promise.resolve()
}

Runner.prototype.getSenatorList = async function(SlotNumber) {
  console.log('slotNumber:', SlotNumber)
  console.log('roundTime:', slotTool.roundTime(SlotNumber))
  console.log('nextRoundTime:', slotTool.roundTime(SlotNumber + 1))
  if (slotTool.roundTime(SlotNumber) < slotTool.roundTime(SlotNumber + 1)) {
    let list = await blockchain.querySenatorsAndVotes()
    list = _.orderBy(list, ['votes'], ['desc']).slice(0, 100)
    senatorList.senatorList = list
    console.log(senatorList)
  }
  return Promise.resolve()
}

Runner.prototype.getMySenatorId = async function() {
  if (_.isNil(senatorList.senatorList)) {
    await this.getSenatorList()
  }
  const publicKey = cache.publicKey
  let id = _.findIndex(senatorList.senatorList, o => {
    return (o.publicKey = publicKey)
  })
  id = id === -1 ? 'tan90' : id + 1
  return id
}
Runner.prototype.start = function() {
  const nextLoop = async () => {
    await this.loop()
    setTimeout(nextLoop, 1000)
  }
  // const round = async () => {
  //   await getSenatorList()
  //   setTimeout(round, 1000)
  // }
  setImmediate(nextLoop)
  // setImmediate(round)
}
let runner = new Runner()

exports.runner = runner.start()
