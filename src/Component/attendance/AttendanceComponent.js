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
import DateRangePicker from 'react-bootstrap-daterangepicker';
import 'bootstrap-daterangepicker/daterangepicker.css';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AttendanceModal from './AttendanceModal';
import ranges from '../../helper/calcendarOption';

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
    const [startDate, setStartDate] = useState(moment(new Date(new Date().toDateString())).subtract(1, "day"));
    const [endDate, setendtDate] = useState(moment(new Date(new Date().toDateString())).subtract(1, "day"));

    // pagination state
    const [count, setCount] = useState(5)
    const [page, setpage] = useState(0)

    // sort state
    const [order, setOrder] = useState("asc")
    const [orderBy, setOrderBy] = useState("date")

    let { getCommonApi } = GlobalPageRedirect();

    //get attendance
    const getAttendance = async (start, end) => {
        try {
            setisLoading(true);
            setServerError(false);
            const res = await customAxios().get(`/attendance/?startDate=${start || startDate}&endDate=${end || endDate}`);
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
    }, []);

    // pagination function
    const onChangePage = (e, page) => {
        setpage(page)
    }

    const onChangeRowsPerPage = (e) => {
        setCount(e.target.value)
    }


    // sort function
    const handleRequestSort = (name) => {
        const isAsc = (orderBy === name && order === "asc");

        setOrderBy(name)
        setOrder(isAsc ? "desc" : "asc")
    }

    const descedingComparator = (a, b, orderBy) => {
        if(orderBy === "user"){
            if (b[orderBy]["name"] < a[orderBy]["name"]) {
                return -1
            }
            if (b[orderBy]["name"] > a[orderBy]["name"]) {
                return 1
            }
            return 0
        }else{
            if (b[orderBy] < a[orderBy]) {
                return -1
            }
            if (b[orderBy] > a[orderBy]) {
                return 1
            }
            return 0
        }
    }

    const getComparator = (order, orderBy) => {
        return order === "desc" ? (a, b) => descedingComparator(a, b, orderBy) : (a, b) => -descedingComparator(a, b, orderBy)
    }

    const sortRowInformation = (array, comparator) => {
        const rowArray = array.map((elem, ind) => [elem, ind])

        rowArray.sort((a, b) => {
            const order = comparator(a[0], b[0])
            if (order !== 0) return order
            return a[1] - b[1]
        })
        return rowArray.map((el) => el[0])
    }

    // date range change function
    const handleCallback = (start, end, label) => {
        setStartDate(start._d)
        setendtDate(end._d);
        getAttendance(start._d, end._d)
    }

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
                <div className=" container-fluid py-4">
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
                        {permission && permission.name.toLowerCase() !== "admin" &&
                            <div className="mx-4 my-4">
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
                        }
                        {/* table */}
                        <div className="mx-4 pt-4">
                            <div className="row align-items-center">
                                <div className="col-md-8">
                                    <h5 className="mb-0">{moment(startDate).format("DD MMM YYYY").toString().concat(" - ", moment(endDate).format("DD MMM YYYY"))}</h5>
                                </div>
                                <div className="col-md-4 ml-auto">
                                    <div className="form-group mb-0 position-relative">
                                        <DateRangePicker initialSettings={{ startDate: startDate, endDate: endDate, ranges: ranges, maxDate: new Date() }} onCallback={handleCallback}>
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
                                            {permission && permission.name.toLowerCase() === "admin" &&
                                                <TableCell>
                                                    <TableSortLabel active={orderBy === "user"} direction={orderBy === "user" ? order : "asc"} onClick={() => handleRequestSort("user")}>
                                                        Employee
                                                    </TableSortLabel>
                                                </TableCell>}
                                            <TableCell>
                                                <TableSortLabel active={orderBy === "date"} direction={orderBy === "date" ? order : "asc"} onClick={() => handleRequestSort("date")}>
                                                    Date
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell>
                                                <TableSortLabel active={orderBy === "clock_in"} direction={orderBy === "clock_in" ? order : "asc"} onClick={() => handleRequestSort("clock_in")}>
                                                    Clock In
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell>
                                                <TableSortLabel active={orderBy === "clock_out"} direction={orderBy === "clock_out" ? order : "asc"} onClick={() => handleRequestSort("clock_out")}>
                                                    Clock Out
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell>
                                                <TableSortLabel active={orderBy === "totalHours"} direction={orderBy === "totalHours" ? order : "asc"} onClick={() => handleRequestSort("totalHours")}>
                                                    Total Hours
                                                </TableSortLabel>
                                            </TableCell>
                                            {permission && permission.name.toLowerCase() !== "admin" && 
                                                <TableCell>
                                                    Action
                                                </TableCell>
                                            }
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {records.length !== 0 ? sortRowInformation(records, getComparator(order, orderBy)).slice(count * page, count * page + count).map((val, ind) => {
                                            return (
                                                <TableRow key={val._id}>
                                                    {permission && permission.name.toLowerCase() === "admin" && <TableCell>{val.user.name}</TableCell>}
                                                    <TableCell>{moment(val.timestamp).format("DD MMM YYYY")}</TableCell>
                                                    <TableCell>{val.clock_in}</TableCell>
                                                    <TableCell>{val.clock_out ? val.clock_out : <HorizontalRuleIcon />}</TableCell>
                                                    <TableCell>{val.totalHours ? val.totalHours : <HorizontalRuleIcon />}</TableCell>
                                                    {permission && permission.name.toLowerCase() !== "admin" && 
                                                        <TableCell>
                                                            <div className='action'>
                                                                <AttendanceModal data={val}/>
                                                            </div>
                                                        </TableCell>
                                                    }
                                                </TableRow>
                                            )
                                        }) :
                                            <TableRow>
                                                <TableCell colSpan={6} align="center">
                                                    No Records Found
                                                </TableCell>
                                            </TableRow>
                                        }
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TablePagination rowsPerPageOptions={[5, 10, 15, 25, 50, 100]}
                                component="div"
                                onPageChange={onChangePage}
                                onRowsPerPageChange={onChangeRowsPerPage}
                                rowsPerPage={count}
                                count={records.length}
                                page={page}>
                            </TablePagination>
                        </div >
                    </div >
                </div>
            </motion.div>
        </>
    )
}
export default AttendanceComponent