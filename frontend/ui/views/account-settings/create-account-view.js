import React from 'react'
import {observer} from 'mobx-react'
import Account from '../../state/account'
import accountManager from '../../state/account-manager'
import actionContext from '../../state/action-context'

@observer
class CreateAccountView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            email: '',
            password: '',
            confirmation: '',
            skipMultilogin: false,
            inProgress: false
        }
    }

    validate() {
        if (!/^\S+@\S+.\S+$/.test(this.state.email.trim())) return 'Invalid email'
        if (this.state.password.length < 6) return 'Password too short'
        if (this.state.password !== this.state.confirmation) return 'Passwords do not match'
    }

    signup(e) {
        e.preventDefault()

        let validationErrors = this.validate()
        if (validationErrors) return alert(validationErrors)

        this.setState({inProgress: true})

        const {email, password, skipMultilogin} = this.state
        Account.create(email, password)
            .then(account => account.save(password))
            .then(() => {
                accountManager.loadSavedAccounts()
                let account = accountManager.get(email)
                account.unlock(password)
                actionContext.selectedAccount = account
                this.setState({inProgress: false})
                __history.push(actionContext.confirmIntentPath || '/')
                //if (skipMultilogin) navigate('/') else navigate('/setup2fa')
            })
            .catch(err => {
                this.setState({inProgress: false})
                console.error(err)
            })
    }

    renderMessageText() {
        if (this.state.skipMultilogin) return <div className="message info">
            <p>
                Don't trust us with your sensitive information? It's ok, we understand.
                Everything will be encrypted and stored in your browser.
            </p>
            <p>
                Your email and password will be used for the encryption.
            </p>
            <p>
                Do not forget the password. We won't be able to recover the password if it's lost.
            </p>
        </div>
        return <div className="message info">
            <p>
                The email address will be used to store encrypted account data on the server.
                You will be able to log in and sync your credential across multiple devices.
            </p>
            <p>
                We don't have access to the account secret key. It is encrypted with your password in the browser and
                securely stored on our servers.
            </p>
            <p>
                Do not forget the password. We won't be able to recover the password if it's lost.
            </p>
        </div>
    }

    render() {
        const {email, password, confirmation, skipMultilogin, inProgress} = this.state
        return <div>
            <form action="/api/user" method="POST" onSubmit={e => this.signup(e)}>
                <div>
                    <input type="email" name="email" placeholder="Your email address" value={email}
                           onChange={e => this.setState({email: e.target.value})}/>
                </div>
                <div>
                    <input type="password" name="password" placeholder="Secure password" value={password}
                           onChange={e => this.setState({password: e.target.value})}/>
                </div>
                <div>
                    <input type="password" name="password" placeholder="Password conformation" value={confirmation}
                           onChange={e => this.setState({confirmation: e.target.value})}/>
                </div>
                <div>
                    <label>
                        <input type="checkbox" name="skipMultilogin" checked={skipMultilogin}
                               onChange={e => this.setState({skipMultilogin: e.target.checked})}/>
                        Disable multi-login from other devices.
                    </label>
                </div>
                <div className="actions">
                    <button disabled={inProgress}>Create account</button>
                </div>
            </form>
            {this.renderMessageText()}
        </div>
    }
}

export default CreateAccountView