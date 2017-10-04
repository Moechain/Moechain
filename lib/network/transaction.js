var express = require('express')
var router = express.Router()
const Utils = require('../utils')
const utils = new Utils()
const cache = require('./peerCache').cache

router.post('/sendTransaction', (req, res) => {
    const body = req.body
    const schema = {
        to: joi.string().required(),
        priviteKey: joi.string(),
        value: joi.string().integer().required(),
        data: joi.string(),
    }
    const result = joi.validate(body, schema)
    console.log(result)
    if (result.error !== null) {
        res.json = ({ msg: 'ip or other request is wrong:(' })
        return
    }
    return 'emmmm'
})


module.exports = router
