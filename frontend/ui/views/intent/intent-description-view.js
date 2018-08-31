import React from 'react'
import PropTypes from 'prop-types'
import actionContext from '../../state/action-context'
import TxDetailsView from './tx-details-view'
import {formatAddress, formatCurrency} from '../../util/formatter'

const riskLevels = {
    low: {
        color: 'primary',
        icon: 'info-circle'
    },
    medium: {
        color: 'warning',
        icon: 'exclamation-triangle '
    },
    high: {
        color: 'danger',
        icon: 'exclamation-circle'
    }
}

function IntentContextIconView({color, main, sub}) {
    return <span className={`stacked-icon`}>
        <span className={`fa fa-fw fa-${main} main`}/>
        {sub && <span className={`fa fa-fw fa-${sub} sub color-${color}`}/>}
    </span>
}

function RiskLevelIconView({risk}) {
    const level = riskLevels[risk]
    return <IntentContextIconView color={level.color} main="envelope-open-o" sub={level.icon}/>
}

function IntentDetailsView({title, children, expanded}) {
    const {risk, personalData, unsafe} = actionContext.intentProps,
        {app_name, app_origin, app_description} = actionContext.data

    return <div>
        <h3>
            <b>{title}</b> Requested by <a href={app_origin || '#'} title={app_description}>
            {app_name} ({app_origin || 'unknown'})</a>.
        </h3>
        <div><RiskLevelIconView risk={risk}/> Risk level: <b>{risk}</b>.</div>
        <div>
            {personalData ?
                <span>
                    <IntentContextIconView color="warning" main="id-card-o" sub="key"/> The application requested access to your personal data (email and avatar).
                </span> :
                <span>
                    <IntentContextIconView color="primary" main="id-card-o" sub="lock"/> No personal data will be transferred.
                </span>}
        </div>
        <div>
            {unsafe ?
                <span>
                    <IntentContextIconView color="warning" main="shield" sub="exclamation-triangle"/> Potentially unsafe. Double-check the request information, otherwise you may lose your funds and account access.
                </span> :
                <span>
                    <IntentContextIconView color="primary" main="shield"/> Your funds are safe.
                </span>}
        </div>
        <div className="space">
            {expanded && children}
        </div>
    </div>
}

IntentDetailsView.propTypes = {
    title: PropTypes.string.isRequired,
    expanded: PropTypes.bool,
    children: PropTypes.any.isRequired
}

function IntentDescriptionView({expanded}) {
    const {intent, data, intentErrors} = actionContext
    if (intentErrors) {
        return <IntentDetailsView title="External error." expanded={true}>
            <b>Error. {intentErrors}</b>
            <br/>
            It's likely an external application error. Please contact {data.app_name} support.
        </IntentDetailsView>
    }
    switch (intent) {
        case 'public_key':
            return <IntentDetailsView title="View your account public key." expanded={expanded}>
                The application requested read-only access to your Stellar account address.
            </IntentDetailsView>
        case 'basic_info':
            //TODO: request only specific fields
            return <IntentDetailsView title="View your publicly available info." expanded={expanded}>
                The application requested read-only access to your personal information (email and avatar).
            </IntentDetailsView>
        case 'authenticate':
            return <IntentDetailsView title={`Log into ${data.app_origin} with StellarExpertId.`} expanded={expanded}>
                The application requested you to log in to {data.app_origin}.
            </IntentDetailsView>
        case 'sign_msg':
            return <IntentDetailsView title="Sign arbitrary message." expanded={expanded}>
                The application requested message signature.
                <div className="space">
                    <span className="label">Message: </span><code
                    className="word-break">{data.message}</code>
                </div>
            </IntentDetailsView>
        case 'verify_msg':
            return <IntentDetailsView title="Verify message signature." expanded={expanded}>
                The application requested message signature verification.
                <div className="space">
                    <span className="label">Message: </span><code
                    className="word-break">{data.message}</code>
                </div>
                <div className="space">
                    <span className="label">Signature: </span><code
                    className="word-break">{data.message_signature}</code>
                </div>
            </IntentDetailsView>
        case 'tx':
            return <IntentDetailsView title="Sign transaction." expanded={expanded}>
                The application requested transaction signature. Thoroughly examine transaction details before
                confirmation.
                <TxDetailsView xdr={data.xdr}/>
            </IntentDetailsView>
        case 'trust':
            return <IntentDetailsView
                title={`Establish trustline to ${data.asset_code}.`}
                expanded={expanded}>
                The application requested a trustline creation to asset <code>{data.asset_code}</code>
                {' '}issued by <code className="word-break">{formatAddress(data.asset_issuer, 16)}</code>.
            </IntentDetailsView>
        case 'inflation_vote':
            return <IntentDetailsView title={`Set your inflation vote to ${formatAddress(data.destination, 16)}.`}
                                      expanded={expanded}>
                The application requested change of the inflation destination for your account.
                Double-check the inflation destination address before confirmation.
                Otherwise you may stop receiving inflation payments.
            </IntentDetailsView>
        case 'pay':
            return <IntentDetailsView
                title={`Pay ${formatCurrency(data.amount)} ${data.asset_issuer ? data.asset_code + '-' + formatAddress(data.asset_issuer, 12) : 'XLM'} to ${formatAddress(data.destination, 16)}.`}
                expanded={expanded}>
                The application requested to pay {formatCurrency(data.amount)}
                {data.asset_issuer ? data.asset_code + '-' + formatAddress(data.asset_issuer, 12) : 'XLM'}
                to ${formatAddress(data.destination, 16)}.
            </IntentDetailsView>
    }
}

IntentDescriptionView.propTypes = {
    expanded: PropTypes.bool
}

export default IntentDescriptionView