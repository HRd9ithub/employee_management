import React, { useEffect, useState } from 'react';
import { motion } from "framer-motion";
import { customAxios } from '../../service/CreateApi';
import toast from 'react-hot-toast';
import GlobalPageRedirect from '../auth_context/GlobalPageRedirect';
import Spinner from '../common/Spinner';
import { NavLink, useNavigate } from 'react-router-dom';
import { timeAgos } from '../../helper/dateFormat';
import Error500 from '../error_pages/Error500';
import Error403 from '../error_pages/Error403';
import DateRangePicker from 'react-bootstrap-daterangepicker';
import 'bootstrap-daterangepicker/daterangepicker.css';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import moment from 'moment';
import ranges from '../../helper/calcendarOption';

const ActivityComponent = () => {
    let date_today = new Date();
    // initialstate 
    const [isLoading, setisLoading] = useState(false);
    const [records, setRecords] = useState([]);
    const [permission, setpermission] = useState("");
    const [serverError, setServerError] = useState(false);
    const [startDate, setStartDate] = useState(moment(date_today).subtract(1, "day"));
    const [endDate, setendtDate] = useState(moment(date_today).subtract(1, "day"));

    let { getCommonApi } = GlobalPageRedirect();
    // page redirect
    let navigate = useNavigate();

    //* get data for Backend
    const getActivity = async (start, end) => {
        setisLoading(true);
        setServerError(false);
        customAxios().get(`/activity?startDate=${moment(start || startDate).format("YYYY-MM-DD")}&endDate=${moment(end || endDate).format("YYYY-MM-DD")}`).then((res) => {
            let { success, data, permissions } = res.data;
            if (success) {
                setpermission(permissions);
                setRecords(data);
                setisLoading(false);
            }
        }).catch((error) => {
            setisLoading(false);
            if (!error.response) {
                setServerError(true)
                toast.error(error.message)
            } else {
                if (error.response.status === 401) {
                    getCommonApi();
                } else {
                    if (error.response.status === 500) {
                        setServerError(true)
                    }
                    if (error.response.data.message) {
                        toast.error(error.response.data.message)
                    }
                }
            }
        })
    }

    useEffect(() => {
        getActivity();
        // eslint-disable-next-line
    }, [])

    const handleCallback = (start, end, label) => {
        setStartDate(start._d)
        setendtDate(end._d);
        getActivity(start._d, end._d)
    }

    if (isLoading) {
        return <Spinner />;
    } else if (serverError) {
        return <Error500 />;
    } else if (!permission|| permission.permissions.list !== 1) {
        return <Error403 />;
    }

    return (
        <>
            <motion.div
                className="box"
                initial={{ opacity: 0, transform: 'translateY(-20px)' }}
                animate={{ opacity: 1, transform: 'translateY(0px)' }}
                transition={{ duration: 0.5 }}
            >
                <div className=" container-fluid pt-4">
                    <div className="background-wrapper bg-white pt-4">
                        <div className='row justify-content-end align-items-center row-std m-0'>
                            <div className="col-12 col-sm-5 col-xl-3 d-flex justify-content-between align-items-center">
                                <div>
                                    <ul id="breadcrumb" className="mb-0">
                                        <li><NavLink to="/" className="ihome">Dashboard</NavLink></li>
                                        <li><NavLink to="" className="ibeaker"><i className="fa-solid fa-play"></i> &nbsp; Activity Logs</NavLink></li>
                                    </ul>
                                </div>
                            </div>
                            <div className="col-12 col-sm-7 col-xl-9 d-flex justify-content-end" id="two">
                                <div className="form-group mb-0 position-relative w-25 activity-date-range">
                                    <div className="form-group mb-0 position-relative">
                                        <DateRangePicker initialSettings={{ startDate: startDate, endDate: endDate, ranges: ranges, maxDate: new Date() }} onCallback={handleCallback} >
                                            <input className="form-control mb-0" />
                                        </DateRangePicker>
                                        <CalendarMonthIcon className="range_icon" />
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 activity-col-box">
                                <div className="activity">
                                    <div className="activity-box">
                                        <ul className="activity-list">
                                            {records.map((item) => {
                                                return (<li key={item._id}>
                                                    <div className="activity-user" onClick={() => navigate("/employees/view/" + item.user_id)}>
                                                        {item.User.profile_image &&
                                                            <img src={`${item.User.profile_image && process.env.REACT_APP_IMAGE_API}/${item.User.profile_image}`} alt="img" className='w-100' />}
                                                    </div>
                                                    <div className="activity-content">
                                                        <div className="timeline-content">
                                                            <p>{item.title}
                                                                <strong className='pl-1'>{item.User?.first_name.concat(" ", item.User?.last_name)}</strong>
                                                            </p>
                                                            <span className="time">{timeAgos(item.createdAt)} ago</span>
                                                        </div>
                                                    </div>
                                                </li>)
                                            })}
                                            {records.length === 0 && <div className='text-center my-4 text-muted'><h4>No Records Found</h4></div>}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </>
    )
}

export default ActivityComponent