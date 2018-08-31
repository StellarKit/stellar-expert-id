import {observable, action, transaction, computed} from 'mobx'
import AccountKeypair from './account-keypair'
import authenticator from 'authenticator'
import ApiCall from '../api/api-call-builder'
import signer from '../util/crypotgraphy/signer'
import {generateRandomEncryptionKey} from '../util/crypotgraphy/account-cypher'
import {restoreSession, saveSession, expireSession} from '../storage/session-storage'
import {normalizeEmail, checkAccountDecrypted, validateAccountPassword} from '../util/validators'
import errors from '../util/errors'
import {
    encryptAccountAccessCode,
    decryptAccountAccessCode,
    encryptSensitiveAccountData,
    decryptSensitiveAccountData,
    persistAccountInBrowser,
    persistAccountServerSide
} from '../storage/account-storage'

/**
 * Encapsulates general account properties and serves as a root container for the associated keypairs.
 */
class Account {
    /**
     * Create an Account instance from the stored account data.
     * @param {Object} params - An object containing account properties.
     */
    constructor(params) {
        transaction(() => {
            Object.assign(this, params)
            if (!(this.keypairs instanceof Array)) {
                this.keypairs = []
            }
            if (restoreSession(this)) {
                Object.assign(this, decryptSensitiveAccountData(this))
            }
        })
    }

    /**
     * User email address.
     * @type {String}
     */
    @observable
    email = undefined

    /**
     * User avatar.
     * @type {String}
     */
    @observable
    avatar = undefined

    /**
     * Associated key pairs.
     * @type {AccountKeypair[]}
     */
    @observable
    keypairs = undefined

    /**
     * Randomly generated encryption for the account.
     * @type {String}
     */
    @observable
    encryptionKey = null

    /**
     * Temporary verification code containing encryptionKey encrypted using AES.
     * @type {String}
     */
    accessCode = null

    /**
     * Sensitive account data encrypted with encryptionKey.
     * @type {String}
     */
    encryptedData = null

    /**
     * True if the account stored on the server and can be used from other devices.
     * @type {Boolean}
     */
    @observable
    useMultiLogin = false

    /**
     * Indicates the state of account sensitive data. Mutation operations allowed only on decrypted account.
     * @return {Boolean}
     */
    @computed
    get isDecrypted() {
        return this.encryptionKey !== null
    }

    /**
     * Create new account using provided credentials.
     * @param {String} email - An email used to login into the account.
     * @param {String} password - A password provided by user.
     * @return {*}
     */
    static create(email, password) {
        email = normalizeEmail(email)
        return validateAccountPassword(password)
            .then(() => {
                const account = new Account({
                    email,
                    encryptionKey: generateRandomEncryptionKey()
                })
                account.accessCode = encryptAccountAccessCode(account, password)
                return account
            })
    }

    /**
     * Unlock account encryption key and sensitive.
     * @param {String} password - A password provided by user.
     * @param {Number} sessionDuration - Desired session duration (in seconds).
     * @returns {Promise<Account>}
     */
    unlock(password, sessionDuration) {
        return validateAccountPassword(password)
            .then(() => {
                const key = decryptAccountAccessCode(this, password)
                transaction(() => {
                    this.encryptionKey = key
                    Object.assign(this, decryptSensitiveAccountData(this))
                })
                if (sessionDuration) {
                    saveSession(this, sessionDuration)
                }
                //TODO: implement timer to clear decrypted sensitive data after inactivity period.
                //The data is cleared automatically on window closed if session duration expired.
                return this
            })
    }

    /**
     * Update account password. Requires account to be unlocked in the first place.
     * @param {String} newPassword - A password provided by user.
     * @return {Promise<Account>}
     */
    changePassword(newPassword) {
        return checkAccountDecrypted(this)
            .then(() => validateAccountPassword(newPassword))
            .then(() => {
                //reset encryption key
                transaction(() => {
                    this.encryptionKey = generateRandomEncryptionKey()
                    this.accessCode = encryptAccountAccessCode(account, password)
                    this.encryptedData = encryptSensitiveAccountData(this)
                })
                return this
            })
    }

