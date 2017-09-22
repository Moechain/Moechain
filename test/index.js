const Utils = require('../lib/utils')

// const rlp = require('rlp')

const utils = new Utils()
const key = utils.generatorKeyPair('this is secret!')
// const Account = require('../lib/account/account')
const c = utils.generatorSignature('Moechain is comming', key.secretKey)
console.log('s k :',key.secretKey)
console.log('p k :',key.publicKey)
console.log('p l :', key.publicKey.length)
console.log('p k :',utils.secretKeyToPubliclKey(key.secretKey))


// console.log('s k length:',key.secretKey.length)

console.log('signature:' + c)
// console.log(utils.verifySignature('moechsiniscomming', c, key.publicKey))
// console.log(utils.verifySignature('Moechain is comming', c, key.publicKey))
// console.log(utils.generatorAddress(key.publicKey))

// let a = utils.generatorBlockHash({a: 233333, b: 33333332})
// console.log(a)
// console.log('blake:',utils.blake('23333'))
// let account = new Account(['23','384'])
// console.log(rlp.decode(account.serialize()).toString())
const Tx = require('../lib/tx/tx')
let txp =  {
    value:1000,
    to:'00000000000000000000',
    data: '7f7465737432000000000000000000000000000000000000000000000000000000600057'
}
let tx = new Tx(txp)
// console.log(tx.serialize())

var async = require('async');  
var results = [ ];
results.push( {id:1,data:'a'} );
results.push( {id:2,data:'b'} );
results.push( {id:3,data:'c'} );
results.push( {id:4,data:'d'} );

function doFind( obj, callback ) {
  setTimeout( function() {
    console.log( "finding id=" + obj.data.id );
    obj.data.length = obj.data.id % 2;
    callback( null, obj.data );
  }, 500 );
}

function light( obj ) {
  this.id = obj.id;
  this.data = obj.data;
  this.save = function( callback ) {
    setTimeout( function() {
      console.log( "saving id=" + obj.id );
      callback( null, this );
    }, 500 );
  };
}

var iteration = function(row,callbackDone) {
  doFind({data: row}, function (err,entry) {
    if(entry.length) {
      callbackDone(); 
      return console.log( 'id=' + entry.id + ' already exists');
    }
    var newEntry = new light(row);
    newEntry.save(function (err,doc) {
      console.log( 'id=' + entry.id + ' saved');
      callbackDone();
    });
  });
};

async.eachSeries(results, iteration, function (err) {
  console.log('All done');
});