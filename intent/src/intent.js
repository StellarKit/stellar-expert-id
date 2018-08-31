const generateRandomToken = require('./random-token-generator'),
    dispatcher = require('./intent-dispatcher'),
    intentInterface = require('./intent-interface')

const allowedIntentOptions = ['network', 'horizon', 'prepare', 'pubkey', 'demo_mode']

/**
 * Intent invocation options.
 * @typedef {Object} IntentOptions
 * @property {String} [network] - Stellar account network identifier or private network passphrase.
 * @property {String} [horizon] - The url of the Stellar Horizon server.
 * @property {Boolean} [prepare] - If set, the signer will return the signed tx instead of submitting it to the Horizon server.
 * @property {String} [pubkey] - The requested public key of the Stellar account.
 */

/**
 * External SSO/signing calling interface implementation.
 */
class Intent {
    /**
     * Create new instance of Intent class.
     * @param {Object} params - Initialization params.
     * @param {String} params.app_name - Friendly application name (required).
     * @param {String} params.app_description - Short application description (optional).
     * @returns {Intent}
     */
    constructor({app_name, app_description}) {
        if (!app_name) return console.warn('Parameter "app_name" is required.')
        this.app_name = app_name
        this.app_description = app_description
    }

    /**
     * Initiate external intent request.
     * @param {Object} params - Request parameters.
     * @param {String} params.intent - Intent name.
     * @param {IntentOptions} [options] - Request options.
     * @returns {Promise<Object>}
     */
    request(params, options) {
        //validate parameters
        if (typeof params !== 'object') return Promise.reject(new Error('Intent parameters expected.'))
        const {intent, pubkey} = params,
            requestParams = {intent}
        //intent should be present
        if (!intent) return Promise.reject(new Error('Parameter "intent" is required.'))
        //basic account public key validation
        if (pubkey && !/^G[0-9A-Z]{55}$/.test(pubkey)) return Promise.reject(new Error('Invalid "pubkey" parameter. Stellar account public key expected.'))
        //check interface compliance
        const intentDescriptor = intentInterface[intent]
        if (!intentDescriptor) return Promise.reject(new Error(`Unknown intent: "${intent}".`))
        //check required params
        for (let key of intentDescriptor.params.required) {
            const value = params[key]
            if (!value) return Promise.reject(new Error(`Parameter "${key}" is required for intent "${intent}".`))
            requestParams[key] = value
        }
        //copy optional params
        if (intentDescriptor.params.optional) {
            for (let key of intentDescriptor.params.optional) {
                const value = params[key]
                if (value) {
                    requestParams[key] = value
                }
            }
        }
        //process options
        if (options) {
            for (let key of allowedIntentOptions) {
                const value = options[key]
                if (value) {
                    requestParams[key] = value
                }
            }
        }
        //add application info
        Object.assign(requestParams, {
            app_name: this.app_name || 'Unknown Application',
            app_description: this.app_description || 'No description'
        })
        //dispatch intent
        return dispatcher.showIntent(requestParams)
            .then(raw => {
                const res = {}
                for (let key of intentDescriptor.params.return) {
                    res[key] = raw[key]
                }
                return res
            })
    }

    /**
     * Request Stellar account public key (for unverified authentication).
     * @returns {Promise<Object>}
     */
    requestPublicKey() {
        return this.request({intent: 'public_key'})
    }

    /**
     * Request user basic info (email, avatar etc).
     * @returns {Promise<Object>}
     */
    requestBasicInfo() {
        return this.request({intent: 'basic_info'})
    }

    /**
     * Request secure third-party application authentication.
     * @param {String|Number} [nonce] - A unique value provided by the application.
     * @param {IntentOptions} [options] - Intent request options.
     * @returns {Promise<Object>}
     */
    authenticate(nonce, options) {
        return this.request({
            intent: 'authenticate',
            token: nonce + generateRandomToken()
        }, options)
    }

    /**
     * Request transaction signing, returns signed transaction envelope.
     * @param {String} xdr - A Stellar transaction in XDR format encoded in base64.
     * @param {IntentOptions} [options] - Intent request options.
     * @returns {Promise<Object>}
     */
    signTransaction(xdr, options) {
        //TODO: check if txXdr is a Transaction instance and serialize it
        return this.request({
            intent: 'tx',
            xdr
        }, options)
    }

    /**
     * Request arbitrary data signing.
     * @param {String} message - Arbitrary message to sign.
     * @param {IntentOptions} [options] - Intent request options.
     * @returns {Promise<Object>}
     */
    signMessage(message, options) {
        return this.request({
            intent: 'sign_msg',
            message: normalizeMessageToSign(message)
        }, options)
    }

    /**
     * Request arbitrary data signature verification.
     * @param {String} message - Arbitrary message.
     * @param {String} message_signature - Message signature generated by signMessage.
     * @param {IntentOptions} [options] - Intent request options.
     * @returns {Promise<Object>}
     */
    verifyMessage(message, message_signature, options) {
        return this.request({
            intent: 'verify_msg',
            message: normalizeMessageToSign(message),
            message_signature
        }, options)
    }

    /**
     * Request an asset trustline creation.
     * @param {String} destination - Payment destination address.
     * @param {String} amount - Amount to pay.
     * @param {String} [asset_code] - [Optional] Asset code (if not set XLM is implied).
     * @param {String} [asset_issuer] - [Optional] Asset account issuer (if not set XLM is implied).
     * @param {String} [memo] - [Optional] Memo to be included in the payment.
     * @param {('MEMO_TEXT' | 'MEMO_ID' | 'MEMO_HASH' | 'MEMO_RETURN')} [memo_type] - [Optional] Memo type to be included in the payment.
     * @param {IntentOptions} [options] - Intent request options.
     * @returns {Promise<Object>}
     */
    pay(destination, amount, asset_code, asset_issuer, memo, memo_type, options) {
        return this.request({
            intent: 'pay',
            destination,
            amount,
            asset_code,
            asset_issuer,
            memo,
            memo_type
        }, options)
    }

    /**
     * Request an asset trustline creation.
     * @param {String} asset_code - Asset code.
     * @param {String} asset_issuer - Asset account issuer.
     * @param {String} [limit] - [Optional] Trustline limit.
     * @param {IntentOptions} [options] - Intent request options.
     * @returns {Promise<Object>}
     */
    trust(asset_code, asset_issuer, limit = undefined, options) {
        return this.request({intent: 'establish_trustline', asset_code, asset_issuer, limit}, options)
    }

    /**
     * Request inflation pool voting.
     * @param {String} destination - Inflation destination address.
     * @param {IntentOptions} [options] - Intent request options.
     * @returns {Promise<Object>}
     */
    inflationVote(destination, options) {
        return this.request({intent: 'inflation_vote', destination}, options)
    }

    generateAuthenticationToken() {
        return generateRandomToken()
    }
}


/**
 * Normalize a message before sending it to the signing endpoint.
 * @param {String} message - Message to normalize.
 * @returns {String}
 */
function normalizeMessageToSign(message) {
    switch (typeof message) {
        case 'number':
        case 'boolean':
            return message.toString()
        case 'string':
            return message
        case 'undefined':
            return ''
    }
    return JSON.stringify(message)
}

Intent.intentInterface = intentInterface

module.exports = Intent