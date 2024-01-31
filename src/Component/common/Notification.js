import React, { useContext, useState } from 'react'
import { Dropdown } from 'react-bootstrap'
import { AppProvider } from '../context/RouteContext';
import { timeAgo } from '../../helper/dateFormat';
import { HiOutlineMinus } from 'react-icons/hi';
import { customAxios } from '../../service/CreateApi';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Spinner from './Spinner';

const Notification = () => {

    const { notification, getLeaveNotification, setStartDate, setendtDate, setuser_id, getLeave } = useContext(AppProvider);
    // page redirect
    const history = useNavigate();
    const { pathname } = useLocation();
    const [isLoading, setisLoading] = useState(false);

    // status change
    const notificationStatusChange = async (item) => {
        const { date, _id, status } = item;
        if (status === "Pending" || (item.deleteAt &&  item.isNotificationStatus)) {
            if (date) {
                try {
                    setisLoading(true);
                    const res = await customAxios().put(`/report_request/${_id}`, { status: "Read" })
                    if (res.data.success) {
                        setisLoading(false);
                        getLeaveNotification();
                        localStorage.setItem("filter", JSON.stringify({ date, id: item.userId }));
                        localStorage.setItem("data", JSON.stringify(item))
                        history('/work-report')
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
                            getLeaveNotification();
                            history(`/attendance/${item.attendanceId}`)
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
                        const res = await customAxios().patch(`/leave/${_id}`, { status: item.deleteAt ? status :"Read" })
                        if (res.data.success) {
                            setisLoading(false);
                            if (pathname === "/leaves") {
                                getLeave(new Date(item.from_date), new Date(item.to_date), item.user_id);
                            } else {
                                history('/leaves')
                            }
                        }
                    } catch (error) {
                        setisLoading(false)
                        if (!error.response) {
                            toast.error(error.message)
                        } else if (error.response.data.message) {
                            toast.error(error.response.data.message)
                        }
                    };
                    setendtDate(new Date(item.to_date))
                    setStartDate(new Date(item.from_date))
                    setuser_id(item.user_id)
                }
            }
        } else {
            if (date) {
                localStorage.setItem("filter", JSON.stringify({ date, id: item.userId }));
                localStorage.setItem("data", JSON.stringify(item))
                history('/work-report')
            } else {
                if (item.attendanceId) {
                    history(`/attendance/${item.attendanceId}`)
                } else {
                    if (pathname === "/leaves") {
                        getLeave(new Date(item.from_date), new Date(item.to_date), item.user_id);
                    } else {
                        history('/leaves')
                    }
                    setendtDate(new Date(item.to_date))
                    setStartDate(new Date(item.from_date))
                    setuser_id(item.user_id);
                }
            }

        }
    }

    // notification delete
    const notificationDelete = async (e, item) => {
        if (e && e.stopPropagation) e.stopPropagation();
        try {
            setisLoading(true);
            const res = await customAxios().post(`/leave/status?id=${item._id}&report=${item.date ? item.date : ""}&attendance=${item.attendanceId ? item.attendanceId : ""}`);
            if (res.data.success) {
                getLeaveNotification();
                setisLoading(false)
            }  
        } catch (error) {
            setisLoading(false)
            if (!error.response) {
                toast.error(error.message)
            } else if (error.response.data.message) {
                toast.error(error.response.data.message)
            }
        }
    }


    return (
        <>
            <li className="nav-item">
                <Dropdown alignRight>
                    <Dropdown.Toggle className="nav-link count-indicator new-notification">
                        <i className={`fa-solid fa-bell nav-icons ${notification.length === 0 && "mr-2"}`}></i>
                        {notification.filter((val) => val.status === "Pending" || val.isNotificationStatus).length !== 0 && <span className="badge badge-light">{notification.filter((val) => val.status === "Pending" || val.isNotificationStatus).length}</span>}
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="dropdown-menu navbar-dropdown preview-list px-2" style={{ width: "26rem" }} >
                        <h6 className="px-1 py-3 mb-0 new-message">Notifications</h6>
                        <div className="dropdown-divider"></div>
                        <div className="notification-list">
                            {notification.map((item) => {
                                return (
                                    <Dropdown.Item className={`notification-item ${item.status === "Pending" || item.isNotificationStatus ? "new-notification" : ""}`} key={item._id} onClick={() => notificationStatusChange(item)}>
                                        <div className={`notification-content d-flex justify-content-start align-items-start w-100`}>
                                            <div>
                                                <div className="notification-image">
                                                    {item.user.profile_image &&
                                                        <img src={`${item.user.profile_image && process.env.REACT_APP_IMAGE_API}/${item.user.profile_image}`} alt="img" />}
                                                </div>
                                            </div>
                                            <div className="notification-details w-100">
                                                <div className="w-100 d-flex justify-content-between align-items-center">
                                                    <p className='mb-0'>{item.user ? item.user.first_name?.concat(" ", item.user?.last_name) : <HiOutlineMinus />}</p>
                                                    <i className="fa-solid fa-xmark" onClick={(e) => notificationDelete(e, item)}></i>
                                                </div>
                                                <p className='mt-1 mb-0 ellipsis text-dark-secondary'>{item.deleteAt ? timeAgo(item.createdAt) + " - Leave Cancelled" : item.title ? timeAgo(item.createdAt) + "  -  " + item.title : item.leaveType ? timeAgo(item.createdAt) + " - " + item.leaveType + " Request" : timeAgo(item.createdAt) + " - Attendance Regularize"}</p>
                                            </div>
                                        </div>
                                    </Dropdown.Item>
                                )
                            })}
                            {notification.length === 0 && <div className="notification-item-no-record">
                                <h5 className='text-center my-3 text-dark-secondary'>No Record Found</h5>
                            </div>}
                        </div>
                    </Dropdown.Menu>
                </Dropdown>
            </li>
            {isLoading && <Spinner />}
        </>
    )
}

export default Notification
