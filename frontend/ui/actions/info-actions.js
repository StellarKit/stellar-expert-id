export default function (responder) {
    responder.registerReaction('public_key', (actionContext, keyPair) => Promise.resolve({pubkey: keyPair.publicKey()}))
    responder.registerReaction('basic_info', (actionContext, keyPair) => Promise.resolve({
        info: {
            email: actionContext.selectedAccount.email,
            avatar: actionContext.selectedAccount.avatar || null
        }
    }))
}