var express = require('express')
var router = express.Router()
const os = require('os')
const joi = require('joi')
const level = require('level')
const LRU = require("lru-cache")
const appRoot = require('app-root-path')

const Blockchain = require('../modules/moechain-chain')
// const Peer = require('../models/index').Peer
const [db, findOption] = require('../db')
const blockDb = level(appRoot + '/data/blockDb')
const detailsDb = level(appRoot + '/data/detailsDb')

let blockchain = new Blockchain({ blockDb: blockDb, detailsDb: detailsDb })

cache = LRU(233)
// cache.set("key1", "value1")
// cache.set("key2", "value2")
// cache.forEach(function(value,key,cache){
//     console.log(key,'=',value)
// })

router.get('/ping', (req, res) => {
  blockchain.getHead((err, parentBlock) => {
    return res.status(200).json({
      version: 'v1.0',
      os: os.type(),
      blockHeight: parentBlock.header.number.toString('hex')
    })
  })
})

router.post('/connect', (req, res) => {
  const body = req.body
  console.log(body)
  // return res.send(body)
  const schema = {
    id: joi.string(),
    ip: joi.string().ip({
      version: [
        'ipv4',
        'ipv6'
      ],
      cidr: 'optional'
    }),
    port: joi.number().integer()
  }
  const result = joi.validate(body, schema)
  if (result.error !== null) {
    res.json = ({ msg: 'ip or other request is wrong:(' })
    return
  }
  const key = '.peer.' + body.id
  body.state = 2
  var received = {}
  db.put(key, body).then(() => {
    let option = findOption('.peer')
    return db.createReadStream(option)
    // res.json(body)
  })
    .progress((data) => {
      console.log(typeof data.value)
      received[data.key] = data.value
    })
    .then(() => {
      return res.json(received)
    })

    .catch(() => {
      return res.json({ message: 'meow, a cat can not found  peers O.O ' })
    })

  // Peer.create(body)
  /* Peer.create(body).then(() => {
    return Peer.findAll({
      where: {
        state: 2
      }
    }).then((result) => JSON.stringify(result))
  }).catch(() => {
    return {message: 'meow, a cat can not found  peers O.O '}
  }) */
})

router.get('/getPeers', (req, res) => {
  /*
     where: {
       state: 2
     }
   }).then((result) => {
     return JSON.stringify(result)
   }) */
  let option = findOption('.peer')
  var received = {}
  db.createReadStream(option)
    .progress((data) => {
      received[data.key] = data.value
    })
    .then(() => {
      res.status(200).send(received)
    })
    .done()
})

router.post('/receiveTransaction', async (ctx, next) => {
})

router.post('/getBlocks', async (ctx, next) => {
})

module.exports = router
