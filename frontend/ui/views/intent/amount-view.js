import React from 'react'
import PropTypes from 'prop-types'
import {formatCurrency} from '../../util/formatter'
import AssetLink from './asset-link-view'

function AmountView ({amount, asset, decimals}) {
    if (amount === undefined || amount === null) return null
    return <span className="nowrap">
        <b>{formatCurrency(amount, decimals)}</b> <AssetLink asset={asset} compact/>
    </span>
}

AmountView.propTypes = {
    amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    asset: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    decimals: PropTypes.number
}

export default AmountView