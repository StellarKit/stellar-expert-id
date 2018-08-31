**StellarExpertID** provides a safe and reliable way to use your Stellar accounts without trusting anyone with your secret key. All sensitive data is encrypted with your password and securely stored in the browser.

## Key features

- Secure key management – your secret key is never exposed to third-party services.
- Secure transaction signing – transactions are signed without exposing a secret key.
- [SEP-0007](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0007.md) compatible – can be used to handle "web+stellar" links. 
- Web apps Single Sign-On – login to third-party websites, just like with Google or Facebook OAuth.
- Two-factor authorization support – provides another level of protection for your accounts.
- Digital identity – associate a nickname, email, or avatar with your account address (or leave it blank if you prefer to stay incognito).
- Multi-account support – use multiple accounts and switch them when you need it.
- Message signing tools – sign and verify arbitrary data with your private keys.
- Inflation voting – vote for inflation pools with a single button click without worries for your funds' safety.
- Federation support – make use of a human-friendly address for your account.
- Works everywhere – the same account operates seamlessly via desktops, smartphones, and tablets.

## Intents

There are 4 main groups of intents:

1. Request transaction signing. The signer app prepares and signs a transaction which then can be returned to the initiator website or submitted directly to the network. 
2. Request specific action. Either "transfer funds", "vote for inflation pool", or "establish a trustline". Each action is effectively a simplified wrapper for the transaction signing request. No custom logic or even JS SDK is required on the initiator side.
3. Request information. The website may request a user's personal info (email, avatar) or Stellar account public key.
4. Request cryptographic signature of the arbitrary data. The website may request a crypto signature to verify a keypair ownership (authentication, secure messages exchange etc).

## Authorization flows 

The signer supports two authorizaton flows: an **implicit** flow and **callback** flow.

**Implicit flow** 

A popup window with request details is shown each time an initiator website requests the action. 
 
1. A user invokes some action on the third-party website (a wallet, DEX interface, inflation pool etc). Let's say, he wants to create an offer. 
2. The website prepares the requested transaction and it's XDR representation in base64 format.
3. The website initiates the intent (see intent list in the project description) using js module that provides an interface for all supported intents.
4. The interface module opens a new pop-up window pointing to `id.stellar.expert`. All intent parameters are serialized and transmitted in a form of GET parameters. So the full URL will look like `https://id.stellar.expert/confirm?intent=tx&network=testnet&xdr=AAAAALPZeTF82...`.
5. Signer application reads parameters from the URL and asks the user for a confirmation.
6. The user chooses a keypair from the list of stored accounts (or adds a new one) and confirms the action.
7. The signer app signs the transaction the same way any other wallet do it. 
8. The signed transaction is serialized into XDR as TransactionEnvelope and transmitted back to the opener site in base64 encoding via the built-in browser `postMessage` mechanism.
9. The third-party website receives a signed transaction envelope and may choose either to submit it to the network or store somewhere in case if the tx needs more signatures or if it has time bounds set.

Intent confirmation dialog always contains extended request information, including intent description (like "Sign transaction"), initiator website ("origin: example.com"), risk level ("high", "medium", or "low"), information about personal data disclosure (only for `personal_info` intent), and safety status ("safe" or "potentially unsafe"). Intent-specific details allow a user to review the request before confirmation. For instance, a dialog with `sing_tx` intent displays full transaction information including all meaningful properties and the list of operations in a human-friendly format adapted for the ordinary users.

**Callback flow**

The callback flow supports Stellar [SEP-0007](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0007.md) link format. 
Instead of showing a popup authorization dialog, it redirects the browser to the signer page. 
A signed transaction can be either submitted to the network or returned to the specified callback URL via POST request.


## Technical details

The project consists of three modules:

- The [**signer**](./frontend) website itself – provides a user-friendly interface for key management and operation intents.
- Client [**intent**](./intent) module – JS library that simplifies StellarExpertId integration and usage.
- Server-side **vault** – a simple server that provides API for encrypted credentials storage and 2FA verification.

*(Server-side vault storage option is temporarily disabled).*

The [intent](./intent) library supports the following actions ("intents"):

- `signTransaction(xdr, options)` – requests transaction signing (returns signed transaction envelope, can be used for multi-sig).
- `pay(destination, amount, asset_code, asset_issuer, memo, memo_type, options)` – requests a payment.
- `trust(asset_code, asset_issuer, limit, options)` – requests inflation pool voting.
- `inflationVote(inflationDestination, options)` – requests inflation pool voting.
- `signMessage(msg)` – requests arbitrary data signing.
- `verifyMessage(msg, signature)` – requests arbitrary data signature verification.
- `requestAddress()` – requests account public key (for basic web authentication).
- `authenticate()`  – requests user identity verification (for SSO login).
- `requestPersonalInfo()` – requests personal info access (avatar, nickname etc).

Available transaction intent options:
 
- `network` – stellar account network identifier ("public", "testnet") or private network passphrase.
- `horizon` – the url of a Stellar Horizon server (for transactions only).
- `prepare` – if set, the signer will return a signed tx envelope instead of submitting it to the Horizon server.

Formal intent data contracts can be found [here](./intent/src/intent-interface.js).

### "web+stellar" links

In order to set up this application as a signer for "web+stellar" links as described in [SEP-0007](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0007.md), you may either use [`navigator.registerProtocolHandler()`](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/registerProtocolHandler) (works in Chrome and Firefox) or configure the protocol binding [manually](https://support.shotgunsoftware.com/hc/en-us/articles/219031308-Launching-applications-using-custom-browser-protocols).

```
navigator.registerProtocolHandler('web+stellar', 
    'https://id.stellar.expert/confirm?encoded=%s', 
    'StellarExpertId signer')
```

*Please note: it's a developer preview software version, do not store your real Stellar account secret keys here.*

### Secret key storage options

Choose security options that suit you.

#### Multi-login with Two-factor authorization
Allowing this feature increases security and simplify your account usage across all your devices and browsers. Your secret key is encrypted with your password in the browser and securely stored on our servers. We do not have access to your account. 

*Account log-in and all subsequent actions are protected with 2FA TOTP authorization.*

This feature works with 2FA applications like [Google Authenticator](https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2), [Free OTP](https://freeotp.github.io/), or [Authy](https://authy.com/download/).

#### Browser-only storage with password protection
Credentials are encrypted with your password and stored in the browser. Nobody except you can obtain access to your account. 

*Account log-in and all subsequent actions require your password.*

#### Paranoid mode
StellarExpert ID never stores your credentials or any other info on our servers, nor in the browser. Nevertheless, you still can sign transactions and use other features providing your secret key to confirm all actions.

*Account log-in and all subsequent actions require your secret key.*


## Contributions

Contributions and suggestions are most welcome. 

Please ensure that tests are passing before submitting the pull request. 

```
npm test
``` 

## Questions and feedback.

[Issue tracker](https://github.com/orbitlens/stellar-expert-id/issues) for bug reports and feature requests. If you have any questions, drop me a note at orbit.lens@gmail.com. 