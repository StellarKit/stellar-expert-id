import React from 'react'
import PropTypes from 'prop-types'
import errors from '../../util/errors'
import accountManager from '../../state/account-manager'
import actionContext from '../../state/action-context'
import Account from '../../state/account'
import Actions from '../shared/actions-block-view'
import Lightbox from '../shared/lightbox-view'
import Dropdown from '../shared/dropdown-view'

class LoginView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            email: props.email || '',
            sessionDuration: '0',
            password: ''
        }
    }

    static propTypes = {
        email: PropTypes.string,
        onLogin: PropTypes.func,
        onCancel: PropTypes.func
    }

    componentWillReceiveProps(newProps) {
        this.setState({
            email: newProps.email || '',
            password: ''
        })
    }

    submit(e) {
        e.preventDefault()
        const {onLogin} = this.props,
            {email, password, sessionDuration} = this.state,
            account = accountManager.get(email)

        account.unlock(password, sessionDuration)
            .then(() => {
                actionContext.selectedAccount = account
                onLogin && onLogin(account)
            })
            .catch(e => {
                console.error(e)
                //unhandled
                if (!e.code) e = errors.genericError()
                alert(e.message)
            })
    }


    onKeyDown(e) {
        if (e.keyCode === 27) {
            this.props.onCancel && this.props.onCancel()
        }
    }

    render() {
        const email = this.props.email || this.state.email || ''
        return <Lightbox className="login-view">
            <h3>Sign in</h3>
            <form action="/login" onSubmit={e => this.submit(e)} target="dummy">
                <div className="row">
                    <div className="column column-50">
                        <input type="email" placeholder="Your email" value={email} autoFocus={!email}
                               disabled={!!this.props.email} onChange={e => this.setState({email: e.target.value})}
                               onKeyDown={e => this.onKeyDown(e)}/>
                    </div>
                    <div className="column column-50">
                        <input type="password" placeholder="Password" value={this.state.password || ''}
                               onChange={e => this.setState({password: e.target.value})} autoFocus={!!email}
                               onKeyDown={e => this.onKeyDown(e)}/>
                    </div>
                </div>
                <div>
                    Stay signed in <Dropdown list={[
                        {value: '0', title: 'until the browser tab is closed'},
                        {value: '3600', title: 'for an hour'},
                        {value: '86400', title: 'for a day'},
                        {value: '2592000', title: 'always'}
                    ]} onChange={e => this.setState({sessionDuration: e.value})} value={this.state.sessionDuration}/>
                </div>
                <Actions>
                    <button className="stackable">Sign in</button>
                    {' '}
                    <a href="#" className="button button-outline stackable"
                       onClick={() => this.props.onCancel && this.props.onCancel()}>Cancel</a>
                </Actions>
            </form>
            <iframe src="dummy.html" name="dummy" style={{display: 'none'}}/>
        </Lightbox>
    }
}

export default LoginView