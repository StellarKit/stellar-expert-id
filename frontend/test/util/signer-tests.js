import signer from '../../ui/util/crypotgraphy/signer'

describe('signer.getPublicKey', function () {
    it('fails to derive a public key for an empty password', function () {
        expect(() => signer.derivePublicKeyFromPassword('')).to.throw(/Invalid password format/)
    })

    it('derives a public key for a given password', function () {
        let a = signer.derivePublicKeyFromPassword('a1234567890'),
            b = signer.derivePublicKeyFromPassword('a1234567891')
        expect(signer.derivePublicKeyFromPassword('a1234567890')).to.equal(a)
        expect(signer.derivePublicKeyFromPassword('a1234567891')).to.equal(b)
        expect(a).to.not.equal(b)
    })
})

describe('signer.sign', function () {
    it('fails to sign an empty data', function () {
        expect(() => signer.sign('', 'password')).to.throw(/Invalid data/)
    })
    it('fails to sign data without password', function () {
        expect(() => signer.sign('123', '')).to.throw(/Invalid password format/)
    })

    it('signs the data', function () {
        let password = 'password' + Math.random(),
            data = new Date().toJSON(),
            signature = signer.sign(data, password)
        expect(signature.length).to.equal(88)
        expect(signer.verify(data, signature, signer.derivePublicKeyFromPassword(password))).to.be.true
    })
})