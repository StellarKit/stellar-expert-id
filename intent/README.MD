# Intent for StellarExpertID

A wrapper for [StellarExpertID API](https://github.com/orbitlens/stellar-expert-id) that 
provides a promise-based interface for all supported intents.    

## Installation

```
npm i -S orbitlens/stellar-expert-id/intent
```

_(Temporary, the module will be available directly from NPM in the future releases)_

## Usage

#### Setup

```
import Intent from 'intent-stellar-expert-id'
//initialize a wrapper passing name and description that will be displayed to users
const intent = new Intent({
    app_name: 'Demo',
    app_description: 'Demo application - for testing purpose only'
})
```

#### Account address

Requests account public key. Simple way of authentication for Stellar-related applications.

```
intent.requestAddress()
    .then(res => console.log(res.pubkey))
```

#### Transaction signature

Requests transaction signing. Allows to sign arbitrary Stellar transaction without any limitations. Returns signed transaction envelope that can be submitted to the network or used for multi-sig coordination.

```
intent.signTransaction('AAAA...AAAA=')
    .then(res => console.log(res.xdr, res.signed_envelope_xdr, res.pubkey, res.signature))
```

#### Trustline creation

Requests user's permission to create a trustline to a given Stellar asset. Gradually simplifies the process of creating trustlines for anchors, ICOs, and airdrops.

```
intent.establishTrustline('U9750353859', 'GBRX...WHBI')
    .then(res => console.log(res.asset_code, res.asset_issuer, res.limit, res.pubkey, res.network))
```

#### Inflation vote

Requests inflation pool voting. The easiest way to vote for the pool.

```
intent.inflationVote('GCCD...NAUT')
    .then(res => console.log(res.destination, res.pubkey, res.network))
```

#### Arbitrary message signing/verification

Requests arbitrary data signing or verification. Can be used to implement complex cases of identity/ownership verification.

```
intent.signMessage('text to sign')
    .then(res => console.log(res.pubkey, res.message, res.message_signature))
```

```
intent.verifyMessage('text to sign', 'signature', 'GBRX...WHBI')
    .then(res => console.log(res.confirmed, res.pubkey, res.message, res.message_signature))
```

#### User personal info

Requests user identity (email, avatar, etc) for Single-Sign-On logic. User personal details can be used to set up an email list subscription or personalize the UI.

```
intent.requestPersonalInfo()
    .then(res => console.log(res.info))
```

#### Authentication

Requests Single-Sign-On authentication. Can be used to sign up to Stellar-based applications. Returns Stellar account public key, authentication token, and signature.

```
intent.authenticate()
    .then(res => console.log(res.pubkey, res.token, res.token_signature))
```


## Old browsers support

Packaged version of `Intent` is supported by major modern browsers. In order to get this module working on the outdated browsers, you might need to add some polyfills.

- Browser `fetch` API requires [whatwg-fetch]() or something similar.
- You will also need a Promises/A+ compatible polyfill, we recommend minimalistic [taylorhakes/promise-polyfill].

