import React from 'react'
import PropTypes from 'prop-types'
import appSettings from '../../app-settings'
import {formatAssetUnifiedLink} from '../../util/formatter'
import Address from './account-address-view'

function AssetLinkView({asset, compact, noLink}) {
    if (!asset) return null
    if (typeof asset === 'string') {
        let [code, issuer] = asset.split('-')
        asset = {code, issuer}
    }
    const children = [<code key="code">{asset.code}</code>]
    if (asset.issuer) {
        children.push('-')
        children.push(<Address key="issuer" account={asset.issuer} noLink compact={compact}/>)
    }
    if (noLink) return <span>{children}</span>
    return <a href={`${appSettings.explorer}asset/${formatAssetUnifiedLink(asset)}`} target="_blank">
        {children}
    </a>
}

AssetLinkView.propTypes = {
    asset: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    compact: PropTypes.bool,
    noLink: PropTypes.bool
}

export default AssetLinkView