import CryptoJS from 'crypto-js'

export const decryptPassword = (data) => {
    if (data) {
        const decrypted = CryptoJS.AES.decrypt(data, process.env.REACT_APP_SECRET_KEY).toString(CryptoJS.enc.Utf8);
        return decrypted;
    } else {
        return ""
    }
}

export const encryptPassword = (data) => {
    var ciphertext = CryptoJS.AES.encrypt(data, process.env.REACT_APP_SECRET_KEY).toString()
    return ciphertext
}