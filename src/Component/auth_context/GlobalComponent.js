import axios from 'axios'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'
import { isDesktop } from "react-device-detect";
import DeviceDetector from "device-detector-js";
import { RemoveLocalStorage, SetLocalStorage, clearLocalStorage } from '../../service/StoreLocalStorage';
import { toast } from 'react-hot-toast';
import { customAxios } from '../../service/CreateApi';

export const Globalcomponent = () => {
    const [loading, setLoading] = useState(false)
    const [Error, setError] = useState([]);

    const navigate = useNavigate();

    //  login function
    const onSubmit = async (data) => {
        setError([]);
        try {
            setLoading(true)
            const res = await customAxios().post('/auth/login', data)
            if (res.data.success) {
                toast.success(res.data.message);
                SetLocalStorage("email", res.data.data);
                navigate("/otp");
            }
        } catch (error) {
            if (!error.response) {
                toast.error(error.message)
            } else if (error.response.data.message) {
                toast.error(error.response.data.message)
            } else if (error.response.data.error) {
                setError(error.response.data.error)
            }
        } finally {
            setLoading(false)
        }
    }

    // otp verify function
    const onSubmitOtp = async (email, otp) => {
        const deviceDetector = new DeviceDetector();
        const userAgent = navigator.userAgent;
        const device = deviceDetector.parse(userAgent);
        setError([]);

        try {
            setLoading(true)
            const location = await axios.get('https://ipgeolocation.abstractapi.com/v1/?api_key=539daa0d70404b92ac257dcb18fcfd2d')
            // const location = await axios.get('http://ip-api.com/json')

            const res = await customAxios().patch('/auth/otp', {
                email,
                otp,
                city: location.data.city,
                ip: location.data.ip_address,
                // ip: location.data.query,
                device: device.device.type,
                device_name: device.device.model,
                browser_name: device.client.name,
                isDesktop: isDesktop
            })

            if (res.data.success) {
                let { message, id, token,userVerify } = res.data;
                RemoveLocalStorage("email")
                SetLocalStorage("user_id", id)
                SetLocalStorage("token", token)
                toast.success(message);
                if(userVerify){
                    navigate(`/profile/${id}`);
                }else{
                    navigate('/')
                }
            }
        } catch (error) {
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
            setLoading(false)
        }
    }

    // sign out function
    const handleLogout = async () => {
        setLoading(true);
        customAxios().post('/auth/logout').then((res) => {
            if (res.data.success) {
                clearLocalStorage();
                navigate('/login');
                setLoading(false)
                toast.success('Logged out successfully.')
            }
        }).catch((error) => {
            setLoading(false)
            if (!error.response) {
                toast.error(error.message)
            } else if (error.response.data.message) {
                toast.error(error.response.data.message)
            }
        })
    }

    // resend code 
    const HandleResend = async (email) => {
        setError([]);
        try {
            setLoading(true)
            const res = await customAxios().patch('/auth/resendOtp', { email })
            if (res.data.success) {
                toast.success(res.data.message)
            }
        } catch (error) {
            if (!error.response) {
                toast.error(error.message)
            } else if (error.response.data.message) {
                toast.error(error.response.data.message)
            } else if (error.response.data.error) {
                setError(error.response.data.error)
            }
        } finally {
            setLoading(false)
        }
    }

    return {
        onSubmit,
        loading,
        onSubmitOtp,
        handleLogout,
        Error,
        HandleResend
    }
}

