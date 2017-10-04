var expect = require('chai').expect;
describe('Array', function () {
    describe('#indexOf()', function () {
        it('should return -1 when the value is not present', function () {
            expect(-1).to.equal([1, 2, 3].indexOf(4));
        });
    });
    describe('test', function () {
        it('should return 1', function () {
            expect('mocha tastes good, chai tastes good too.').to.equal('mocha tastes good, chai tastes good too.');
        })
    })
});