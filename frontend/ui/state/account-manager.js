import {observable, action, transaction} from 'mobx'
import Account from './account'
import AccountKeypair from './account-keypair'
import {enumerateStoredAccounts, loadAccountDataFromBrowserStorage, deleteAccount} from '../storage/account-storage'

class AccountManager {
    constructor() {
        this.loadSavedAccounts()
    }

    /**
     * Find account persisted in browser storage by an email
     * @param email
     * @returns {Account|null}
     */
    get(email) {
        return this.accounts.find(a => a.email === email)
    }

    /**
     * Load all accounts saved in browser localStorage.
     */
    @action
    loadSavedAccounts() {
        this.accounts = enumerateStoredAccounts()
            .map(email => new Account(loadAccountDataFromBrowserStorage(email)))
        this.createDemoAccount()
            .catch(e => console.error(e))
    }

    /**
     * Create demo account if it does not exist and unlock it permanently.
     * @returns {Promise<Account>}
     */
    @action
    createDemoAccount() {
        const demoEmail = 'demo@demo.com'
        let existingDemoAccount = this.get(demoEmail)
        if (existingDemoAccount) {
            if (existingDemoAccount.isDecrypted) return Promise.resolve(existingDemoAccount) //everything ok
            //something went wrong, have to recreate it
            deleteAccount(existingDemoAccount)
            this.accounts = this.accounts.filter(a => a !== existingDemoAccount)
        }

        let pwd = Math.random().toString(36).slice(2)
        return Account.create(demoEmail, pwd)
            .then(demoAccount => {
                return demoAccount.addKeypair(new AccountKeypair({
                    secret: 'SCDQNBXV6WSAUCVNYQCD6NAXL7S2ROG2DSHHEBLKIGKQPYWUIUAYIO7T',
                    friendlyName: 'Demo account'
                }))
                    .then(() => demoAccount.save())
                    .then(() => demoAccount.unlock(pwd, 100000000000))
                    .then(() => this.accounts.push(demoAccount))
                    .then(() => demoAccount)
            })
    }

    /**
     * All accounts saved to browser localStorage.
     * @type {Account[]}
     */
    @observable
    accounts = []
}

export default new AccountManager()