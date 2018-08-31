const intentInterface = {
    public_key: {
        risk: 'low',
        personalData: false,
        unsafe: false,
        params: {
            required: [],
            return: ['pubkey']
        }
    },
    //TODO: implement request for specific fields
    basic_info: {
        risk: 'low',
        personalData: true,
        unsafe: false,
        params: {
            required: [],
            return: ['info']
        }
    },
    authenticate: {
        risk: 'low',
        personalData: false,
        unsafe: false,
        params: {
            required: ['token'],
            return: ['pubkey', 'token', 'token_signature']
        }
    },
    sign_msg: {
        risk: 'medium',
        personalData: false,
        unsafe: false,
        params: {
            required: ['message'],
            optional: ['pubkey'],
            return: ['pubkey', 'message', 'message_signature']
        }
    },
    verify_msg: {
        risk: 'low',
        personalData: false,
        unsafe: false,
        params: {
            required: ['message', 'message_signature'],
            optional: ['pubkey'],
            return: ['pubkey', 'message', 'message_signature', 'confirmed']
        }
    },
    tx: {
        risk: 'high',
        personalData: false,
        unsafe: true,
        params: {
            required: ['xdr'],
            optional: ['pubkey', 'network', 'horizon'],
            return: ['xdr', 'signed_envelope_xdr', 'pubkey', 'tx_signature', 'network', 'prepare']
        }
    },
    pay: {
        risk: 'medium',
        personalData: false,
        unsafe: false,
        params: {
            required: ['amount', 'destination'],
            optional: ['asset_code', 'asset_issuer', 'memo', 'memo_type', 'network', 'horizon', 'prepare'],
            return: ['amount', 'destination', 'asset_code', 'asset_issuer', 'memo', 'memo_type', 'pubkey', 'network', 'horizon']
        }
    },
    trust: {
        risk: 'low',
        personalData: false,
        unsafe: false,
        params: {
            required: ['asset_code', 'asset_issuer'],
            optional: ['limit', 'pubkey', 'network', 'horizon', 'prepare'],
            return: ['asset_code', 'asset_issuer', 'limit', 'pubkey', 'network', 'horizon']
        }
    },
    inflation_vote: {
        risk: 'medium',
        personalData: false,
        unsafe: false,
        params: {
            required: ['destination'],
            optional: ['pubkey', 'network', 'horizon', 'prepare'],
            return: ['destination', 'pubkey', 'network', 'horizon']
        }
    }
}

module.exports = intentInterface