/* const levelup = require('levelup')
const promisify = require('q-level')
const appRoot = require('app-root-path')
const db = levelup(appRoot + '/data/senatorsDb', { valueEncoding: 'json' }) */
// const db = promisify(
//   levelup(appRoot + '/data/senatorsDb', { valueEncoding: 'json' })
// )

/* class DB {
  put (key, value) {
    return new Promise((resolve, reject) => {
      db.put(key, value, {valueEncoding: 'binary'}, err => err ? reject(err) : resolve())
    })
  }
  // 来自一介布衣的前置查询方法， 不能用promise
  find (find, callback) {
    var option = {keys: true, values: true, revers: false, limit: 20, fillCache: true}
    if (!find) { return callback('nothing', null) } else {
      if (find.prefix) {
        option.start = find.prefix
        option.end = find.prefix.substring(0, find.prefix.length - 1) +
                String.fromCharCode(find.prefix[find.prefix.length - 1].charCodeAt() + 1)
      }

      if (find.limit) { option.limit = find.limit }
      return db.createReadStream(option)
    }
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
} */
// function findOption(prefix, limit) {
//   var option = { keys: true, values: true, revers: false, fillCache: true }
//   if (limit) option.limit = limit
//   option.start = prefix
//   option.end =
//     prefix.substring(0, prefix.length - 1) +
//     String.fromCharCode(prefix[prefix.length - 1].charCodeAt() + 1)
//   return option
// }
/*
exports.registerSenator = username => {
  return new Promise((resolve, reject) => {
    db.put(username, 'v', err => {
      if (err) reject(err)
      resolve(null)
    })
  })
}

exports.getSenators = () => {
  var contents = []
  return new Promise((resolve, reject) => {
    db
      .createReadStream()
      .on('data', function (data) {
        console.log(data.key, '=', data.value)
        contents.push(data.key)
      })
      .on('error', function (err) {
        console.log('Oh my!', err)
      })
      .on('close', function () {
        console.log('Stream closed')
      })
      .on('end', function () {
        console.log('Stream ended')
        resolve(contents)
      })
  })
}
*/
// module.exports = [db, findOption]
