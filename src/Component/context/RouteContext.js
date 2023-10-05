import React from 'react'
import { useReducer } from 'react';
import { createContext } from 'react'
import { RouteReducer } from './RouteReducer';
import { useEffect } from 'react';
import axios from 'axios';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import GlobalPageRedirect from '../auth_context/GlobalPageRedirect';
import { useRef } from 'react';
import { GetLocalStorage } from '../../service/StoreLocalStorage';

// create context
let AppProvider = createContext();

const initialistate = {
    UserData: '',
    loader: false,
    leaveNotification: [],
    leave:[],
    leaveFilter : [],
    permission : "",
    serverError : false
}
const RouteContext = ({ children }) => {
    const [Loading, setLoading] = useState(false);

    const [logoToggle, setlogoToggle] = useState(false)
    // search state
    const [visible, setVisible] = useState(true);
    const [width, setWidth] = useState(window.innerHeight);


    // sidebar toggle
    const [sidebarToggle, setSidebarToggle] = useState(false)
    let sidebarRef = useRef(null)

    let { getCommonApi } = GlobalPageRedirect();

    // use reducer
    const [state, dispatch] = useReducer(RouteReducer, initialistate)

    // get user data
    const getUserData = async () => {
        try {
            let id = GetLocalStorage('user_id');
            //create header
            const request = {
                headers: {
                    "Content-Type": "application/json",
                    authorization: `Bearer ${GetLocalStorage('token')}`
                },
            }

            let res = await axios.get(`${process.env.REACT_APP_API_KEY}/user/${id}`, request)
            let result = await res.data.data;
            dispatch({ type: "GET_USER_DATA", payload: result })
        } catch (error) {
            if (!error.response) {
                toast.error(error.message);
            } else if (error.response.status === 401) {
                getCommonApi();
            } else {
                if (error.response.data.message) {
                    toast.error(error.response.data.message)
                }
            }
        }
    }

    // leave data get
    const getLeaveNotification = async () => {
        setLoading(true);
        try {
            let token = GetLocalStorage('token');
            const request = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
            }
            const res = await axios.post(`${process.env.REACT_APP_API_KEY}/leave/notification`, {}, request)
            if (res.data.success) {
                dispatch({ type: "LEAVE_NOTIFICATION", payload: res.data.data })
            }
            setLoading(false)
        } catch (error) {
            setLoading(false)
            if (!error.response) {
                toast.error(error.message)
            } else if (error.response.status === 401) {
                getCommonApi();
            } else {
                if (error.response.data.message) {
                    toast.error(error.response.data.message)
                }
            }
        }
    }
    // leave data get
    const getLeave = async () => {
        setLoading(true);
        try {
            let token = GetLocalStorage('token');
            const request = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
            }
            const res = await axios.get(`${process.env.REACT_APP_API_KEY}/leave/`, request)
            if (res.data.success) {
                getLeaveNotification();
                dispatch({ type: "GET_LEAVE", payload: res.data })
            }
        } catch (error) {
            if (!error.response) {
                dispatch({ type: "SERVER_ERROR" })
                toast.error(error.message)
            } else if (error.response.status === 401) {
                getCommonApi();
            } else {
                if(error.response.status === 500){
                    dispatch({ type: "SERVER_ERROR" })
                }
                if (error.response.data.message) {
                    toast.error(error.response.data.message)
                }
            }
        } finally {
            setLoading(false)
        }
    }

    const HandleFilter = (name) => {
        let data = name;
       dispatch({type : "SERACH_FILTER",payload : data})
    }

    // input field toggle function
    const handleVisibility = () => {
        setVisible(prev => !prev);
    };

    // add variable width
    const handleWidth = () => {
        setWidth(window.innerWidth);
    };

    // screen size find for use
    useEffect(() => {
        window.addEventListener("resize", handleWidth);
        width <= 360 ? setVisible(false) : setVisible(true);
        return () => {
            window.removeEventListener("resize", handleWidth);
        };
    }, [width]);


    return (
        <AppProvider.Provider value={{ ...state,HandleFilter, visible, width, logoToggle,getLeave, setlogoToggle, setSidebarToggle, sidebarRef, sidebarToggle, handleVisibility, getUserData, getLeaveNotification, setLoading, Loading }}>
            {children}
        </AppProvider.Provider>
    )
}

export { RouteContext, AppProvider }
