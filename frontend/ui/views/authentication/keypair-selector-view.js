import React from 'react'
import PropTypes from 'prop-types'
import {observer} from 'mobx-react'
import {CopyToClipboard} from 'react-copy-to-clipboard'
import Account from '../../state/account'
import AccountKeypair from '../../state/account-keypair'

function KeypairSelectorOption({accountKeypair: accountKeyPair}) {
    return <div className="keypair-option nowrap">
        <span className="address" title={accountKeyPair.address}>
        {accountKeyPair.displayName}
    </span>
        <CopyToClipboard text={accountKeyPair.address}>
            <a href="#" className="fa fa-copy active-icon" title="Copy address to clipboard"
               style={{fontSize: '0.8em'}}/>
        </CopyToClipboard>
    </div>
}

const KeypairSelectorOptionView = observer(KeypairSelectorOption)

KeypairSelectorOption.propTypes = {
    accountKeyPair: PropTypes.instanceOf(AccountKeypair).isRequired
}

function KeyPairSelectorView({account}) {
    return <div className="keypair-selector-view">
        {account.keypairs.map(keyPair => <KeypairSelectorOptionView key={keyPair.address} accountKeyPair={keyPair}/>)}
        <div>
            <a href="/create-account">Add another</a>
        </div>
    </div>
}

KeyPairSelectorView.propTypes = {
    account: PropTypes.instanceOf(Account).isRequired
}

export default observer(KeyPairSelectorView)