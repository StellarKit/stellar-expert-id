import 'whatwg-fetch'
import signer from '../util/crypotgraphy/signer'
import appSettings from '../app-settings'

function checkNotFrozen(builder){
    if (builder._frozen) throw new Error('The API Builder can be used only once. Create new instance of API Builder.')
}

class ApiCallBuilder {
    constructor(endpoint) {
        if (typeof endpoint !== 'string') throw new TypeError('Invalid API endpoint.')
        this._endpoint = endpoint
        this._headers = {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        }
    }

    _endpoint = null
    _method = 'GET'
    _payload = null
    _signature = null
    _headers = null

    data(payload) {
        checkNotFrozen(this)
        if (this._signature) throw new Error('Cannot change payload after signing.')
        this._payload = payload
        return this
    }

    authorize(password) {
        if (!password || typeof password !== 'string') throw new TypeError('Password is required to sign the payload.')
        checkNotFrozen(this)
        if (!this._payload) {
            this._payload = {}
        }
        this._payload.nonce = new Date().getTime()

        let serializedPayload = JSON.stringify(this._payload)
        this._signature = signer.sign(serializedPayload, password)
        return this
    }

    get() {
        checkNotFrozen(this)
        this._method = 'GET'
        return this.execute()
    }

    post() {
        checkNotFrozen(this)
        this._method = 'POST'
        return this.execute()
    }

    put() {
        checkNotFrozen(this)
        this._method = 'PUT'
        return this.execute()
    }

    delete() {
        checkNotFrozen(this)
        this._method = 'DELETE'
        return this.execute()
    }

    execute() {
        checkNotFrozen(this)

        if (!this._signature) throw new Error('API call not authorized.')
        this._headers.Authorization = 'ED25519 ' + this._signature

        this._frozen = true

        let params = {
            method: this._method || 'GET',
            body: JSON.stringify(this._payload),
            headers: this._headers
        }

        let url = `${appSettings.apiEndpoint}/api/${this._endpoint}`
        if (this._method !== 'GET') {
            Object.assign(params, {
                body: JSON.stringify(this._payload)
            })
        } else {
            let query = Object.assign({}, this.data)
            let asString = Object.keys(query)
                .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`)
                .join('&')
            url += asString ? '?' + asString : ''
        }

        return fetch(url, params)
            .then(resp => resp.json())
    }
}

export default ApiCallBuilder