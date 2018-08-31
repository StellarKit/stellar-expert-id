if (typeof window === 'object' && typeof window.fetch !== 'function') {
    throw new Error('Browser FetchAPI is not available. For legacy browsers support use polyfills such as whatwg-fetch.')
}

const Intent = require('./intent')

module.exports = Intent