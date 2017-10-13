const supertest = require('supertest')
const chai = require('chai')
const app = require('../index')

const expect = chai.expect
const request = supertest(app.listen())

describe('GET /api/peer/ping', () => {
  it('respond with json', done => {
    request
      .get('/api/peer/ping')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })

  it('version should be v1.0', done => {
    request
      .get('/api/peer/ping')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err)
        expect('v1.0').to.equal(res.body.version)
        done()
      })
  })
})

describe('POST /api/peer/connect', () => {
  it('content should not wrong', done => {
    request
      .post('/api/peer/content')
      .send({ host: '127.0.0.1', port: 3000 })
      .end(function(err, res) {
        if (err) return done(err)
        expect(err).to.be.null
        done()
      })
  })
})
