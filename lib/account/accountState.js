const rlp = require('rlp')
const Tire = require('merkle-patricia-tree')
const levelup = require('levelup')
const db = levelup('../db')

class accountState {
  constructor (data) {
    this.address = data.address,
    this.tire = new Tire(data.db, data.rootHash)
  }
  getBlance () {
    this.tire.get(Buffer.from(this.address))
  }
}
