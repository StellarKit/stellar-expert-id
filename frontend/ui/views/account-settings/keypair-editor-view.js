import React from 'react'
import PropTypes from 'prop-types'
import Account from '../../state/account'
import AccountKeypair from '../../state/account-keypair'
import {observer} from 'mobx-react'
import StellarBase from 'stellar-base'
import errors from '../../util/errors'
import Lightbox from '../shared/lightbox-view'

@observer
class KeypairEditorView extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            secret: '',
            friendlyName: '',
            isValid: false,
            error: null
        }
        if (props.keypair) {
            this.state.secret = props.keypair.secret
            this.state.friendlyName = props.keypair.friendlyName || ''
            this.state.isValid = true
        }
    }

    static propTypes = {
        account: PropTypes.instanceOf(Account).isRequired,
        keypair: PropTypes.instanceOf(AccountKeypair),
        onFinish: PropTypes.func
    }

    changeSecretValue(secret) {
        let isValid = secret && StellarBase.StrKey.isValidEd25519SecretSeed(secret)

        this.setState({
            secret,
            isValid,
            error: null
        })
    }

    cancelEdit() {
        const {onFinish} = this.props
        onFinish && onFinish()
    }

    confirmEdit() {
        const {friendlyName, secret, isValid} = this.state,
            {keypair, account, onFinish} = this.props

        if (!isValid) {
            return this.setState({error: !secret ? errors.emptySecretKey() : errors.invalidSecretKey()})
        }

        let promise

        if (!keypair) {
            //create new keypair
            promise = account.addKeypair(new AccountKeypair({secret, friendlyName}))
        } else {
            keypair.secret = secret
            keypair.friendlyName = friendlyName || ''
            promise = account.save()
        }

        promise
            .then(() => onFinish && onFinish())
            .catch(err => alert(err.message))
    }

    remove() {
        if (confirm('Remove this Stellar account secret?')) {
            const {keypair, account, onFinish} = this.props
            account.removeKeypair(keypair)
                .then(() => onFinish && onFinish())
                .catch(err => alert(err.message))
        }
    }

    onKeyDown(e) {
        if (e.keyCode === 13) return this.confirmEdit()
        if (e.keyCode === 27) return this.cancelEdit()
    }

    render() {
        const {friendlyName, secret, isValid, error} = this.state,
            {keypair} = this.props

        return <Lightbox className="keypair-editor">
            <h3>
                {keypair ? 'Edit Stellar account' : 'Add new Stellar account'}
            </h3>
            <div>
                <input type="text" autoFocus value={friendlyName || ''} maxLength={40}
                       placeholder="Friendly name (optional)"
                       onChange={e => this.setState({friendlyName: e.target.value})}
                       onKeyDown={e => this.onKeyDown(e)}/>
            </div>
            <div>
                <input placeholder="Stellar account secret key (56 chars, starts with 'S')" value={secret || ''}
                       onChange={e => this.changeSecretValue(e.target.value)}
                       onKeyDown={e => this.onKeyDown(e)}/>
            </div>
            <div className="details">
                <i className="fa fa-info-circle"/>&nbsp;
                We have no access to your secret key, the data is encrypted in your browser.
            </div>
            <div className="actions space">
                <button onClick={_ => this.confirmEdit()} className="stackable" disabled={!isValid}>Save</button>
                {' '}
                <button onClick={_ => this.cancelEdit()} className="stackable button-outline">Cancel</button>
                {' '}
                {keypair && <button onClick={_ => this.remove()} className="stackable button-outline">Remove</button>}
            </div>
            {error && <div className="alert space">
                <i className="fa fa-warning"/> {error.message}
            </div>}
        </Lightbox>
    }
}

export default KeypairEditorView