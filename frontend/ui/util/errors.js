function buildError(params) {
    if (!params) return standardErrors.genericError()

    let error = new Error(params.message)
    error.code = params.code || 0
    if (params instanceof Error) {
        error.originalError = params
    }
    return error
}

const standardErrors = {
    genericError() {
        return buildError({
            message: 'Error occurred. If this error persists, please contact our support team.',
            code: 0
        })
    },
    actionRejectedByUser() {
        return buildError({
            message: 'Action was rejected by user',
            code: 1
        })
    },
    invalidSecretKey() {
        return buildError({
            message: 'Invalid Stellar secret key. Please check if you copied it correctly.',
            code: 101
        })
    },
    emptySecretKey() {
        return buildError({
            message: 'Stellar secret key is required.',
            code: 102
        })
    },
    invalidPasswordFormat() {
        return buildError({
            message: 'Invalid password format. Please provide a valid password.',
            code: 103
        })
    },
    /*accountNonPersistent() {
        return buildError({
        message: 'Account was not saved server-side. Enable the multi-login feature first.',
        code: 103
    }) },*/
    invalidPassword() {
        return buildError({
            message: 'Invalid account password. Please provide a valid password.',
            code: 104
        })
    },
    encryptedSecretKeyNotFound() {
        return buildError({
            message: 'Error decrypting account. Encrypted secret key not found.',
            code: 105
        })
    },
    invalid2FATotpKeyFormat() {
        return buildError({
            message: 'Invalid 2FA TOTP key format.',
            code: 201
        })
    },
    invalid2FAVerificationCodeFormat() {
        return buildError({
            message: 'Invalid 2FA verification code format.',
            code: 202
        })
    },
    invalid2FAVerificationCode() {
        return buildError({
            message: 'Invalid 2FA verification code.',
            code: 202
        })
    }
}
export default standardErrors