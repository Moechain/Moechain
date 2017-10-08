const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')

const config = require('../../config.json').db
const basename = path.basename(module.filename)
const db = {}
const url =
  'postgres://' +
  config.username +
  ':' +
  config.password +
  '@' +
  config.host +
  ':' +
  config.port +
  '/' +
  config.database
let sequelize = new Sequelize(url, { pool: config.pool })

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (
      file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js'
    )
  })
  .forEach(function(file) {
    var model = sequelize.import(path.join(__dirname, file))
    db[model.name] = model
  })

Object.keys(db).forEach(function(modelName) {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db)
  }
})

sequelize.sync()
db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db
