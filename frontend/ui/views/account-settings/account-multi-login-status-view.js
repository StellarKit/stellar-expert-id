import React from 'react'
import PropTypes from 'prop-types'
import {observer} from 'mobx-react'
import AccountKeypair from '../../state/account-keypair'
import Auth2FaApps from './auth-2fa-apps-view'

@observer
class AccountMultiLoginStatusView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            showSetup: false
        }
    }

    renderMulitLoginState() {
        const account = this.props.account
        if (account.multiLogin) return <div>
            <i className="fa fa-check-circle-o"/> Multi Login is enabled. Would you like to to disable it?
            <div className="actions space">
                <a href={`/account/${account.address}/disable-multi-login`}>Disable</a>
                <a href="/">Cancel</a>
            </div>
        </div>

        return <div>
            Would you like to enable Multi Login and Two Factor Authorization?
            <div className="actions space">
                <a href={`/account/${account.address}/enable-multi-login`}>Enable</a>
                <a href="/">Cancel</a>
            </div>
        </div>
    }

    render() {
        return <div>
            <h2>Multi Login and 2FA</h2>

            <div>
                Multi Login with 2 Factor Authentication feature increases security and simplifies your account
                usage on other devices and browsers.
                <br/>
                We do not have access to the account secret key. It is encrypted with your password in the browser and
                securely stored on our servers.
                <br/>
                This feature requires a 2FA authenticator application like <Auth2FaApps/>.
            </div>

            {this.renderMulitLoginState()}
        </div>
    }
}

export default AccountMultiLoginStatusView