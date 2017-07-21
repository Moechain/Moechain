export class Block {
  constructor (block) {
    this.previousHash = block.previousHash
    this.hash = block.hash
    this.timestamp = block.timestamp
    this.merkleRoot = block.merkleRoot
  }
}
