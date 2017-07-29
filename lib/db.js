const levelup = require('levelup')
const db = levelup('./data')

class DB {
  put (key, value) {
    return new Promise((resolve, reject) => {
      db.put(key, value, err => err ? reject(err) : resolve())
    })
  }

  get (key) {
    return new Promise((resolve, reject) => {
      db.get(key, (err, value) => {
        if (err) {
          return reject(err)
        }
        resolve(value)
      })
    })
  }

  del (key) {
      return new Promise((resolve, reject) => {
          db.del(key, err => err ? reject(err) : resolve())
      })
  }
}

module.exports = DB
