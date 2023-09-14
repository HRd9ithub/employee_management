import axios from 'axios'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'
// import { toast } from 'react-toastify'
// import { browserName,mobileModel } from "react-device-detect";
import DeviceDetector from "device-detector-js";
import GlobalPageRedirect from './GlobalPageRedirect';
import { GetLocalStorage, RemoveLocalStorage, SetLocalStorage } from '../../service/StoreLocalStorage';
import { toast } from 'react-hot-toast';

export const Globalcomponent = () => {
    const [pageToggle, setpageToggle] = useState(false)
    const [loader, setLoader] = useState(false)
    const [Error, setError] = useState([]);

    const navigate = useNavigate();

    let { getCommonApi } = GlobalPageRedirect();

    const deviceDetector = new DeviceDetector();
    const userAgent = navigator.userAgent;
    const device = deviceDetector.parse(userAgent);


    // login function
    const onSubmit = async (data) => {
        setError([]);
        try {
            setLoader(true)
            const res = await axios.post(`${process.env.REACT_APP_API_KEY}/auth/login`, data)
            if (res.data.success) {
                toast.success(res.data.message)
                setpageToggle(true)
            }
        } catch (error) {
            console.log('error', error);
            if (!error.response) {
                toast.error(error.message)
            } else if (error.response.data.message) {
                toast.error(error.response.data.message)
            } else {
                if (error.response.data.error) {
                    setError(error.response.data.error)
                }
            }
        } finally {
            setLoader(false)
        }
    }

    // otp verify function
    const onSubmitOtp = async (email, otp) => {
        setError([]);

        try {
            setLoader(true)
            // const location = await axios.get('https://ipgeolocation.abstractapi.com/v1/?api_key=539daa0d70404b92ac257dcb18fcfd2d')
            const location = await axios.get('http://ip-api.com/json')

            const res = await axios.patch(`${process.env.REACT_APP_API_KEY}/auth/otp`, {
                email,
                otp,
                city: location.data.city,
                ip: location.data.query,
                device: device.device.type,
                device_name: device.device.model,
                browser_name: device.client.name
            })

            if (res.data.success) {
                let { message, id, token } = res.data;
                SetLocalStorage("user_id", id)
                SetLocalStorage("token", token)
                toast.success(message);
                navigate('/')
            }
        } catch (error) {
            console.log('error', error)
            if (!error.response) {
                toast.error(error.message)
            } else if (error.response.data.message) {
                toast.error(error.response.data.message)
            } else {
                if (error.response.data.error) {
                    setError(error.response.data.error)
                }
            }
        } finally {
            setLoader(false)
        }
    }

    // sign out function
    const handleLogout = async () => {
        setLoader(true)
        let config = {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${GetLocalStorage('token')}`
            },
        }

        axios.post(`${process.env.REACT_APP_API_KEY}/auth/logout`, {}, config).then((res) => {
            if (res.data.success) {
                RemoveLocalStorage('token')
                RemoveLocalStorage('user_id')
                navigate('/login');
                setLoader(false)
                toast.success('Logged out successfully.')
            }
        }).catch((error) => {
            setLoader(false)
            console.log('error', error)
            if (!error.response) {
                toast.error(error.message)
            } else if (error.response.status === 401) {
                getCommonApi();
            } else if (error.response.data.message) {
                toast.error(error.response.data.message)
            }
        })
    }

    return {
        pageToggle,
        onSubmit,
        loader,
        onSubmitOtp,
        handleLogout,
        Error
    }
}

