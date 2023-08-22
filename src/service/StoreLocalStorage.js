import CryptoJS from 'crypto-js'

export const GetLocalStorage = (name) => {
    const encrypted = localStorage.getItem(name);
    if(encrypted){
        const decrypted = CryptoJS.AES.decrypt(encrypted, "secret key 123").toString(CryptoJS.enc.Utf8);
        return decrypted;
    }else{
        return ""
    }
}
export const SetLocalStorage = (name,data) => {
    var ciphertext = CryptoJS.AES.encrypt(data, 'secret key 123').toString()
 return localStorage.setItem(name,ciphertext);
}
export const RemoveLocalStorage = (name) => {
 return localStorage.removeItem(name);
}

