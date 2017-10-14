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

const loop = async cb => {
  const currentSlot = slotTool.getSlotNumber()
  const lastBlock = await blockchain.getHead()
  const lastSlot = slotTool.getSlotNumber(
    slotTool.getTime(new ethUtil.BN(lastBlock.header.timestamp).toNumber() * 1000)
  )
  if (currentSlot === lastSlot || Date.now() % 10000 > 5000) {
    return cb()
  }
  console.log('emm',Date.now() % 10000)
  const senatorId = slotTool.getSenatorId()
  console.log(senatorId)
  if ('nodeId' === senatorId) {}
  return cb()
}

const round = () => {
  setImmediate(function nextLoop() {
    loop(() => {
      setTimeout(nextLoop, 1000)
    })
  })

}
round()
// BlockChain.prototype.start = function() {
//   var self = this
//   console.log(clc.blue('开始blockchain'))
//   setImmediate(function nextLoop() {
//     self.loop_(function() {
//       setTimeout(nextLoop, 1000)
//     })
//   })
// }

// console.log()
