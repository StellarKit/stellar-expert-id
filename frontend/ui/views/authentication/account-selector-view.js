import React from 'react'
import {observer} from 'mobx-react'
import actionContext from '../../state/action-context'
import accountManager from '../../state/account-manager'
import Avatar from '../account-settings/avatar-view'
import KeypairOption from '../account-settings/keypair-view'
import KeypairEditor from '../account-settings/keypair-editor-view'
import Login from '../authentication/login-view'

@observer
class AccountSelectorView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            mode: null
        }
    }

    onAccountClick(account) {
        //select the account
        actionContext.selectedAccount = account
        if (!account.isDecrypted) {
            this.setState({mode: 'login'})
        }
    }

    resetMode() {
        this.setState({mode: null})
    }

    editAccountProperties(account) {

    }

    signOut(account) {
        account.signOut()
    }

    renderAccountOption(account) {
        return <li key={account.email}
                   className={'account-option' + (actionContext.selectedAccount === account ? ' selected' : '')}>
            {account.isDecrypted && <div style={{float: 'right', fontSize: '1.2em', paddingTop: '0.4em'}}>
                &nbsp;
                <a href="#" className="fa fa-cog" title="Settings" onClick={e => this.editAccountProperties(account)}/>
                &nbsp;&nbsp;
                <a href="#" className="fa fa-sign-out" title="Sign out" onClick={e => this.signOut(account)}/>
            </div>
            }
            <a href="#" onClick={e => this.onAccountClick(account)}>
                <Avatar account={account}/><span title={account.email}>{account.email}</span>
            </a>
            {this.state.mode === 'login' && actionContext.selectedAccount === account && !account.isDecrypted &&
            <Login email={account.email} onLogin={() => this.resetMode()} onCancel={() => this.resetMode()}/>}
            {this.renderKeypairs(account)}
        </li>
    }

    renderKeypairs(account) {
        if (actionContext.selectedAccount === account && account.isDecrypted) {
            return <ul>
                {account.keypairs.map(keypair => <li key={keypair.address}>
                    <KeypairOption account={account} keypair={keypair}/>
                </li>)}
                {this.state.mode === 'add-keypair' && <li key="new-keypair">
                    <KeypairEditor account={account} onFinish={_ => this.resetMode()}/>
                </li>}
                <li key="add-keypair block-indent-screen" style={{paddingTop: '0.5em'}}>
                    <a href="#" onClick={e => this.setState({mode: 'add-keypair'})}>
                        <span className="fa fa-plus-circle"/> Add new Stellar account secret key
                    </a>
                </li>
            </ul>
        }
    }

    render() {
        return <div className="account-selector">
            {this.props.title && <h4>{this.props.title}</h4>}
            <ul>
                {accountManager.accounts.map(account => this.renderAccountOption(account))}
            </ul>
            <hr/>
            <div style={{padding:'1em 1.5em'}}>
                <a href="/create-account"><i className="fa fa-user-plus"/> Add account</a>
            </div>
        </div>
    }
}

export default AccountSelectorView