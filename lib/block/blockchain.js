const appRoot = require('app-root-path');
const Blockchain = require('moechain-chain')
const Block = require('./block')
const level = require('level')
var fs= require("fs")
   
if(!fs.existsSync(appRoot+'/data')){
    fs.mkdirSync(appRoot+'/data')
}
const blockDb = level(appRoot + '/data/blockDb')
const detailsDb = level(appRoot + '/data/detailsDb')
let blockchain = new Blockchain({ blockDb: blockDb, detailsDb: detailsDb })

const block = new Block()
console.log(block)
console.log(appRoot)
