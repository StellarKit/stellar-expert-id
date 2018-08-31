import React from 'react'
import PropTypes from 'prop-types'
import actionContext from '../../state/action-context'
import Account from '../../state/account'
import AccountKeypair from '../../state/account-keypair'
import KeypairEditor from './keypair-editor-view'

class KeypairView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            editing: !props.keypair,
            friendlyName: ''
        }
    }

    static propTypes = {
        account: PropTypes.instanceOf(Account).isRequired,
        keypair: PropTypes.instanceOf(AccountKeypair),
        selectable: PropTypes.bool,
        onSelect: PropTypes.func
    }

    select() {
        const {keypair, selectable, onSelect} = this.props
        if (keypair) {
            if (selectable !== false) {
                actionContext.selectedKeypair = keypair
            }
            if (onSelect) {
                onSelect(keypair, this)
            }
        }
    }

    render() {
        const {keypair, account} = this.props

        if (this.state.editing) {
            return <KeypairEditor account={account} keypair={keypair} onFinish={_ => this.setState({editing: false})}/>
        }

        return <span className="keypair block-indent-screen">
            <a href="#" onClick={_ => this.select()} className="public-key">{keypair.displayName}</a>&nbsp;
            <a href="#" title="Settings" onClick={_ => this.setState({editing: true})} className="fa fa-cog"/>
        </span>
    }
}

export default KeypairView