// const request = require('supertest')
// const expect = require('chai').expect

// const app = require('../index');


// describe('GET /api/peer/ping', function() {
//   it('respond with json', function(done) {
//        request(app.listen()) 
//       .get('/api/peer/ping')
//       .set('Accept', 'application/json')
//       .expect('Content-Type', /json/)
//       .expect(200)
//       .end(function(err, res) {
//         if (err) return done(err)
//         done()
//       })
//   })

//   it('version should be v1.0', function(done) {
//     request(app)
//       .get('/api/peer/ping')
//       .set('Accept', 'application/json')
//       .expect('Content-Type', /json/)
//       .expect(200)
//       .end(function(err, res) {
//         if (err) return done(err)
//         expect('v1.0').to.equal(res.body.version)
//         done()
//       })
//   })
// })

// describe('POST /api/peer/connect', () => {
//   it('content should not wrong', done => {
//     request(app)
//       .post('/api/peer/content')
//       .send({ host: '127.0.0.1', port: 3000 })
//       .end(function(err, res) {
//         if (err) return done(err)
//         expect(err).to.be.null
//         done(app.close())
//       })
//   })
// })
