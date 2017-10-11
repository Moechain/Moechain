const mongoose = require('mongoose')
const Schema = mongoose.Schema
exports.Transactions = new Schema({
  block: Number,
  type: Number,
  to: String,
  value: Number,
  timestamp: String,
  data: String,
  v: String,
  r: String,
  s: String
})
