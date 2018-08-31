import {Keypair} from 'stellar-base'
import registerInfoActions from './info-actions'
import registerSigningActions from './signing-actions'
import registerTxActions from './tx-actions'

class Responder {
    constructor() {
        //actions registry
        this.reactions = {}
        //register all supported intent actions
        registerInfoActions(this)
        registerSigningActions(this)
        registerTxActions(this)
    }

    registerReaction(intent, reaction) {
        if (!intent) throw new Error('Invalid intent.')
        if (typeof reaction !== 'function') throw new Error('Invalid intent reaction.')
        if (this.reactions[intent]) throw new Error(`A reaction for intent "${intent}" has been registered already.`)
        this.reactions[intent] = reaction
    }

    confirm(actionContext) {
        const intent = actionContext.intent,
            keyPair = Keypair.fromSecret(actionContext.selectedKeypair.secret),
            action = this.reactions[intent]

        if (!action) return Promise.reject(new Error(`Unknown intent "${intent}".`))
        return action(actionContext, keyPair)
            .then(res => Object.assign(res, {intent: actionContext.intent}))
    }
}

export default new Responder()