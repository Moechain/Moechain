const router = require('koa-router')()

const Utils = require('../utils')
const utils = new Utils()

router.prefix('/api/wallet/account')

router.get('/createAccount', async (ctx) =>{
    const privateKey = utils.generatorPrivateKey()
    const publicKey = utils.generatorPublicKey(privateKey).toString('hex')
    privateKey = privateKey.toString('hex')
    ctx.body = {'w':'www'}
})

module.exports = router
 