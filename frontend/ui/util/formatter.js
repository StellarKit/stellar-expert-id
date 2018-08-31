/**
 * Format currency with specified precision.
 * @param {Number|String} amount - Currency amount to format.
 * @param {Number} [decimals] - Digits after decimal separator.
 * @param {String} [separator] - Thousands separator character.
 * @return {String}
 */
function formatCurrency(amount, decimals, separator = ',') {
    if (typeof amount === 'number') amount = amount + ''
    if (typeof amount !== 'string') return '0'

    let parts = amount.split('.'),
        left = parts[0],
        right = (parts[1] || ''),
        res = ''
    separator = separator || ','

    if (decimals !== undefined) {
        let withPrecision = parseFloat(amount).toFixed(decimals)
        right = (withPrecision.split('.')[1] || '')
    }

    if (right) {
        right = right.replace(/0+$/, '')
    }

    while (left.length > 3) {
        res = separator + left.substr(-3) + res
        left = left.substr(0, left.length - 3)
    }
    if (left === '-') {
        res = res.substr(1)
    }
    res = left + res

    if (right) {
        res += '.' + right
    }

    return res
}

/**
 * Format Stellar account address.
 * @param {String} address - Stellar account public key.
 * @param {Number} [significantChars] - Number of leading and trailing chars to display.
 * @return {String}
 */
function formatAddress(address, significantChars = 12) {
    if (!address || address.length !== 56 || significantChars > 26) return address
    const slength = Math.max(2, Math.floor(significantChars / 2))
    return address.substr(0, slength) + '…' + address.substr(-slength)
}

/**
 * Format a unified asset link compatible with StellarExpert.
 * @param {Object} asset - Asset descriptor.
 * @param {String} asset.code - Asset code.
 * @param {String} asset.issuer - Asset issuer (skip for native XLM tokens).
 * @return {String}
 */
function formatAssetUnifiedLink(asset) {
    if (asset.code === 'XLM' && !asset.issuer) return 'XLM'
    return asset.code + '-' + asset.issuer
}

export {
    formatAddress,
    formatAssetUnifiedLink,
    formatCurrency
}