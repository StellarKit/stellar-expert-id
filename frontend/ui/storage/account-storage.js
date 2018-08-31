import ApiCall from '../api/api-call-builder'
import {decryptDataAes, encryptDataAes} from '../util/crypotgraphy/account-cypher'
import Account from '../state/account'
import AccountKeypair from '../state/account-keypair'

const accountKeyPrefix = 'account_'

/**
 * Load all stored accounts.
 * @returns {String[]} all accounts (emails) stored in the browser.
 */
function enumerateStoredAccounts() {
    return Object.keys(localStorage)
        .filter(key => key.indexOf(accountKeyPrefix) === 0)
        .map(key => key.substring(accountKeyPrefix.length))
}

/**
 * Load an account from the browser storage an email.
 * @param {String} email - User account email.
 * @returns {Promise<Object>}
 */
function loadAccountDataFromBrowserStorage(email) {
    if (!email || typeof email !== 'string' || email.length < 5) return Promise.reject(`Invalid account key: ${email}.`)
    let storedAccount = localStorage[accountKeyPrefix + email]
    if (!storedAccount) throw new Error(`Account ${email} is not stored in the browser.`)
    return JSON.parse(storedAccount)
}

/**
 * Encrypt account keypairs.
 * @param {Account} account - An account to encrypt.
 * @returns {String}
 */
function encryptSensitiveAccountData(account) {
    if (!account.isDecrypted) throw new Error('Account is encrypted.')
    return encryptDataAes(JSON.stringify({
        keypairs: account.keypairs || []
    }), account.encryptionKey)
}

/**
 * Decrypt account keypairs.
 * @param {Account} account - An account to decrypt.
 * @returns {Object}
 */
function decryptSensitiveAccountData(account) {
    if (!account.isDecrypted) throw new Error('Account is encrypted.')
    if (!account.encryptedData) return {}
    const decrypted = JSON.parse(decryptDataAes(account.encryptedData, account.encryptionKey))
    return {
        keypairs: (decrypted.keypairs || [])
            .map(serializedKeypair => {
                const keypair = new AccountKeypair(serializedKeypair)
                //set reference to parent account
                keypair.account = account
                return keypair
            })
    }
}

/**
 * Encrypt access code for temporary session.
 * @param {Account} account - An account to create access code for.
 * @param {String} password - User's password.
 * @returns {String}
 */
function encryptAccountAccessCode(account, password) {
    if (!account.encryptionKey) throw new Error('Account encryptionKey was not set.')
    return encryptDataAes(account.encryptionKey, account.email + password)
}

/**
 * Decrypt stored account access code for temporary session.
 * @param {Account} account - An account to retrieve access code.
 * @param {String} password - User's password.
 * @return {String}
 */
function decryptAccountAccessCode(account, password) {
    return decryptDataAes(account.accessCode, account.email + password)
}

/**
 * Save an account on the server if multiLogin feature is enabled.
 * @param {Account} account - An account to persist server-side.
 * @returns {Promise<Account>}
 */
function persistAccountServerSide(account) {
    if (!account.useMultiLogin) return Promise.resolve(account)
    return Promise.reject(new Error('Temporary disabled'))

    let payload = account.toJSON()

    if (account.authPublicKey) {
        payload.authPublicKey = account.authPublicKey
        payload.totpKey = account.totpKey
    }

    return new ApiCall(`account`)
        .data(payload)
        .authorize(password)
        .post()
        .then(() => {
            if (!account.useMultiLogin) {
                account.useMultiLogin = true
                return persistAccountInBrowser(account)
            }
            return Promise.resolve(account)
        })
}

/**
 * Save an account to the browser storage.
 * @param {Account} account - An account to save.
 * @returns {Promise<Account>}
 */
function persistAccountInBrowser(account) {
    if (!account.email) return Promise.reject(new Error('Account can\'t be stored.'))
    localStorage[accountKeyPrefix + account.email] = JSON.stringify(account.toJSON())
    return Promise.resolve(account)
}

function deleteAccount(account) {
    if (!account.email) return Promise.reject(new Error('Invalid account.'))
    localStorage.removeItem(accountKeyPrefix + account.email)
    return Promise.resolve(account)
}

export {
    enumerateStoredAccounts,
    loadAccountDataFromBrowserStorage,
    encryptSensitiveAccountData,
    decryptSensitiveAccountData,
    encryptAccountAccessCode,
    decryptAccountAccessCode,
    persistAccountInBrowser,
    persistAccountServerSide,
    deleteAccount
}