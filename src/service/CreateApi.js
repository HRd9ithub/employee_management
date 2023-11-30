import axios from "axios";
import { GetLocalStorage, clearLocalStorage } from "./StoreLocalStorage";

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

    Api.interceptors.response.use(function (response) {
        return response;
      }, function (error) {
        if (error.response && error.response.status === 401) {
            clearLocalStorage();
            window.location.href = '/login';
        }
        return Promise.reject(error);
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

    Api.interceptors.response.use(function (response) {
        return response;
      }, function (error) {
        if (error.response && error.response.status === 401) {
            clearLocalStorage();
            window.location.href = '/login';
        }
        return Promise.reject(error);
      });
      
    return Api
}
