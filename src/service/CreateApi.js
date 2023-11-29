import axios from "axios";
import { GetLocalStorage } from "./StoreLocalStorage";

export const customAxios  = () => {
    const token  = GetLocalStorage('token');
    // * Create api for common
    const Api = axios.create({
        baseURL: process.env.REACT_APP_API_KEY,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
    });
    return Api
}
export const customAxios1  = () => {
    const token  = GetLocalStorage('token');
    // * Create api for common
    const Api = axios.create({
        baseURL: process.env.REACT_APP_API_KEY,
        headers: {
            "Content-Type": "multipart/form-data",
            'Authorization': `Bearer ${token}`
        },
    });
    return Api
}
