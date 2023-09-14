import React from 'react'
import { useReducer } from 'react';
import { createContext } from 'react'
import { RouteReducer } from './RouteReducer';
import { useEffect } from 'react';
import axios from 'axios';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import GlobalPageRedirect from '../auth_context/GlobalPageRedirect';
import { useRef } from 'react';
import { GetLocalStorage } from '../../service/StoreLocalStorage';

// create context
let AppProvider = createContext();

const initialistate = {
    PageData: [],
    UserData: '',
    Permission: [],
    accessData: [],
    loader: false,
    leaveNotification: []
}
const RouteContext = ({ children }) => {
    const [records, setRecords] = useState([]);
    const [recordsFilter, setRecordsFilter] = useState([]);
    const [Loading, setLoading] = useState(false);

    let { pathname } = useLocation();
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
            console.log('error', error)
            if (!error.response) {
            } else if (error.response.status === 401) {
                getCommonApi();
            } else {
                if (error.response.data.message) {
                    toast.error(error.response.data.message)
                }
            }
        }
    }

    // get page name deatil
    const getPage = async (data) => {
        if (!data) {
            dispatch({ type: 'SET_LOADER', payload: true })
        }
        try {
            const request = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${GetLocalStorage('token')}`
                },
            }
            const res = await axios.get(`${process.env.REACT_APP_API_KEY}/page/list`, request)
            const result = await res.data.data;
            dispatch({ type: "GET_PAGE_DATA", payload: result })

        } catch (error) {
            if (!error.response) {
            } else if (error.response.status === 401) {
                getCommonApi();
            } else {
                if (error.response.data.message) {
                    toast.error(error.response.data.message)
                } else {
                    if (typeof error.response.data.error === "string") {
                        toast.error(error.response.data.error)
                    }
                }
            }
        }
        finally {
            dispatch({ type: 'SET_LOADER', payload: false })
        }
    }

    // get premission name deatil
    const getPremission = async () => {
        try {
            let token = GetLocalStorage('token');
            const request = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
            }
            const res = await axios.get(`${process.env.REACT_APP_API_KEY}/permission/list`, request)
            const result = await res.data.data;
            dispatch({ type: "GET_PERMISSION_DATA", payload: result })

        } catch (error) {
            console.log(error, "getPremission ===>")
            if (!error.response) {
            } else if (error.response.status === 401) {
                getCommonApi();
            } else {
                if (error.response.data.message) {
                    toast.error(error.response.data.message)
                } else {
                    if (typeof error.response.data.error === "string") {
                        toast.error(error.response.data.error)
                    }
                }
            }
        }
    }

    // find only one page permision condition
    const FindPermission = (path) => {
        // find the role of permission
        let responsePermission = state.Permission.filter((Elem) => {
            return Elem.role_id === state.UserData.role_id
        })
        let page_id = ""
        // find page id
        if (path.slice("1").toLowerCase().includes("employees/view") || path.slice("1").toLowerCase().includes("employees/edit")) {
            page_id = state.PageData.find((val) => {
                return val.name.toLowerCase() === "employees"
            })
        } else {
            page_id = state.PageData.find((val) => {
                return val.name.toLowerCase() === path.slice('1').toLowerCase()
            })

        }
        dispatch({ type: 'EMPTY_PERMISSION' })
        if (state.PageData.length !== 0 && page_id) {
            // find the role of permission for array find to only this page permission
            if (responsePermission.length !== 0 && page_id) {
                // eslint-disable-next-line
                let accessData = responsePermission.filter((curElem) => {
                    return curElem.page_id === page_id.id
                })
                dispatch({ type: 'PAGE_PERMISSION', payload: accessData })
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
            const res = await axios.post(`${process.env.REACT_APP_API_KEY}/leave/notification`,{}, request)
            if (res.data.success) {
                console.log(res)
                dispatch({ type: "LEAVE_NOTIFICATION", payload: res.data.data })
            }
            setLoading(false)
        } catch (error) {
            setLoading(false)
            console.log(error, "esjrihewaiu")
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

    useEffect(() => {
        if (GetLocalStorage('token')) {
            getUserData();
            // getPage();
            // getPremission();
        }
        // eslint-disable-next-line
    }, [])


    return (
        <AppProvider.Provider value={{ ...state, visible, width, logoToggle, setlogoToggle, setSidebarToggle, sidebarRef, sidebarToggle, handleVisibility, getUserData, getPremission, FindPermission, getPage, setRecords, getLeaveNotification, records, recordsFilter, setRecordsFilter, setLoading, Loading }}>
            {children}
        </AppProvider.Provider>
    )
}

export { RouteContext, AppProvider }
