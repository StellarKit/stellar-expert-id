class IntentDispatcher {
    constructor() {
        this.intentWindow = null
        this.pendingRequest = null
        window.addEventListener('message', this.messageHandler.bind(this))
    }

    serializeIntentParams(params) {
        return Object.entries(params)
            .map(([param, value]) => `${encodeURIComponent(param)}=${encodeURIComponent(value)}`)
            .join('&')
    }

    showIntent(params) {
        let serverUrl = typeof stellarExpertIdFrontend === 'string' ? stellarExpertIdFrontend : 'https://id.stellar.expert',
            url = `${serverUrl}/confirm?${this.serializeIntentParams(params)}`,
            w = 440,
            h = 600,
            // Fixes dual-screen position                         Most browsers      Firefox
            dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX,
            dualScreenTop = window.screenTop !== undefined ? window.screenTop : window.screenY,
            currentWindowWidth = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width,
            currentWindowHeight = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height,
            left = ((currentWindowWidth / 2) - (w / 2)) + dualScreenLeft,
            top = ((currentWindowHeight / 2) - (h / 2)) + dualScreenTop

        this.intentWindow = window.open(url, 'auth.id.stellar.expert', `height=${h},width=${w},top=${top},left=${left},menubar=0,toolbar=0,location=0,status=0,personalbar=0,scrollbars=0,dependent=1`)
        //return promise
        return new Promise((resolve, reject) => this.pendingRequest = (err, data) => err ? reject(err) : resolve(data))
    }

    messageHandler({data}) {
        if (this.pendingRequest) {
            //TODO: look for OUR messages and skip messages from other windows
            if (data.error) {
                this.pendingRequest(data.error)
            } else {
                this.pendingRequest(null, data)
            }
            this.intentWindow.close()
        }
    }
}

module.exports = new IntentDispatcher()