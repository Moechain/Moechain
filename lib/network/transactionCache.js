const LRU = require("lru-cache")

const chain = require('../block/blockchain')

exports.cache = LRU({
    max: 500,
    maxAge: 1000 * 60 * 60
})

let doSomething = {
    set: (txs, prop, value) => {
        // array.push(value)
        // if(array.length === 15) {
        // console.log(15)
        // console.log(array)
        // }
        txs[prop] = value
        chain.putBlock()
        chain.getHead()
            .then((n) => {
                console.log(n)
            })
        // console.log(txs)
    }
};

let model = new Proxy({}, doSomething);

exports.model = model