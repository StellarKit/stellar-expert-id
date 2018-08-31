import React from 'react'
import {observer} from 'mobx-react'
import PropTypes from 'prop-types'
import identiconGenerator from '../../util/identicon-generator'

function AvatarView({account}) {
    if (account.avatar) return <div>img with avatar {account.avatar}</div>
    let dataUrl = 'data:image/svg+xml;base64,' + identiconGenerator(account.email)
    return <span className={`avatar${account.isDecrypted ? ' decrypted' : ''}`}
                 style={{backgroundImage: `url(${dataUrl})`}}/>
}

AvatarView.propTypes = {
    account: PropTypes.object
}

export default observer(AvatarView)