import axios from 'axios'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
// import { browserName,mobileModel } from "react-device-detect";
import DeviceDetector from "device-detector-js";
import GlobalPageRedirect from './GlobalPageRedirect';
import { GetLocalStorage, RemoveLocalStorage, SetLocalStorage } from '../../service/StoreLocalStorage';

export const Globalcomponent = () => {
    const [pageToggle, setpageToggle] = useState(false)
    const [loader, setLoader] = useState(false)
    const [Error, setError] = useState([]);

    const navigate = useNavigate();

    let {getCommonApi} = GlobalPageRedirect();

    const deviceDetector = new DeviceDetector();
    const userAgent = navigator.userAgent;
    const device = deviceDetector.parse(userAgent);


    // login function
    const onSubmit = async (data) => {
        setError([]);
        try {
            setLoader(true)
            const res = await axios.post(`${process.env.REACT_APP_API_KEY}/login`, data)
            if (res.data.success) {
                toast.success('OTP sent successfully.')
                setpageToggle(true)
            } else {
                toast.error('Invalid Email or Password');
            }
        } catch (error) {
            console.log('error', error);
            if (!error.response) {
                toast.error(error.message)
            } else if (error.response.data.message) {
                toast.error(error.response.data.message)
            } else {
                if (typeof error.response.data.error === "object") {
                    setError(error.response.data.error)
                } else {
                    toast.error(error.response.data.error)
                }
            }
        } finally {
            setLoader(false)
        }
    }

    // otp verify function
    const onSubmitOtp = async (email, otp) => {
        setError([]);
        let Hours = new Date().getHours();
        let Minutes = new Date().getMinutes();
        let login_time = Hours + ":" + Minutes;

        try {
            setLoader(true)
            // const location = await axios.get('https://ipgeolocation.abstractapi.com/v1/?api_key=539daa0d70404b92ac257dcb18fcfd2d')
            const location = await axios.get('http://ip-api.com/json')

            const res = await axios.post(`${process.env.REACT_APP_API_KEY}/otp`, { email, otp  })

            if (res.data.success) {
                // login information
                axios.post(`${process.env.REACT_APP_API_KEY}/loginInfo`, {
                    city: location.data.city,
                    ip_adderss: location.data.query,
                    device: device.device.type,
                    device_name: device.device.model,
                    browser_name: device.client.name
                    // city: location.data.city,
                    // ip_adderss: location.data.ip_address,
                    // device: device.device.type,
                    // device_name: device.device.model,
                    // browser_name: device.client.name
                }, {
                    headers: {
                        Authorization: `Bearer ${res.data.token}`,
                    },
                }).then((data) => {

                    if (data.data.success) {
                        // login time add  
                        axios.post(`${process.env.REACT_APP_API_KEY}/timesheet/logintime`, { login_time: login_time }, {
                            headers: {
                                Authorization: `Bearer ${res.data.token}`,
                            },
                        }).then((response) => {
                            if (response.data.success) {
                                if(res.data.user){
                                    SetLocalStorage("token", res.data.token);
                                    SetLocalStorage("user_id", JSON.stringify(res.data.user[0].id));
                                    navigate('/');
                                    toast.success('You are Logged in successfully.');
                                }
                            } else {
                                console.log('response', response)
                                toast.error(response.data.message.login_time[0]);
                                setLoader(false)
                            }
                        }).catch((error) => {
                            setLoader(false)
                            console.log('error', error)
                            if (error.response.data.message) {
                                toast.error(error.response.data.message)
                            } else {
                                if (typeof error.response.data.error === "object") {
                                    setError(error.response.data.error)
                                } else {
                                    toast.error(error.response.data.error)
                                }
                            }
                        })
                    }
                }).catch((error) => {
                    console.log('error', error)
                    if (error.response.data.message) {
                        toast.error(error.response.data.message)
                    } else {
                        if (typeof error.response.data.error === "object") {
                            setError(error.response.data.error)
                        } else {
                            toast.error(error.response.data.error)
                        }
                    }
                    setLoader(false)
                })
            } else {
                toast.error('Invalid OTP.')
                setLoader(false)
            }
        } catch (error) {
            console.log('error', error)
            if (!error.response) {
                toast.error(error.message)
            } else if (error.response.data.message) {
                toast.error(error.response.data.message)
            } else {
                if (typeof error.response.data.error == "object") {
                    setError(error.response.data.error)
                } else {
                    toast.error(error.response.data.error)
                }
            }
            setLoader(false)
        }
    }

    // sign out function
    const handleLogout = async () => {
        try {
            let Hours = new Date().getHours();
            let Minutes = new Date().getMinutes();
            let logout_time = Hours + ":" + Minutes;
            setLoader(true)

            const config = {
                headers: { Authorization: `Bearer ${GetLocalStorage('token')}` }
            };
            const bodyParameters = {
                key: "value"
            };

            const response = await axios.post(`${process.env.REACT_APP_API_KEY}/timesheet/logout_time`, { logout_time }, {
                headers: {
                    Authorization: `Bearer ${GetLocalStorage("token")}`,
                },
            })
            if (response.data.success) {
                axios.post(`${process.env.REACT_APP_API_KEY}/logout`, bodyParameters, config).then((res) => {
                    if (res.data.success) {
                        navigate('/login');
                        RemoveLocalStorage('token')
                        RemoveLocalStorage('user_id')
                        setLoader(false)
                        toast.success(' Logged out successfully.')
                    }
                    else {
                        setLoader(false)
                        toast.error('Logout failed.')
                    }
                }).catch((error) => {
                    setLoader(false)
                    console.log('error', error)
                    if (!error.response) {
                        toast.error(error.message)
                    } else if(error.status === 401){
                       getCommonApi();
                    }else if (error.response.data.message) {
                        toast.error(error.response.data.message)
                    } else {
                        if (typeof error.response.data.error == "object") {
                            setError(error.response.data.error)
                        } else {
                            toast.error(error.response.data.error)
                        }
                    }
                })
            } else {
                setLoader(false)
                toast.error(response.data.message.logout_time[0])
            }
        } catch (error) {
            setLoader(false)
            console.log('error', error)
            if (!error.response) {
                toast.error(error.message)
            } else if(error.status === 401){
               getCommonApi();
            }else if (error.response.data.message) {
                toast.error(error.response.data.message)
            } else {
                if (typeof error.response.data.error == "object") {
                    setError(error.response.data.error)
                } else {
                    toast.error(error.response.data.error)
                }
            }
        } 
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

