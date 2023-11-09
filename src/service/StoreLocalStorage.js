import CryptoJS from 'crypto-js'

// get localstorage data
export const GetLocalStorage = (name) => {
    const encrypted = localStorage.getItem(name);
    if (encrypted) {
        const decrypted = CryptoJS.AES.decrypt(encrypted, "secret key 123").toString(CryptoJS.enc.Utf8);
        return decrypted;
    } else {
        return ""
    }
}

// set localstorage data
export const SetLocalStorage = (name, data) => {
    var ciphertext = CryptoJS.AES.encrypt(data, 'secret key 123').toString()
    return localStorage.setItem(name, ciphertext);
}

// remove localstorage data
export const RemoveLocalStorage = (name) => {
    return localStorage.removeItem(name);
}

// clear localstorage data
export const clearLocalStorage = () => {
    return localStorage.clear();
}

