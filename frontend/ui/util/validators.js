import errors from './errors'

function normalizeEmail(email) {
    if (!email) return null
    email = email.trim().toLowerCase()
    if (!/^\S+@\S+\.\S+$/) return null
    return email
}

function checkAccountDecrypted(account) {
    if (!account.isDecrypted) return Promise.reject(new Error('Account is encrypted. Decrypt it first.'))
    return Promise.resolve(account)
}

function validateAccountPassword(password) {
    if (!password || typeof password !== 'string' || password.length < 8) return Promise.reject(errors.invalidPasswordFormat())
    return Promise.resolve(password)
}

export {
    normalizeEmail,
    checkAccountDecrypted,
    validateAccountPassword
}