import React from 'react'

class TotpRequestView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            key: '',
            code: ''
        }
    }

    setKey(key) {
        let code = /\D/g.replace(key, '') || ''
        if (code.length !== 6) {
            code = ''
        }
        this.setState({key, code})
    }

    confirm() {
        throw new Error('Not implemented')
    }

    render() {
        const {key, code} = this.state
        return <div>
            <h2>2FA verification</h2>
            <div>Please provide 6-digits verification code provided by your 2FA authenticator application.</div>
            <div>
                <input type="text" maxLength={8} value={key}
                       onChange={e => this.setKey(e.target.value)}/>
            </div>
            <div>
                <button onClick={e => this.confirm()} disabled={code.length !== 6}>Confirm</button>
            </div>
        </div>
    }
}

export default TotpRequestView