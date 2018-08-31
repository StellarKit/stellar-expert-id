import React from 'react'
import PropTypes from 'prop-types'

class UserLoginView extends React.Component {
    constructor(props) {
        super(props)
    }

    submit(e) {
        e.preventDefault()
    }

    render() {
        return <div className="login-view">
            <h2>Log in into your account</h2>
            <form action="/api/login" onSubmit={e => this.submit(e)}>
                <div>
                    <input type="text" placeholder="Nickname or Stellar account public key"/>
                </div>
                <div>
                    <input type="password" placeholder="Password or Stellar account private key"/>
                </div>
                <div className="actions">
                    <button>Log in</button>
                    <a href="/sign-up">Create new account</a>
                </div>
            </form>
        </div>
    }
}

export default UserLoginView