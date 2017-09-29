const utils = require('ethereumjs-util')
// const params = require('ethereum-common/params.json')
const BN = utils.BN
  /**
   * An object that repersents the block header
   * @constructor
   * @param {Array} data raw data, deserialized
   * @prop {Buffer} parentHash the blocks' parent's hash
   * @prop {Buffer} uncleHash sha3(rlp_encode(uncle_list))
   * @prop {Buffer} coinbase the miner address
   * @prop {Buffer} stateRoot The root of a Merkle Patricia tree
   * @prop {Buffer} transactionTrie the root of a Trie containing the transactions
   * @prop {Buffer} receiptTrie the root of a Trie containing the transaction Reciept
   * @prop {Buffer} bloom
   * @prop {Buffer} difficulty
   * @prop {Buffer} number the block's height
   * @prop {Buffer} gasLimit
   * @prop {Buffer} gasUsed
   * @prop {Buffer} timestamp
   * @prop {Buffer} extraData
   * @prop {Array.<Buffer>} raw an array of buffers containing the raw blocks.
   */
var BlockHeader = module.exports = function (data) {
  var fields = [{
    name: 'parentHash',
    length: 32,
    default: utils.zeros(32)
  },{
    name: 'stateRoot',
    length: 32,
    default: utils.zeros(32)
  }, {
    name: 'transactionsTrie',
    length: 32,
    default: utils.SHA3_RLP
  }, {
    name: 'receiptTrie',
    length: 32,
    default: utils.SHA3_RLP
  }, {
    name: 'bloom',
    default: utils.zeros(256)
  }, {
    name: 'number',
    default: utils.intToBuffer(233)
  },  {
    name: 'timestamp',
    default: new Buffer([])
  }, {
    name: 'extraData',
    allowZero: true,
    empty: true,
    default: new Buffer([])
  }]
  utils.defineProperties(this, fields, data)
}



/**
 * Validates the entire block header
 * @method validate
 * @param {Blockchain} blockChain the blockchain that this block is validating against
 * @param {Bignum} [height] if this is an uncle header, this is the height of the block that is including it
 * @param {Function} cb the callback function. The callback is given an `error` if the block is invalid
 */
BlockHeader.prototype.validate = function (blockchain, height, cb) {
  var self = this
  if (arguments.length === 2) {
    cb = height
    height = false
  }

  if (this.isGenesis()) {
    return cb()
  }

  // find the blocks parent
  blockchain.getBlock(self.parentHash, function (err, parentBlock) {
    if (err) {
      return cb('could not find parent block')
    }

    self.parentBlock = parentBlock

    var number = new BN(self.number)
    if (number.cmp(new BN(parentBlock.header.number).iaddn(1)) !== 0) {
      return cb('invalid number')
    }

    if (height) {
      var dif = height.sub(new BN(parentBlock.header.number))
      if (!(dif.cmpn(8) === -1 && dif.cmpn(1) === 1)) {
        return cb('uncle block has a parent that is too old or to young')
      }
    }


    if (utils.bufferToInt(parentBlock.header.number) + 1 !== utils.bufferToInt(self.number)) {
      return cb('invalid heigth')
    }

    if (utils.bufferToInt(self.timestamp) <= utils.bufferToInt(parentBlock.header.timestamp)) {
      return cb('invalid timestamp')
    }

    if (self.extraData.length > 32) {
      return cb('invalid amount of extra data')
    }

    cb()
  })
}

/**
 * Returns the sha3 hash of the blockheader
 * @method hash
 * @return {Buffer}
 */
BlockHeader.prototype.hash = function () {
  return utils.rlphash(this.raw)
}

/**
 * checks if the blockheader is a genesis header
 * @method isGenesis
 * @return {Boolean}
 */
BlockHeader.prototype.isGenesis = function () {
  return this.number.toString('hex') === ''
}
