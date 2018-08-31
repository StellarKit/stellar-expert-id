import React from 'react'
import {observer} from 'mobx-react'
import AccountSelector from '../authentication/account-selector-view'

export default observer(({props}) => <div>
        <h2>StellarExpert ID</h2>
        <p>
            Safe and reliable way to use Stellar account without sharing your private key.
        </p>
        <h2>My accounts</h2>
        <AccountSelector/>

        <div className="space">
            <h3>Key features</h3>
            <ul style={{paddingLeft: '0'}}>
                <li>
                    <b>Secure key management</b> – your secret key is never exposed to third-party services.
                </li>
                <li>
                    <b>Two-factor authorization support</b> – provides another level of protection for your accounts.
                </li>
                <li>
                    <b>Secure transaction signing</b> – transactions are signed without exposing a secret key.
                </li>
                <li>
                    <b>Web apps Single Sign-On</b> – login to third-party websites, just like Google/Facebook OAuth.
                </li>
                <li>
                    <b>Digital identity</b> – associate a nickname/email/avatar with your account or stay incognito.
                </li>
                <li>
                    <b>Multi-account support</b> – use multiple accounts and switch them when you need it.
                </li>
                <li>
                    <b>Trustlines creation</b> – anchor trustlines and token airdrops in one click.
                </li>
                <li>
                    <b>Message signing tools</b> – sign and verify arbitrary data with your private keys.
                </li>
                <li>
                    <b>Inflation voting</b> – vote for inflation pools without worries for your funds safety.
                </li>
                <li>
                    <b>Federation support</b> – make use of a human-friendly address for your account.
                </li>
                <li>
                    <b>Works everywhere</b> – seamless experience on desktops, smartphones, and tablets.
                </li>
            </ul>
        </div>
    </div>
)