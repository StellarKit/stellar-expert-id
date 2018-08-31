export default function (responder) {
    responder.registerReaction('authenticate', function (actionContext, keyPair) {
        try {
            const {token} = actionContext.data,
                pubkey = keyPair.publicKey(),
                signature = keyPair.sign(pubkey + token)
            return Promise.resolve({
                pubkey: keyPair.publicKey(),
                token,
                token_signature: signature.toString('hex')
            })
        }
        catch (e) {
            console.error(e)
            return Promise.reject({message: 'Failed to sign an authentication token.'})
        }
    })

    responder.registerReaction('sign_msg', function (actionContext, keyPair) {
        try {
            const {message} = actionContext.data,
                pubkey = keyPair.publicKey(),
                signature = keyPair.sign(pubkey + message)
            return Promise.resolve({
                pubkey,
                message,
                message_signature: signature.toString('hex')
            })
        }
        catch (e) {
            console.error(e)
            return Promise.reject({message: 'Failed to sign a message.'})
        }
    })

    responder.registerReaction('verify_msg', function (actionContext, keyPair) {
        try {
            const {message, message_signature} = actionContext.data,
                pubkey = keyPair.publicKey()
            if (keyPair.verify(pubkey + message, Buffer.from(message_signature, 'hex')))
                return Promise.resolve({
                    pubkey,
                    message,
                    message_signature
                })
            else
                return Promise.reject({message: 'Invalid message signature.'})
        }
        catch (e) {
            console.error(e)
        }
        return Promise.reject({message: 'Failed to verify message signature.'})
    })
}
