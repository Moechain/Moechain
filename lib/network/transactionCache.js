const LRU = require("lru-cache")

exports.cache = LRU({
    max: 500,
    maxAge: 1000 * 60 * 60
})

let doSomething = {
    set: (array, prop, value) => {
        array.push(value)
        if(array.length === 15) {
            console.log(15)
            console.log(array)
        }
    }
};

let model = new Proxy([], doSomething);

exports.model = model