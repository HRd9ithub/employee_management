import React, { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from "framer-motion";
import { Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel } from "@mui/material";
import moment from 'moment';
import { customAxios } from '../../service/CreateApi';
import GlobalPageRedirect from '../auth_context/GlobalPageRedirect';
import Spinner from "../common/Spinner";
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';
import { calculatorBreakTime, calculatorOverTime } from '../../helper/breakAndOverTime';
import Error500 from '../error_pages/Error500';

const AttendanceComponent = () => {
    const [isLoading, setisLoading] = useState(false);
    const [records, setRecords] = useState([]);
    const [permission, setpermission] = useState("");
    const [serverError, setServerError] = useState(false);
    const [toggle, settoggle] = useState(false);
    const [id, setId] = useState("");
    const [currentData, setcurrentData] = useState("");
    const [currentDataAll, setcurrentDataAll] = useState([]);
    const [time, setTime] = useState("");
    const [overTime, setOverTime] = useState(0);
    const [breakTime, setbreakTime] = useState(0);

    let { getCommonApi } = GlobalPageRedirect();

    //get attendance
    const getAttendance = async () => {
        try {
            setisLoading(true);
            setServerError(false);
            const res = await customAxios().get('/attendance/');
            if (res.data.success) {
                const { data, permissions, currentData } = res.data;
                setRecords(data)
                setpermission(permissions);
                let temp = [];
                if (currentData.length === 0) {
                    settoggle(false);
                } else {
                    settoggle(!currentData[0].hasOwnProperty("clock_out"));
                    setId(currentData[0]._id);
                    setcurrentData(currentData[0]);

                    // activity data store
                    for (let i = 0; i < currentData.length; i++) {
                        if (currentData[i].clock_out) {
                            temp.push({
                                _id: currentData[i]._id,
                                userId: currentData[i].userId,
                                timestamp: currentData[i].timestamp,
                                time: currentData[i].clock_out,
                                title: "Punch Out Time"
                            })
                        }
                        temp.push({
                            _id: currentData[i]._id,
                            userId: currentData[i].userId,
                            timestamp: currentData[i].timestamp,
                            time: currentData[i].clock_in,
                            title: "Punch In Time"
                        })
                    }
                    setcurrentDataAll(temp);

                    // overtime get
                    const filterData = currentData.filter((val) => val.hasOwnProperty("totalHours"))
                    
                    setOverTime(calculatorOverTime(filterData));

                    // generate break time
                    if (currentData.length > 1) {
                        const ascendingData = currentData.sort(function (a, b) {
                            // Convert the date strings to Date objects
                            let dateA = new Date(a.createdAt);
                            let dateB = new Date(b.createdAt);

                            // Subtract the dates to get a value that is either negative, positive, or zero
                            return dateA - dateB;
                        });                        
                        setbreakTime(calculatorBreakTime(ascendingData));
                    }
                }
            }
        } catch (error) {
            if (!error.response) {
                setServerError(true)
                toast.error(error.message)
            } else if (error.response.status === 401) {
                getCommonApi();
            } else {
                if (error.response.status === 500) {
                    setServerError(true)
                }
                if (error.response.data.message) {
                    toast.error(error.response.data.message)
                }
            }
        } finally {
            setisLoading(false)
        }
    }

    useEffect(() => {
        getAttendance();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    // punch in and puch out click function
    const handleClick = () => {
        // cuurent time get
        const time = moment(new Date()).format("hh:mm:ss A");

        // check if punch in or punch out
        let URL = "";
        if (toggle) {
            URL = customAxios().put(`/attendance/${id}`, {
                clock_out: time
            })
        } else {
            URL = customAxios().post('/attendance/', {
                clock_in: time
            })
        }
        setisLoading(true);
        setServerError(false);
        URL.then(res => {
            if (res.data.success) {
                getAttendance();
            }
        }).catch(error => {
            setisLoading(false);
            if (!error.response) {
                toast.error(error.message);
            } else if (error.response.status === 401) {
                getCommonApi();
            } else {
                if (error.response.data.message) {
                    toast.error(error.response.data.message)
                } else {
                    // setError(error.response.data.error);
                }
            }
        })
    }

    // timer logic
    useEffect(() => {
        const intervalId = setInterval(() => {
            setTime(moment(new Date()).format("hh:mm:ss A"));
        }, 1000)

        return () => clearInterval(intervalId);
    }, [])

    if (isLoading) {
        return <Spinner />;
    } else if (serverError) {
        return <Error500 />;
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
                    <div className="background-wrapper bg-white py-4">
                        <div className=''>
                            <div className='row align-items-center row-std m-0'>
                                <div className="col-12 col-sm-5 d-flex justify-content-between align-items-center">
                                    <div>
                                        <ul id="breadcrumb" className="mb-0">
                                            <li><NavLink to="/" className="ihome">Dashboard</NavLink></li>
                                            <li><NavLink to="" className="ibeaker"><i className="fa-solid fa-play"></i> &nbsp; Attendance</NavLink></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* table */}
                        <div className="mx-4 mt-4">
                            <div className="attendance">
                                <div className="attendance-body">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="attendance-list-item p-4">
                                                <div className="attendance-header d-flex justify-content-between align-items-center flex-wrap">
                                                    <h3 className="mb-0">Attendance</h3>
                                                    <h4 className="text-gray mb-0">{moment(new Date()).format('DD MMM YYYY')}</h4>
                                                </div>
                                                <div className="bordered p-3 mt-3">
                                                    <div className="d-flex flex-wrap">
                                                        <h4 className="mb-0 mr-2 text-gray">Punch In Time:</h4>
                                                        <h4 className="mb-0 text-black">
                                                            {currentData.createdAt ? moment(currentData.createdAt).format('DD MMM YYYY hh:mm A') : <HorizontalRuleIcon />}
                                                        </h4>
                                                    </div>
                                                </div>
                                                <div className="mt-3 text-center">
                                                    <div className="clock d-flex justify-content-center align-items-center">
                                                        <h2 className="mb-0 text-center">{time}</h2>
                                                    </div>
                                                    <div className="mt-3">
                                                        <button type="submit" className="btn btn-gradient-primary" onClick={handleClick}>{toggle ? "Punch Out" : "Punch In"}</button>
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-lg-6 col-md-12 col-sm-6 mt-3">
                                                        <div className="bordered p-3">
                                                            <div className="w-100 d-flex flex-wrap">
                                                                <h4 className="mb-0 mr-2 text-gray">Break Time:</h4>
                                                                <h4 className="mb-0 text-black">{breakTime} hrs</h4>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-6 col-md-12 col-sm-6 mt-3">
                                                        <div className="bordered p-3">
                                                            <div className="w-100 d-flex flex-wrap">
                                                                <h4 className="mb-0 mr-2 text-gray">Overtime:</h4>
                                                                <h4 className="mb-0 text-black">{overTime} hrs</h4>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="attendance-list-item p-4">
                                                <div className="attendance-header d-flex justify-content-between align-items-center mb-3">
                                                    <h3 className="mb-0">Activities</h3>
                                                </div>
                                                <ul>
                                                    {currentDataAll.map((val, ind) => {
                                                        return (
                                                            <li className={`position-relative ${val.title === "Punch Out Time" && "punch-out"}`} key={ind}>
                                                                <div>
                                                                    <h5 className="mb-0">{val.title}</h5>
                                                                    <p className="text-gray mb-0">{val.time}</p>
                                                                </div>
                                                            </li>
                                                        )
                                                    })}

                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div >
                    </div >
                </div>
            </motion.div>
        </>
    )
}
export default AttendanceComponent