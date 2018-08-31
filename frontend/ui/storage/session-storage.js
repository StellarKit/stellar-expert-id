import {generateRandomEncryptionKey, encryptDataAes, decryptDataAes} from '../util/crypotgraphy/account-cypher'

const sessionEncryptionKeyName = 'sessionEncryptionKey',
    sessionPrefix = '__s'

function getSessionEncryptionKey() {
    //retrieve stored session encryption key
    let sessionEncryptionKey = localStorage.getItem(sessionEncryptionKeyName)
    if (!sessionEncryptionKey) {
        //create new session encryption key if use opens the website for the first time
        sessionEncryptionKey = generateRandomEncryptionKey()
        localStorage.setItem(sessionEncryptionKeyName, sessionEncryptionKey)
    }
    return sessionEncryptionKey
}

function getCookieKey(account) {
    return sessionPrefix + encodeURIComponent(account.email)
}

/**
 * Save temporary session cookie for the account. The cookie itself does not contain any sensitive information,
 * only a temporary random key that allows to decypher session on the client side.
 * @param {Account} account - Account to save.
 * @param {Number|String} duration - Cookie duration in seconds.
 */
function saveSession(account, duration) {
    if (!account.isDecrypted) throw new Error('Unable to save session. Account is encrypted.')
    duration = parseInt(duration)
    if (duration > 0) {
        const cookieKey = getCookieKey(account),
            encryptedData = encryptDataAes(account.encryptionKey, getSessionEncryptionKey())
        document.cookie = `${cookieKey}=${encodeURIComponent(encryptedData)};max-age=${duration};path=/`
    }
}

/**
 * Restore session from the stored session cookie.
 * @param {Account} account - Account to decypher.
 * @return {Boolean}
 */
function restoreSession(account) {
    const cookies = document.cookie.split(';').map(c => c.trim()),
        storedSession = cookies.find(c => c.indexOf(getCookieKey(account) + '=') === 0)

    if (storedSession) {
        let restoredEncryptionKey = decryptDataAes(decodeURIComponent(storedSession.split('=')[1]), getSessionEncryptionKey())
        if (restoredEncryptionKey) {
            account.encryptionKey = restoredEncryptionKey
            return true
        }
    }
    return false
}

/**
 * Mark session as expired and remove temporary cookie.
 * @param {Account} account - Account to decypher.
 */
function expireSession(account) {
    document.cookie = `${getCookieKey(account)}=;max-age=0`
}

export {saveSession, restoreSession, expireSession}