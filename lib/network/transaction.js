var express = require('express')
var router = express.Router()
const joi = require('joi')

const Utils = require('../utils')
const utils = new Utils()
const cache = require('./peerCache').cache
const Tx = require('../modules/moechain-tx')

const txCache = require('./transactionCache').cache

router.post('/sendTransaction', (req, res) => {
    const body = req.body
    const schema = {
        to: joi.string().required().min(40).max(40),
        priviteKey: joi.string().min(64).max(64).required(),
        value: joi.number().integer().required(),
        data: joi.string(),
    }

    const result = joi.validate(body, schema)

    if (result.error !== null) {
        return res.json({ msg: 'something wrong, there may have a wrong value' })
    }
    let validatePrivateKey = utils.validatePrivateKey(Buffer.from(body.priviteKey, 'hex'))

    if (!validatePrivateKey) {
        return res.json({ msg: 'wrong PrivateKey' })
    }
    let tx = new Tx({
        to: Buffer.from(body.to, 'hex'),
        value: body.value,
        data: body.data
    })
    tx.sign(Buffer.from(body.priviteKey, 'hex'))
    // console.log(tx.from.toString('hex'))
    txCache.set(tx.hash().toString('hex'), tx.serialize().toString('hex'))
    txCache.forEach(function (value, key, cache) {
        console.log(key)
        console.log(value)
    })
    console.log(tx.verifySignature())
    console.log(tx.verifySignature())
    return res.json(body)

})
router.post('/reciveTransaction', (req, res) => {
    const body = req.body
    let tx = new Tx(Buffer.from(body.serializeTx, 'hex'))
    
    let validateTransaction = tx.verifySignature()

    console.log(tx)
    return res.json(body)

})

module.exports = router
