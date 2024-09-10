import React, { useContext, useEffect, useState } from 'react';
import { motion } from "framer-motion";
import toast from 'react-hot-toast';
import { NavLink, useNavigate } from 'react-router-dom';
import { customAxios } from '../service/CreateApi';
import Spinner from './common/Spinner';
import { timeAgos } from '../helper/dateFormat';
import Error500 from './error_pages/Error500';
import Error403 from './error_pages/Error403';
import { HiOutlineMinus } from 'react-icons/hi';
import { AppProvider } from './context/RouteContext';

const NotificationPage = () => {
    // initialstate 
    const [isLoading, setisLoading] = useState(false);
    const [records, setRecords] = useState([]);
    const [permission, setpermission] = useState("");
    const [serverError, setServerError] = useState(false);
    const [permissionToggle, setPermissionToggle] = useState(true);

    const { setStartDate, setendtDate, setuser_id } = useContext(AppProvider);

    // page redirect
    let navigate = useNavigate();

    //* get data for Backend
    const getAllNotification = async () => {
        setisLoading(true);
        setPermissionToggle(true);
        setServerError(false);
        customAxios().post("/leave/notification/all").then((res) => {
            let { success, notification, permissions } = res.data;
            if (success) {
                setpermission(permissions);
                setRecords(notification);
                setisLoading(false);
            }
        }).catch((error) => {
            setisLoading(false);
            if (!error.response) {
                setServerError(true)
                toast.error(error.message)
            } else {
                if (error.response.status === 500) {
                    setServerError(true)
                }
                if (error.response.data.message) {
                    toast.error(error.response.data.message)
                    setpermission(error.response.data.permissions);
                }
            }
        }).finally(() => setPermissionToggle(false));
    }

    useEffect(() => {
        getAllNotification();
        // eslint-disable-next-line
    }, []);

    // status change
    const notificationStatusChange = async (item) => {
        const { date, _id, status } = item;
        if (status === "Pending" || (item.deleteAt && item.isNotificationStatus)) {
            if (date) {
                try {
                    setisLoading(true);
                    const res = await customAxios().put(`/report_request/${_id}`, { status: "Read" })
                    if (res.data.success) {
                        setisLoading(false);
                        getAllNotification();
                        localStorage.setItem("filter", JSON.stringify({ date, id: item.userId }));
                        localStorage.setItem("data", JSON.stringify(item))
                        navigate('/work-report/employee')
                    }
                } catch (error) {
                    setisLoading(false)
                    if (!error.response) {
                        toast.error(error.message)
                    } else if (error.response.data.message) {
                        toast.error(error.response.data.message)
                    }
                }
            } else {
                if (item.attendanceId) {
                    try {
                        setisLoading(true);
                        const res = await customAxios().patch(`/attendance/${_id}`)
                        if (res.data.success) {
                            setisLoading(false);
                            getAllNotification();
                            navigate(`/attendance/${item.attendanceId}`)
                        }
                    } catch (error) {
                        setisLoading(false)
                        if (!error.response) {
                            toast.error(error.message)
                        } else if (error.response.data.message) {
                            toast.error(error.response.data.message)
                        }
                    };
                } else {
                    try {
                        setisLoading(true);
                        const res = await customAxios().patch(`/leave/${_id}`, { status: item.deleteAt ? status : "Read" })
                        if (res.data.success) {
                            setisLoading(false);
                            navigate('/leaves')
                            setStartDate(new Date(item.from_date))
                            setendtDate(new Date(item.to_date))
                            setuser_id(item.user_id);
                        }
                    } catch (error) {
                        setisLoading(false)
                        if (!error.response) {
                            toast.error(error.message)
                        } else if (error.response.data.message) {
                            toast.error(error.response.data.message)
                        }
                    };

                }
            }
        } else {
            if (date) {
                localStorage.setItem("filter", JSON.stringify({ date, id: item.userId }));
                localStorage.setItem("data", JSON.stringify(item))
                navigate('/work-report/employee')
            } else {
                if (item.attendanceId) {
                    navigate(`/attendance/${item.attendanceId}`)
                } else {
                    navigate('/leaves')
                    setStartDate(new Date(item.from_date))
                    setendtDate(new Date(item.to_date))
                    setuser_id(item.user_id)
                }
            }

        }
    }

    if (isLoading) {
        return <Spinner />;
    } else if (serverError) {
        return <Error500 />;
    } else if ((!permission || permission.permissions.list !== 1) && !permissionToggle) {
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
                <div className="container-fluid py-4">
                    <div className="background-wrapper bg-white pb-4">
                        <div className='row align-items-center row-std m-0'>
                            <div className="col-12 col-sm-5 col-xl-3 d-flex justify-content-between align-items-center">
                                <div>
                                    <ul id="breadcrumb" className="mb-0">
                                        <li><NavLink to="/" className="ihome">Dashboard</NavLink></li>
                                        <li><NavLink to="" className="ibeaker"><i className="fa-solid fa-play"></i> &nbsp; Notification</NavLink></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="m-4">
                            <div className="activity">
                                <div className="activity-box">
                                    <ul className="activity-list">
                                        {records.map((item) => {
                                            return (
                                                <li key={item._id} onClick={() => notificationStatusChange(item)} className={(!item.deleteAt && item.status === "Pending") || item.isNotificationStatus ? "new-notification notification-list-card" : "notification-list-card"}>
                                                    <div className="activity-user" onClick={() => navigate("/employees/view/" + item.user_id)}>
                                                        {item.user.profile_image &&
                                                            <img src={`${item.user.profile_image && process.env.REACT_APP_IMAGE_API}/${item.user.profile_image}`} alt="img" className='w-100' />}
                                                    </div>
                                                    <div className="activity-content">
                                                        <div className="timeline-content">
                                                            <p className='mb-0'>{item.user ? item.user.first_name?.concat(" ", item.user?.last_name) : <HiOutlineMinus />}</p>
                                                            <p className='mt-1 mb-0 ellipsis text-dark-secondary'>{item.deleteAt ? timeAgos(item.createdAt) + " - Leave Cancelled" : item.title ? timeAgos(item.createdAt) + "  -  " + item.title : item.leaveType ? timeAgos(item.createdAt) + " - " + item.leaveType + " Request" : timeAgos(item.createdAt) + " - Attendance Regularize"}</p>

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
            </motion.div>
        </>
    )
}

export default NotificationPage