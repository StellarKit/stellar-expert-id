import {
    Transaction,
    TransactionBuilder,
    Operation,
    Networks,
    Network,
    Asset,
    Memo,
    Keypair,
    xdr as xdrTypes
} from 'stellar-base'
import BigNumber from 'bignumber.js'
import {Server} from 'stellar-sdk'
import appSettings from '../app-settings'

function initHorizon({network, horizon}) {
    if (!network) { //use PUBLIC network by default
        network = 'public'
    }
    const networkSettings = appSettings.networks[network.toLowerCase()]
    if (networkSettings) { //PUBLIC or TESTNET
        //use passphrase from predefined networks
        network = Networks[network.toUpperCase()]
        if (!horizon) {
            //use predefined Horizon URL if none was provided
            horizon = networkSettings.horizon
        }
    }
    if (!horizon) return Promise.reject('Parameter "horizon" is required for the non-standard networks.')
    //set current network
    Network.use(new Network(network))
    //create Horizon server wrapper
    return Promise.resolve(new Server(horizon))
}

async function processTransaction(actionContext, keyPair, txBuilderCallback) {
    try {
        //init horizon and the set up the network
        const horizon = await initHorizon(actionContext.data)
        //build the transaction
        const tx = await txBuilderCallback(horizon, keyPair)
        //sign it
        tx.sign(keyPair)
        //prepare return params
        let res = {
            intent: actionContext.intent,
            pubkey: keyPair.publicKey(),
            network: actionContext.network || 'public'
        }

        if (!actionContext.data.callback && !actionContext.data.prepare) {
            //submit a transaction to Horizon
            const txResult = await horizon.submitTransaction(tx)
            Object.assign(res, {
                tx_hash: txResult.hash,
                horizon: horizon.serverURL.toString()
            })
        } else {
            //just prepare a signed envelope
            Object.assign(res, {
                signed_envelope_xdr: tx.toEnvelope().toXDR().toString('base64'),
                tx_signature: keyPair.sign(tx.hash()).toString('hex')
            })
        }

        return Promise.resolve(res)
    }
    catch (err) {
        console.error(err)
        //something wrong with the network connection
        if (err.message === 'Network Error') return Promise.reject({message: 'Network error.'})
        if (err.response) { //treat as Horizon error
            if (err.response.status === 404) return Promise.reject({message: `Account does not exists on the network ${actionContext.network}.`})
            return Promise.reject({message: 'Transaction failed.', details: err.response.data})
        }
        //unhandled error
        //TODO: add detailed error specification
        return Promise.reject({message: 'Failed to process the transaction.'})
    }
}

function createTransactionBuilder(operations, memo, memo_type) {
    //return actual build transaction handler
    return async function (horizon, keyPair) {
        //load account
        const sourceAccount = await horizon.loadAccount(keyPair.publicKey())
        //build a transaction
        let tx = new TransactionBuilder(sourceAccount)
        //add operations
        operations.forEach(op => tx.addOperation(op))
        //add tx memo if requested
        if (memo) {
            tx.addMemo(new Memo(normalizeMemoType(memo_type), memo))
        }
        //build tx and xdr
        return tx.build()
    }
}

/**
 * Normalize memo type to the values accepted by Memo.
 * @param {String} memoType - Memo type.
 * @return {String}
 */
function normalizeMemoType(memoType) {
    if (!memoType) return 'text' //text by default
    let type = memoType.split('_').pop().toLowerCase()
    if (!['text', 'id', 'hash', 'return'].includes(type)) return 'text' //invalid type - treat as MEMO_TEXT
    return type
}

export default function (responder) {
    responder.registerReaction('trust', function (actionContext, keyPair) {
        //retrieve operation parameters
        const {asset_code, asset_issuer, limit = '922337203685.4775807'} = actionContext.data,
            txBuilder = createTransactionBuilder([
                Operation.changeTrust({asset: new Asset(asset_code, asset_issuer), limit})
            ])

        return processTransaction(actionContext, keyPair, txBuilder)
            .then(res => Object.assign(res, {asset_code, asset_issuer, limit}))
    })

    responder.registerReaction('inflation_vote', function (actionContext, keyPair) {
        const {destination} = actionContext.data,
            txBuilder = createTransactionBuilder([
                Operation.setOptions({inflationDest: destination})
            ])

        return processTransaction(actionContext, keyPair, txBuilder)
            .then(res => Object.assign(res, {destination}))
    })

    responder.registerReaction('pay', function (actionContext, keyPair) {
        const {amount, destination, asset_code, asset_issuer, memo, memo_type} = actionContext.data,
            //build an asset instance or use XLM if the issuer is undefined
            asset = asset_issuer ? new Asset(asset_code, asset_issuer) : Asset.native(),
            txBuilder = createTransactionBuilder([
                Operation.payment({asset, amount, destination})
            ], memo, memo_type)

        return processTransaction(actionContext, keyPair, txBuilder)
            .then(res => Object.assign(res, {amount, destination, asset_code, asset_issuer, memo, memo_type}))
    })

    responder.registerReaction('tx', function (actionContext, keyPair) {
        const {xdr} = actionContext.data
        return processTransaction(actionContext, keyPair, async function (horizon) {
            const tx = new Transaction(xdr), //parse xdr
                //check if source account consists exclusively of zeros (see SEP-0007)
                //equivalent to secret derived from Buffer.from('\0'.repeat(32))
                shouldReplaceSourceAccount = tx.source === 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
                shouldReplaceSequence = tx.sequence === '0'

            if (shouldReplaceSequence || shouldReplaceSourceAccount) {
                //load account
                const sourceAccount = await horizon.loadAccount(shouldReplaceSourceAccount ? keyPair.publicKey() : tx.source)
                //replace source account
                if (shouldReplaceSourceAccount) {
                    tx.source = sourceAccount.id //update ths source field in the transaction itself
                    tx.tx._attributes.sourceAccount = Keypair.fromPublicKey(sourceAccount.accountId()).xdrAccountId() //update nested xdr
                }
                //replace sequence
                if (shouldReplaceSequence) {
                    const sequenceNumber = new BigNumber(sourceAccount.sequenceNumber()).add(1).toString()
                    tx.sequence = sequenceNumber
                    tx.tx._attributes.seqNum = xdrTypes.SequenceNumber.fromString(sequenceNumber)
                }
            }

            return tx
        })
            .then(res => Object.assign(res, {xdr}))
    })
}

