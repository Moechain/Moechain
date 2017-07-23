class Block {
  constructor (block) {
    this.version = block.version || '1.0'
    this.previousHash = block.previousHash || ''
    this.hash = block.hash || ''
    this.height = block.height || ''
    this.timestamp = block.timestamp || ''
    this.creator = block.creator || ''
    this.blockSignature = block.blockSignature || ''
    this.transactions = block.transactions || {}
  }
}

module.exports = Block
