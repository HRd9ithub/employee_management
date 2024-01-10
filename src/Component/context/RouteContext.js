import React, { useReducer, createContext, useState, useRef } from 'react'
import { RouteReducer } from './RouteReducer';
import { toast } from 'react-hot-toast';
import { GetLocalStorage, SetLocalStorage } from '../../service/StoreLocalStorage';
import { customAxios } from '../../service/CreateApi';
import moment from 'moment';

// create context
let AppProvider = createContext();

const initialistate = {
    UserData: '',
    loader: false,
    notification: [],
    leave: [],
    leaveFilter: [],
    permission: "",
    permissionToggle: true,
    serverError: false,
    userName: [],
    reportData: [],
    summary: "",
    leaveSetting: [],
}
const RouteContext = ({ children }) => {
    const [Loading, setLoading] = useState(false);
    const [id, setId] = useState("");
    const [logoToggle, setlogoToggle] = useState(false);
    const [startDate, setStartDate] = useState(moment().clone().startOf('month'));
    const [endDate, setendtDate] = useState(moment().clone().endOf('month'));
    const [user_id, setuser_id] = useState("");

    // sidebar toggle
    const [sidebarToggle, setSidebarToggle] = useState(false)
    let sidebarRef = useRef(null);

    // use reducer
    const [state, dispatch] = useReducer(RouteReducer, initialistate)

    // get user data
    const getUserData = async () => {
        try {
            setLoading(true)
            let id = GetLocalStorage('user_id');

            let res = await customAxios().get(`/user/${id}`)
            let result = await res.data;
            dispatch({ type: "GET_USER_DATA", payload: result.data })
            SetLocalStorage("userVerify", result.userVerify ? "true" : "false")
        } catch (error) {
            if (!error.response) {
                toast.error(error.message);
              }else if (error.response.data.message) {
                toast.error(error.response.data.message);
              }
        }finally{
            setLoading(false);
        }
    }

    // leave data get
    const getLeaveNotification = async () => {
        setLoading(true);
        try {
            const res = await customAxios().post('/leave/notification')
            if (res.data.success) {
                dispatch({ type: "LEAVE_NOTIFICATION", payload: res.data })
            }
            setLoading(false)
        } catch (error) {
            setLoading(false)
            if (!error.response) {
                toast.error(error.message);
              }else if (error.response.data.message) {
                toast.error(error.response.data.message);
              }
        }
    }
    // leave data get
    const getLeave = async (start, end, id) => {
        setLoading(true);
        try {
            const res = await customAxios().get(`/leave?startDate=${moment(start || startDate).format("YYYY-MM-DD")}&endDate=${moment(end || endDate).format("YYYY-MM-DD")}&id=${id ? id : user_id}`);
            if (res.data.success) {
                dispatch({ type: "GET_LEAVE", payload: res.data });
                if (res.data.permissions && res.data.permissions.name.toLowerCase() === "admin") {
                    getLeaveNotification();
                    get_username();
                }
            }
        } catch (error) {
            if (!error.response) {
                dispatch({ type: "SERVER_ERROR" })
                toast.error(error.message)
            } else if (error.response.status === 500) {
                dispatch({ type: "SERVER_ERROR" })
            }
            if (error.response.data.message) {
                toast.error(error.response.data.message)
            }
        } finally {
            setLoading(false)
        }
    }

    // get user name
    const get_username = async () => {
        setLoading(true)
        try {
            const res = await customAxios().post('/user/username');

            if (res.data.success) {
                let user = res.data.data.map((val) => {
                    return { _id: val._id, name: val?.first_name.concat(" ", val.last_name), role: val.role }
                })
                res.data.data = user;
                dispatch({ type: "GET_USER", payload: res.data })
            }
        } catch (error) {
            if (!error.response) {
                toast.error(error.message);
            }else if (error.response.data.message) {
                toast.error(error.response.data.message);
            }
        } finally {
            setLoading(false)
        }
    };

    // get report preview
    const getReportPreview = async (month, id) => {
        setLoading(true)
        try {
            const res = await customAxios().post('/report/report-preview', { month, id });

            if (res.data.success) {
                setId(res.data.id);
                dispatch({ type: "GET_REPORT", payload: res.data })
            }
        } catch (error) {
            if (!error.response) {
                toast.error(error.message);
            }else if (error.response.data.message) {
                toast.error(error.response.data.message);
            }
        } finally {
            setLoading(false)
        }
    }

    const HandleFilter = (name) => {
        let data = name;
        dispatch({ type: "SERACH_FILTER", payload: data })
    }

    return (
        <AppProvider.Provider value={{ ...state, user_id, setuser_id, startDate, setStartDate, endDate, setendtDate, HandleFilter, get_username, getReportPreview, logoToggle, id, getLeave, setlogoToggle, setSidebarToggle, sidebarRef, sidebarToggle, getUserData, getLeaveNotification, setLoading, Loading }}>
            {children}
        </AppProvider.Provider>
    )
}

export { RouteContext, AppProvider }
