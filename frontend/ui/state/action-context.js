import {observable, action, transaction, autorun} from 'mobx'
import {StrKey} from 'stellar-base'
import queryParser from 'query-string'
import accountManager from './account-manager'
import responder from '../actions/responder'
import {dispatchIntentResponse, handleIntentResponseError} from '../actions/callback-dispatcher'
import errors from '../util/errors'
import {intentInterface} from 'intent-id-stellar-expert'

/**
 * Provides context for initiated action.
 */
class ActionContext {
    constructor() {
        autorun(() => {
            if (this.confirmed && this.selectedKeypair) {
                responder.confirm(this)
                    .then(res => dispatchIntentResponse(res, this))
                    .catch(err => handleIntentResponseError(err, this))
                    .then(() => __history.push('/'))
            }
        }, {delay: 100})
    }

    /**
     * Requested intent.
     * @type {String}
     */
    @observable
    intent = undefined

    /**
     * Requested Stellar account address.
     * @type {String}
     */
    @observable
    requestedPublicKey = undefined

    /**
     * Request params.
     * @type {Object}
     */
    @observable
    data = undefined

    /**
     * An account selected by the user.
     * @type {Account}
     */
    @observable
    selectedAccount = undefined

    /**
     * An account keypair selected by the user.
     * @type {AccountKeypair}
     */
    @observable
    selectedKeypair = undefined

    /**
     * Intent confirmation status.
     * @type {boolean}
     */
    @observable
    confirmed = false

    /**
     * Errors found during intent validation or
     * @type {String}
     */
    @observable
    intentErrors = null

    /**
     * Relative request path obtained from the intent.
     * @type {String}
     */
    confirmIntentPath = null

    /**
     * Set current context based on the
     * @param {string} query - Intent request parameters.
     * @return {ActionContext}
     */
    @action
    setContext(query) {
        let params = queryParser.parse(query)
        //save original request params
        this.confirmIntentPath = location.href.replace(location.origin, '')

        if (params.encoded) { //treat as SEP-0007 encoded data
            params = queryParser.parse(params.encoded)
        }

        if (params.demo_mode) {
            accountManager.createDemoAccount()
                .catch(err => console.error(err))
        }
        const {intent, account, ...data} = params
        transaction(() => {
            Object.assign(this, {
                intentErrors: null,
                confirmed: false,
                selectedAccount: null,
                selectedKeypair: null,
                requestedPublicKey: null
            })

            data.app_origin = document.referrer ? new URL(document.referrer).origin : 'origin unknown'
            data.app_name = data.app_name || 'unknown'
            Object.assign(this, {
                intent,
                data,
                requestedPublicKey: account || null
            })
            //intent should be present
            if (!intent) {
                this.intentErrors = 'Parameter "intent" is required.'
                return
            }
            if (account && !StrKey.isValidEd25519PublicKey(account)) {
                this.intentErrors = 'Invalid "account" parameter. Stellar account public key expected.'
                return
            }

            this.intentProps = intentInterface[intent]
            if (!this.intentProps) {
                this.intentErrors = `Unknown intent "${intent}".`
                return
            }
            for (let requiredParam of this.intentProps.params.required) {
                if (!data[requiredParam]) {
                    this.intentErrors = `Parameter "${requiredParam}" is required.`
                    return
                }
            }
        })
        return this
    }

    @action
    reset() {
        transaction(() => {
            Object.assign(this, {
                intentErrors: null,
                confirmed: false,
                selectedAccount: null,
                selectedKeypair: null,
                requestedPublicKey: null
            })
        })
    }

    /**
     * Confirm the intent request.
     */
    confirmRequest() {
        this.confirmed = true
    }

    /**
     * Reject the request.
     * @param {Error|String} [error] - Rejection reason or validation error.
     */
    rejectRequest(error) {
        handleIntentResponseError(error, this)
        this.reset()
    }
}

export default new ActionContext()