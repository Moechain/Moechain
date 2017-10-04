const expect = require('chai').expect;
const Utils = require('../lib/utils')
let utils = new Utils()

describe('Utils', () => {
    describe('#generator a privateKey', () => {
        it('should return a 32 bit buffer', () => {
            expect(32).to.equal(utils.generatorPrivateKey().length);
        });
    });
    describe('generator a publicKey', () => {
        it('should return a 64 bit buffer', () => {
            expect(64).to.equal(utils.generatorPublicKey(utils.generatorPrivateKey()).length);
        })
    })
});