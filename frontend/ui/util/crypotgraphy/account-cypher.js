import AES from 'crypto-js/aes'
import EncUtf8 from 'crypto-js/enc-utf8'
import appSettings from '../../app-settings'
import {randomBytes} from 'tweetnacl'

function preparePassword(password) {
    return appSettings.salt + password
}

function validateNonEmpty(data, key) {
    if (!data) throw new Error(`Invalid argument: ${key}.`)
    if (typeof data !== 'string') throw new TypeError(`Invalid argument type: ${key}.`)
}

/**
 * Generates random 512 bit key for encryption.
 * @returns {String}
 */
function generateRandomEncryptionKey() {
    return btoa(String.fromCharCode.apply(null, randomBytes(64)))
}

/**
 * AES-encrypt arbitrary data with a password provided by a user.
 * @param {String} plainData - Data to encrypt.
 * @param {String} password - A password provided by user.
 * @return {String}
 */
function encryptDataAes(plainData, password) {
    validateNonEmpty(plainData, 'plainData')
    validateNonEmpty(password, 'password')
    return AES.encrypt(plainData, preparePassword(password)).toString()
}

/**
 * AES-decrypt arbitrary data with a password provided by a user.
 * @param {String} encryptedData - Data to decrypt.
 * @param {String} password - A password provided by user.
 * @return {String}
 */
function decryptDataAes(encryptedData, password) {
    validateNonEmpty(encryptedData, 'plainData')
    validateNonEmpty(password, 'password')
    const decryptedBytes = AES.decrypt(encryptedData, preparePassword(password))
    return decryptedBytes.toString(EncUtf8)
}

export {generateRandomEncryptionKey, encryptDataAes, decryptDataAes}