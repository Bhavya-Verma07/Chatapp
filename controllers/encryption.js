// include crypto module
const crypto = require('crypto')

// set encryption algorithm
const algorithm = process.env.CRYPTOALGORITHM

// private key
const key = process.env.CRYPTO_ENCRYPTION_KEY // must be of 32 characters

module.exports.encryptdata = (data) => {
    // random 16 digit initialization vector
    const iv = crypto.randomBytes(16)
    // encrypt the string using encryption algorithm, private key and initialization vector
    const cipher = crypto.createCipheriv(algorithm, key, iv)
    let encryptedData = cipher.update(data, 'utf-8', 'hex')
    encryptedData += cipher.final('hex')

    // convert the initialization vector to base64 string
    const base64data = Buffer.from(iv, 'binary').toString('base64')

    return { encryptedData, iv: base64data }
}

module.exports.decryptdata = (data, iv) => {
    // convert initialize vector from base64 to buffer
    const origionalData = Buffer.from(iv, 'base64')
    // decrypt the string using encryption algorithm and private key
    const decipher = crypto.createDecipheriv(algorithm, key, origionalData)

    let decryptedData = decipher.update(data, 'hex', 'utf-8')
    decryptedData += decipher.final('utf8')
    return decryptedData
}