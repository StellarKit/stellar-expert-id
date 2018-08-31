import React from 'react'
import PropTypes from 'prop-types'
import appSettings from '../../app-settings'

const defaultStyle = {
    width: '31em',
    maxWidth: '100%'
}

function AccountAddressView({account, compact, width, style, noLink}) {
    if (!account) return null
    if (width) {
        style = Object.assign({}, style, {
            maxWidth: width
        })
    } else if (compact) {
        style = Object.assign({}, style, {
            maxWidth: '5.2em'
        })
    }
    const containerStyle = Object.assign({}, defaultStyle, style)

    if (noLink) return <span className="collapsible-address" title={account} style={containerStyle}>
        <span>{account.substr(0, 52)}</span><span>{account.substr(-4)}</span>
    </span>

    return <a href={`${appSettings.explorer}account/${account}`} target="_blank" className="collapsible-address"
              title={account} style={containerStyle}>
        <span>{account.substr(0, 52)}</span><span>{account.substr(-4)}</span>
    </a>
}

AccountAddressView.propTypes = {
    account: PropTypes.string.isRequired,
    noLink: PropTypes.bool,
    compact: PropTypes.bool,
    width: PropTypes.string,
    style: PropTypes.object
}

export default AccountAddressView