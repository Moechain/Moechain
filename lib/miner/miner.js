var bigInt = require('big-integer')
// var diff = 21222222
let Ethash = require('ethashjs')
const ethashashUtil = require('ethashjs/util.js')
const levelup = require('levelup')
const memdown = require('memdown')

// const DATASET_BYTES_INIT = bigInt(2).pow(30)
// const DATASET_BYTES_GROWTH = bigInt(2).pow(23)
// const CACHE_BYTES_INIT = bigInt(2).pow(24)
// const CACHE_BYTES_GROWTH = bigInt(2).pow(17)
// const EPOCH_LENGTH = 30000
// const MIX_BYTES = 128
// const HASH_BYTES = 64

/**
 * like sting multipy in python
 */
String.prototype.times = function (n) {
  if (n === 1) {
    return this
  }
  var s = this.times(Math.floor(n / 2))
  s += s
  if (n % 2) {
    s += this
  }
  return s
}

class Miner {
  // encodeInt (s) {
  //   let a = bigInt(s).toString(16)
  //   if (s === 0) {
  //     return ''
  //   } else {
  //     return Buffer.from(a, 'hex').toString('utf8').split('').reverse().join('')
  //   }
  // }

  // zpad (s, length) {
  //   return s + '\x00'.times(bigInt.max(0, length - s.length))
  // }
  // targrt (difficulty) {
  //   return this.zpad(this.encodeInt(bigInt(2).pow(256).divide(difficulty).toString()), 64).split('').reverse().join('')
  // }

  // getCacheSize (blockNumber) {
  //   let sz = CACHE_BYTES_INIT.add(CACHE_BYTES_GROWTH.multiply(bigInt(blockNumber).divide(EPOCH_LENGTH)))
  //   sz = bigInt(sz).subtract(HASH_BYTES)
  //   while (!bigInt(sz / HASH_BYTES).isPrime()) {
  //     sz = bigInt(sz).subtract(bigInt(2).multiply(HASH_BYTES))
  //   }
  //   return sz.toString()
  // }

  // getFullSize (blockNumber) {
  //   let sz = DATASET_BYTES_INIT.add(DATASET_BYTES_GROWTH.multiply(bigInt(blockNumber).divide(EPOCH_LENGTH)))
  //   sz = bigInt(sz).subtract(MIX_BYTES)
  //   while (!bigInt(sz / MIX_BYTES).isPrime()) {
  //     sz = bigInt(sz).subtract(bigInt(2).multiply(MIX_BYTES))
  //   }
  //   return sz.toString()
  // }

  getDifficulty (parentDifficulty, parentTimestamp, blockTimestamp, blockNumber) {
    let boom = bigInt(2).pow(bigInt(blockNumber).divide(100000).subtract(2))
    let adjust = bigInt(parentDifficulty).divide(2048).multiply(bigInt.max(bigInt(1 - (blockTimestamp - parentTimestamp)).divide(10), -99))
    return bigInt(parentDifficulty).add(adjust).add(boom).toString()
  }

// console.log(getDifficulty(2117963098883076, 1503890663,1503890743, 4212372))

  random (n, m) {
    let c = m - n + 1
    return Math.floor(Math.random() * c + n)
  }

  // getSeedHash (blockNumber) {
  //   let s = '\x00'.times(32)
  //   for (let i = 0; i <= bigInt(blockNumber).divide(EPOCH_LENGTH); i++) {
  //     s = s.split('')
  //     let r = this.random(1, s.length)
  //     s[r] = '\x00'
  //     s.join('')
  //     s = new blake(32).update(new Uint8Array(s)).hexDigest()
  //     console.log(s)
  //   }
  //   return s
  // }
  mine (blockNumber, diff) {
    let target = bigInt(2).pow(256).divide(diff).toString('16')

    target = '0'.times(64 - target.length) + target
    var cacheDB = levelup('', {
      db: memdown
    })
    var ethash = new Ethash(cacheDB)

    var header = Buffer.from('0e2887aa1a0668bf8254d1a6ae518927de99e3e5d7f30fd1f16096e2608fe05e', 'hex')
    var epoc = ethashashUtil.getEpoc(blockNumber)
    ethash.mkcache(ethashashUtil.getCacheSize(epoc), Buffer.from('0000000000000000000000000000000000000000000000000000000000000000', 'hex'))
    let i = 0
    let nonce = bigInt(this.random(0, bigInt(2).pow(256))).toString()
    let hash = ethash.run(header, Buffer.from(nonce), ethashashUtil.getFullSize(epoc))
    console.log(bigInt(2).pow(256).divide(diff).toString('16').length)
    while (1) {
      if (hash.hash.toString('hex') < target) {
        console.log('mix:', hash.mix.toString('hex'))
        console.log('hash:', hash.hash.toString('hex'))
        break
      }
      nonce = bigInt(bigInt(nonce).add(1)).mod(bigInt(2).pow(256)).toString()
      hash = ethash.run(header, Buffer.from(nonce), ethashashUtil.getFullSize(epoc))
      console.log('第' + i + '次：' + hash.hash.toString('hex'))
      console.log('-----------------------=========================')
      i = i + 1
    }
    console.log(bigInt(2).pow(256).divide(diff).toString('16').length)
  }
}
module.exports = Miner
