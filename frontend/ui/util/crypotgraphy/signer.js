import shajs from 'sha.js'
import nacl from 'tweetnacl'
import appSettings from '../../app-settings'

const signer = {
    /**
     * Derive a keypair suitable for signing from the plain password.
     * @param {String} password - A password provided by user.
     * @return {nacl.SignKeyPair}
     */
    deriveKeyPairFromPassword(password) {
        if (!password || typeof password !== 'string') throw new TypeError('Invalid password format')
        const seed = shajs('sha256').update(appSettings.salt + password).digest()
        return nacl.sign.keyPair.fromSeed(seed)
    },
    /**
     * Derive a public key from the plain password.
     * @param {String} password - A password provided by user.
     * @return {String}
     */
    derivePublicKeyFromPassword(password) {
        return Buffer.from(signer.deriveKeyPairFromPassword(password).publicKey).toString('hex')
    },
    /**
     * Sign the data with a secret key derived from given password.
     * @param {String} data - Message data to sign.
     * @param {String} password - A password provided by user.
     * @returns {String}
     */
    sign(data, password) {
        if (!data || typeof data !== 'string') throw new TypeError('Invalid data')
        const auth = signer.deriveKeyPairFromPassword(password),
            rawData = new Uint8Array(new Buffer(data).toJSON().data),
            signature = nacl.sign.detached(rawData, auth.secretKey)

        return new Buffer(signature).toString('base64')
    },
    /**
     * Verify the signature.
     * @param {String} data - Message data,
     * @param {String} signature - Message signature in HEX format.
     * @param {String} publicKey - Public key derived from given password.
     * @returns {boolean}
     */
    verify(data, signature, publicKey) {
        if (!data || typeof data !== 'string') throw new TypeError('Invalid data')

        const rawData = new Uint8Array(new Buffer(data).toJSON().data),
            rawSignature = new Uint8Array(Buffer.from(signature, 'base64')),
            rawPublicKey = new Uint8Array(Buffer.from(publicKey, 'hex'))

        return nacl.sign.detached.verify(rawData, rawSignature, rawPublicKey)
    }
}

export default signer