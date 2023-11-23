import React, { useMemo, useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from "framer-motion";
import { Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel } from "@mui/material";
import moment from 'moment';
import { customAxios } from '../../service/CreateApi';
import GlobalPageRedirect from '../auth_context/GlobalPageRedirect';
import Spinner from "../common/Spinner";
import DateRangePicker from 'react-bootstrap-daterangepicker';
import 'bootstrap-daterangepicker/daterangepicker.css';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AttendanceModal from './AttendanceModal';

const AttendanceComponent = () => {
    const [isLoading, setisLoading] = useState(false);
    const [records, setRecords] = useState([]);
    const [searchItem, setsearchItem] = useState("");
    const [permission, setpermission] = useState("");
    const [serverError, setServerError] = useState(false);
    const [toggle, settoggle] = useState(false);

    let { getCommonApi } = GlobalPageRedirect();

    //get attendance
    const getAttendance = async () => {
        try {
            setisLoading(true);
            setServerError(false);
            const res = await customAxios().get('/attendance/');
            if (res.data.success) {
                setRecords(res.data.data)
                setpermission(res.data.permissions)
                settoggle(res.data.toggle)
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
    }, []);


    // punch in and puch out click function
    const handleClick = () => {
        // cuurent time get
        const today = new Date();
        const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

        // check if punch in or punch out
        let URL = "";
        if (toggle) {
            URL = customAxios().put(`/attendance/${1}`)
        } else {
            URL = customAxios().post('/attendance/', {
                login_time: time
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

    if (isLoading) {
        return <Spinner />
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
                        <div className="mx-4 mt-4">
                            <div className="attendance">
                                <div className="attendance-body">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="attendance-list-item p-4">
                                                <div className="attendance-header d-flex justify-content-between align-items-center flex-wrap">
                                                    <h3 className="mb-0">Attendance</h3>
                                                    <h4 className="text-gray mb-0">{new Date().toDateString()}</h4>
                                                </div>
                                                <div className="bordered p-3 mt-3">
                                                    <div className="d-flex flex-wrap">
                                                        <h4 className="mb-0 mr-2 text-gray">Punch In Time:</h4>
                                                        <h4 className="mb-0 text-black">Wed, 11th Mar 2023 10.00 AM</h4>
                                                    </div>
                                                </div>
                                                <div className="mt-3 text-center">
                                                    <div className="clock d-flex justify-content-center align-items-center">
                                                        <h2 className="mb-0 text-center">6.20 hrs</h2>
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
                                                                <h4 className="mb-0 text-black">1.22 hrs</h4>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-6 col-md-12 col-sm-6 mt-3">
                                                        <div className="bordered p-3">
                                                            <div className="w-100 d-flex flex-wrap">
                                                                <h4 className="mb-0 mr-2 text-gray">Overtime:</h4>
                                                                <h4 className="mb-0 text-black">3.10 hrs</h4>
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
                                                    <li className="position-relative">
                                                        <div>
                                                            <h5 className="mb-0">Punch In Time</h5>
                                                            <p className="text-gray mb-0">10:00 AM</p>
                                                        </div>
                                                    </li>
                                                    <li className="position-relative">
                                                        <div>
                                                            <h5 className="mb-0">Punch In Time</h5>
                                                            <p className="text-gray mb-0">10:00 AM</p>
                                                        </div>
                                                    </li>
                                                    <li className="position-relative">
                                                        <div>
                                                            <h5 className="mb-0">Punch In Time</h5>
                                                            <p className="text-gray mb-0">10:00 AM</p>
                                                        </div>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div >
                    </div >
                    {/* table */}
                    <div className="background-wrapper bg-white py-4 mt-4">
                        <div className="mx-4">
                            <div className="row align-items-center">
                                <div className="col-md-8">
                                    <h5 className="mb-0">11/23/2023 - 11/23/2023</h5>
                                </div>
                                <div className="col-md-4 ml-auto">
                                    <div className="form-group mb-0 position-relative">
                                        <DateRangePicker>
                                            <input className="form-control mb-0" />
                                        </DateRangePicker>
                                        <CalendarMonthIcon className="range_icon" />
                                    </div>
                                </div>
                            </div>
                            <TableContainer >
                                <Table className="common-table-section">
                                    <TableHead className="common-header">
                                        <TableRow>
                                            <TableCell>
                                                <TableSortLabel>
                                                    Date
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell>
                                                <TableSortLabel>
                                                    Clock In
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell>
                                                <TableSortLabel>
                                                    Clock Out
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell>
                                                <TableSortLabel>
                                                    Total Hours
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell>
                                                Action
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>
                                                23 Nov, 2023
                                            </TableCell>
                                            <TableCell>
                                                9:30 AM
                                            </TableCell>
                                            <TableCell>
                                                1:00 PM
                                            </TableCell>
                                            <TableCell>
                                                3.30 Hrs
                                            </TableCell>
                                            <TableCell>
                                                <div className='action'>
                                                    <AttendanceModal/>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </div >
                    </div >
                </div>
            </motion.div>
        </>
    )
}
export default AttendanceComponent