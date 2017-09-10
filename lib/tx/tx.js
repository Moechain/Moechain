const rlp = require('rlp')

class Tx {
    /**
     * Tx should have : from, to, amount, timestamp, signature and blockid
     */
    constructor(data) {
        this.from = data[0],
        this.to = data[1],
        this.amount = data[2],
        this.fee = data[3]
        this.timestamp = data[4],
        this.signature = data[5],
        this.blockId = data[6]
    }
    encode() {
        return rlp.encode([this.from, this.to, this.amount, this.fee ,this.timestamp, this.signature, this.blockId])
    }
    toHash() {
        return utils.blake(this.encode.toString('hex'))
    }
    signature() {
        return utils.generatorSignature(toHash, secretKey)
    }
}