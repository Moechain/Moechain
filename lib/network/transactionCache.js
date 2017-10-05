const LRU = require("lru-cache")

exports.cache = LRU({
    max: 500,
    maxAge: 1000 * 60 * 60
})