import axios from "axios";
import { GetLocalStorage } from "./StoreLocalStorage";


const Api = axios.create({
	baseURL: process.env.REACT_APP_API_KEY,
    headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GetLocalStorage('token')}`
    },
});



export default Api;


