import React from 'react'
import PropTypes from 'prop-types'

export default function LayoutView({children}) {
    return <div>
        <div style={{textAlign: 'center', padding: '0.3em', background: '#ddd', marginBottom: '0.5em'}}>
            <a href="/demo" target="_blank">It's a demo for developers.</a> Do not store private keys from your wallets here.
        </div>
        <div className="container">
            <header>
                <a href="/" className="logo dimmed">
                    stellar<img alt="StellarExpert" src="/img/stellar-expert.svg"/>expert.<span
                    style={{color: 'blue'}}>id</span>
                </a>
            </header>
            <div className="page-container">
                {children}
            </div>
            <footer className="dimmed text-center space">
                <div className="copyright">
                    2018&nbsp;©&nbsp;StellarExpertID <span className="dimmed">v{appVersion}</span>
                </div>
                <div>
                    by OrbitLens&emsp;
                    <a href="mailto:orbit.lens@gmail.com" target="_blank" className="dimmed">
                        <i className="fa fa-envelope-o"/> Contact by email
                    </a>&emsp;
                    <a href="https://twitter.com/orbitlens" target="_blank" className="dimmed">
                        <i className="fa fa-twitter"/> Follow on Twitter
                    </a>
                </div>
            </footer>
        </div>
    </div>
}