    /**
     * Persist account information locally and, if allowed, on the server side.
     * @returns {Promise<Account>}
     */
    save() {
        return checkAccountDecrypted(this)
            .then(() => {
                //refresh encrypted data
                this.encryptedData = encryptSensitiveAccountData(this)
            })
            .then(() => persistAccountInBrowser(this))
            .then(() => persistAccountServerSide(this))
            .then(() => this)
    }

    /**
     * Load account data from the server (works only when multiLogin set to true).
     * @param {String} password - A password provided by user.
     * @return {Promise<Account>}
     */
    loadFromServer(password) {
        return Promise.reject(new Error('Temporary disabled'))
    }

    /**
     * Enable multi-login feature with 2FA for the account.
     * @param {String} totpKey - Randomly generated TOTP seed.
     * @param {String} verificationCode - A verification code obtained from the 2FA app like Google Authenticator.
     * @param {String} password - Account password.
     * @return {Promise<Account>}
     */
    enableMultiLogin(totpKey, verificationCode, password) {
        return Promise.reject(new Error('Temporary disabled'))
        //TODO: the account can be decrypted silently as we have a password
        return checkAccountDecrypted(this)
            .then(() => {
                if (this.useMultiLogin) return Promise.resolve(this)
                if (!totpKey) return Promise.reject(error.invalid2FATotpKeyFormat())
                if (!verificationCode || verificationCode.replace(/\D/g, '').length !== 6) return Promise.reject(error.invalid2FAVerificationCodeFormat())

                if (!authenticator.verifyToken(totpKey, verificationCode)) return Promise.reject(error.invalid2FAVerificationCode())

                return new ApiCall(`account/${this.id}/multilogin`)
                    .data({
                        totpKey,
                        authPublicKey: signer.derivePublicKeyFromPassword(password)
                    })
                    .authorize(password)
                    .post()
                    .then(() => {
                        this.useMultiLogin = true
                        return Promise.resolve(this)
                    })
            })
    }

    /**
     * Disable multi-login feature for the account.
     * @param {String} verificationCode - A verification code obtained from the 2FA app like Google Authenticator.
     * @return {Promise<Account>}
     */
    disableMultiLogin(verificationCode) {
        return Promise.reject(new Error('Temporary disabled'))
        return checkAccountDecrypted(this)
            .then(() => {
                if (!this.useMultiLogin) return Promise.resolve(this)

                return new ApiCall(`account`)
                    .data({
                        email: this.email,
                        verificationCode
                    })
                    .authorize(password)
                    .delete()
                    .then(() => {
                        this.useMultiLogin = false
                        return Promise.resolve(this)
                    })
            })
    }

    /**
     * Associate wrapped Stellar keypair with the account.
     * @param {AccountKeypair} keypair - Wrapped Stellar account keypair.
     * @return {Promise<Account>}
     */
    @action
    addKeypair(keypair) {
        return checkAccountDecrypted(this)
            .then(() => {
                if (!(keypair instanceof AccountKeypair)) return Promise.reject(new Error('Invalid argument: keypair.'))
                if (this.keypairs.some(a => a.address === keypair.address)) return Promise.reject(new Error('Account with the same address has been already added.'))
                this.keypairs.push(keypair)
                //update encrypted data
                this.encryptedData = encryptSensitiveAccountData(this)
                return this.save()
            })
    }

    /**
     * Remove a keypair from the account.
     * @param {AccountKeypair} keypair - Wrapped Stellar account keypair to remove.
     * @return {Promise<Account>}
     */
    @action
    removeKeypair(keypair) {
        return checkAccountDecrypted(this)
            .then(() => {
                if (!(keypair instanceof AccountKeypair)) return Promise.reject(new Error('Invalid argument: keypair.'))
                let idx = this.keypairs.indexOf(keypair)
                if (idx >= 0) {
                    this.keypairs.splice(idx, 1)
                }
                //update encrypted data
                this.encryptedData = encryptSensitiveAccountData(this)
                return this.save()
            })
    }

    /**
     * Finish user session and clear sensitive data.
     */
    signOut() {
        transaction(() => {
            this.keypairs = undefined
            this.encryptionKey = null
            expireSession(this)
        })
    }

    /**
     * Prepare account data for serialization.
     * @return {Object}
     */
    toJSON() {
        return {
            email: this.email,
            avatar: this.avatar || undefined,
            useMultiLogin: this.useMultiLogin,
            encryptedData: this.encryptedData,
            accessCode: this.accessCode
        }
    }

}

export default Account