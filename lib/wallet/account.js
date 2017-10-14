const router = require('koa-router')()

const Utils = require('../utils')
const utils = new Utils()

router.prefix('/api/wallet/account')

router.get('/createAccount', async (ctx) =>{
    const privateKey = utils.generatorPrivateKey()
    const publicKey = utils.generatorPublicKey(privateKey)
    ctx.body = {privateKey, publicKey}
})

module.exports = router
 