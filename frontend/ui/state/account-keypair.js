import {observable, computed} from 'mobx'
import {StrKey, Keypair} from 'stellar-base'
import errors from '../util/errors'
import {formatAddress} from '../util/formatter'

/**
 * Stellar account key pair wrapper.
 */
class AccountKeypair {
    /**
     * Create new instance of AccountKeypair.
     * @param {Object} [serialized] - Plain object containing key pair details.
     */
    constructor(serialized = null) {
        if (serialized) {
            this.secret = serialized.secret
            this.friendlyName = serialized.friendlyName
        }
    }

    /**
     * Stellar account secret key.
     * @type {String}
     */
    @observable
    secret = null

    /**
     * Stellar account public key.
     * @returns {String}
     */
    @computed
    get address() {
        if (!this.secret || !StrKey.isValidEd25519SecretSeed(this.secret)) return null
        return Keypair.fromSecret(this.secret).publicKey()
    }

    /**
     * User-defined friendly name.
     * @type {String}
     */
    @observable
    friendlyName = null

    /**
     * Parent account reference.
     * @type {Account}
     */
    account = null

    /**
     * Title to display in UI.
     * @returns {String}
     */
    @computed
    get displayName() {
        if (this.friendlyName) return `${this.friendlyName} (${formatAddress(this.address, 8)})`
        return formatAddress(this.address, 16)
    }

    /**
     * Validate Stellar account secret key.
     * @returns {Promise<AccountKeypair>}
     */
    validate() {
        if (!StrKey.isValidEd25519SecretSeed(this.secret)) return Promise.reject(errors.invalidSecretKey())
        return Promise.resolve(this)
    }

    /**
     * Prepare data for the serialization.
     * @return {Object}
     */
    toJSON() {
        return {
            address: this.address,
            secret: this.secret,
            friendlyName: this.friendlyName
        }
    }
}

export default AccountKeypair