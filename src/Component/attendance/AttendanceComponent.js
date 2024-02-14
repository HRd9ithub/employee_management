import React, { useState, useEffect, useCallback, useContext } from 'react'
import { NavLink } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from "framer-motion";
import { Table, TableBody, TableCell, TableContainer, TableHead, Collapse, TablePagination, IconButton, TableRow, TableSortLabel } from "@mui/material";
import moment from 'moment';
import { customAxios } from '../../service/CreateApi';
import Spinner from "../common/Spinner";
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';
import { calculatorBreakTime, calculatorOverTime, sum } from '../../helper/breakAndOverTime';
import Error500 from '../error_pages/Error500';
import DateRangePicker from 'react-bootstrap-daterangepicker';
import 'bootstrap-daterangepicker/daterangepicker.css';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AttendanceModal from './AttendanceModal';
import ranges from '../../helper/calcendarOption';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Error403 from '../error_pages/Error403';
import { AppProvider } from '../context/RouteContext';

const AttendanceComponent = () => {
    const [isLoading, setisLoading] = useState(false);
    const [records, setRecords] = useState([]);
    const [permission, setpermission] = useState("");
    const [permissionToggle, setPermissionToggle] = useState(true);
    const [serverError, setServerError] = useState(false);
    const [toggle, settoggle] = useState(false);
    const [id, setId] = useState("");
    const [currentData, setcurrentData] = useState("");
    const [currentDataAll, setcurrentDataAll] = useState([]);
    const [time, setTime] = useState("");
    const [overTime, setOverTime] = useState(0);
    const [breakTime, setbreakTime] = useState(0);
    const [startDate, setStartDate] = useState(moment().clone().startOf('month'));
    const [endDate, setendtDate] = useState(moment(new Date(new Date().toDateString())));
    const [open, setOpen] = useState("");
    const [user_id, setuser_id] = useState("");

    // pagination state
    const [count, setCount] = useState(5)
    const [page, setpage] = useState(0)

    // sort state
    const [order, setOrder] = useState("asc")
    const [orderBy, setOrderBy] = useState("date");

    let { get_username, userName } = useContext(AppProvider);

    //get attendance
    const getAttendance = async (id,start, end) => {
        try {
            setisLoading(true);
            setPermissionToggle(true);
            setServerError(false);
            const res = await customAxios().get(`/attendance/?startDate=${start || startDate}&endDate=${end || endDate}&id=${id || user_id}`);
            if (res.data.success) {
                const { data, permissions, currentData } = res.data;
                setRecords(data)
                setpermission(permissions);
                let temp = [];
                if (currentData.length === 0) {
                    settoggle(false);
                } else {
                    settoggle(currentData[0].time[currentData[0].time.length - 1].clock_out ? false : true);
                    setId(currentData[0].time[currentData[0].time.length - 1]._id);
                    setcurrentData(currentData[0]);

                    // activity data store
                    for (let i = 0; i < currentData[0].time.length; i++) {
                        temp.unshift({
                            _id: currentData[0].time[i]._id,
                            // userId: currentData[0].time[i].userId,
                            // timestamp: currentData[0].time[i].timestamp,
                            time: currentData[0].time[i].clock_in,
                            title: "Punch In Time"
                        })
                        if (currentData[0].time[i].clock_out) {
                            temp.unshift({
                                _id: currentData[0].time[i]._id,
                                // userId: currentData[0].time[i].userId,
                                // timestamp: currentData[0].time[i].timestamp,
                                time: currentData[0].time[i].clock_out,
                                title: "Punch Out Time"
                            })
                        }
                    }
                    setcurrentDataAll(temp);

                    // overtime get
                    if (currentData[0].time.filter((item) => item.hasOwnProperty("totalHours")).length >= 1) {
                        setOverTime(calculatorOverTime(currentData[0].time));
                    }

                    // generate break time
                    if (currentData[0].time.length > 1) {
                        setbreakTime(calculatorBreakTime(currentData[0].time));
                    }
                }
            }
        } catch (error) {
            if (!error.response) {
                setServerError(true)
                toast.error(error.message)
            } else {
                if (error.response.status === 500) {
                    setServerError(true)
                }
                if (error.response.data.message) {
                    toast.error(error.response.data.message)
                }
            }
        } finally {
            setisLoading(false);
            setPermissionToggle(false);
        }
    }

    useEffect(() => {
        getAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[startDate,endDate,user_id])

    useEffect(() => {
        get_username();
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
                setServerError(true)
                toast.error(error.message)
            } else {
                if (error.response.status === 500) {
                    setServerError(true)
                }
                if (error.response.data.message) {
                    toast.error(error.response.data.message)
                }
            }
        })
    }

    // timer logic
    useEffect(() => {
        if(permission && permission?.name?.toLowerCase() !== "admin"){
            const intervalId = setInterval(() => {
                setTime(moment(new Date()).format("hh:mm:ss A"));
            }, 1000)
    
            return () => clearInterval(intervalId);
        }
    }, [permission]);

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
        if (orderBy === "user") {
            if (b[orderBy]["name"] < a[orderBy]["name"]) {
                return -1
            }
            if (b[orderBy]["name"] > a[orderBy]["name"]) {
                return 1
            }
            return 0
        } else if (orderBy === "date") {
            if (b._id.date < a._id.date) {
                return -1
            }
            if (b._id.date > a._id.date) {
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
    }
    
    // user onchange
    const userOnChange = (event) => {
        setuser_id(event.target.value)
    }

    // Collapse onchange
    const handleCollapse = useCallback((id) => {
        if (open === id) {
            setOpen("");
        } else {
            setOpen(id);
        }
    }, [open]);

    // 9:30 hours check function
    const hoursCheck = useCallback((data) => {
        if(data && data.split(":")[0] < "09"){
            return "true"
        }else if(data && data.split(":")[0] <= "09" && data.split(":")[1] < "30"){
            return "true"
        }
    }, [])

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
                <div className=" container-fluid py-4">
                    <div className="background-wrapper bg-white pb-4">
                        <div>
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
                                                        <h3>Attendance</h3>
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
                                                    <div className="attendance-header d-flex justify-content-between align-items-center">
                                                        <h3 className="mb-0">Activities</h3>
                                                    </div>
                                                    <ul className="mt-4 mb-0">
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
                                <div className="col-12 col-md-5 col-xl-3 d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">{moment(startDate).format("DD MMM YYYY").toString().concat(" - ", moment(endDate).format("DD MMM YYYY"))}</h5>
                                </div>
                                <div className="col-12 col-md-7 col-xl-9" id="two">
                                    <div className="row justify-content-end">
                                        <div className="col-sm-6 col-xl-4 mt-2">
                                            {permission && permission.name.toLowerCase() === "admin" &&
                                                <div className="search-full pr-0">
                                                    <div className="form-group mb-0">
                                                        <select className="form-control mb-0" id="employee" name='user_id' value={user_id} onChange={userOnChange}>
                                                            <option value="">All</option>
                                                            {userName.map((val) => {
                                                                return (
                                                                    val?.role?.toLowerCase() !== "admin" && <option key={val._id} value={val._id}>{val.name}</option>
                                                                )
                                                            })}
                                                        </select>
                                                    </div>
                                                </div>}
                                        </div>
                                        <div className="col-sm-6 col-xl-4 my-2">
                                            <div className="form-group mb-0 position-relative">
                                                <div className="form-group mb-0 position-relative">
                                                    <DateRangePicker initialSettings={{ startDate: startDate, endDate: endDate, ranges: ranges, maxDate: new Date() }} onCallback={handleCallback} ><input className="form-control mb-0" /></DateRangePicker>
                                                    <CalendarMonthIcon className="range_icon" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <TableContainer >
                                <Table className="common-table-section expanted-table">
                                    <TableHead className="common-header">
                                        <TableRow>
                                            <TableCell style={{ width: "10px", padding: "16px 0" }} />
                                            <TableCell>
                                                <TableSortLabel active={orderBy === "user"} direction={orderBy === "user" ? order : "asc"} onClick={() => handleRequestSort("user")}>
                                                    Employee
                                                </TableSortLabel>
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {records.length !== 0 ? sortRowInformation(records, getComparator(order, orderBy)).slice(count * page, count * page + count).map((val, ind) => {
                                            return (
                                                <React.Fragment key={ind}>
                                                    <TableRow>
                                                        <TableCell style={{ width: "10px", padding: "16px 0" }}>
                                                            <IconButton
                                                                aria-label="expand row"
                                                                size="small"
                                                                onClick={() => handleCollapse(val._id)}
                                                            >
                                                                {open === val._id ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                                            </IconButton>
                                                        </TableCell>
                                                        <TableCell>{val.user.name}</TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell colSpan={8} style={{ padding: 0, background: '#f2f2f287', borderBottom: "none" }}>
                                                            <Collapse in={open === val._id} timeout="auto" unmountOnExit>
                                                                <Table size="small" aria-label="purchases">
                                                                    <TableHead className="common-header">
                                                                        <TableRow>
                                                                            <TableCell>Date</TableCell>
                                                                            <TableCell>Clock In</TableCell>
                                                                            <TableCell>Clock Out</TableCell>
                                                                            <TableCell>Total Hours</TableCell>
                                                                            <TableCell>Break Time</TableCell>
                                                                            <TableCell>Action</TableCell>
                                                                        </TableRow>
                                                                    </TableHead>
                                                                    <TableBody>
                                                                        {val.child.map((elem, id) => {
                                                                            return (
                                                                                <React.Fragment key={elem._id}>
                                                                                    <TableRow>
                                                                                        <TableCell scope="row" className={hoursCheck(sum(val.child[id].time)) ? "text-red" : ""}>{moment(elem.timestamp).format("DD MMM YYYY")}</TableCell>
                                                                                        <TableCell>
                                                                                            <div>
                                                                                                {val.child[id].time.map((elem, id) => {
                                                                                                    return <div className='my-1' key={id}>{elem.clock_in ? elem.clock_in : <HorizontalRuleIcon />}</div>
                                                                                                })}
                                                                                            </div>
                                                                                        </TableCell>
                                                                                        <TableCell>
                                                                                            <div>
                                                                                                {val.child[id].time.map((elem, id) => {
                                                                                                    return <div className='my-1' key={id}>{elem.clock_out ? elem.clock_out : <HorizontalRuleIcon />}</div>
                                                                                                })}
                                                                                            </div>
                                                                                        </TableCell>
                                                                                        <TableCell scope="row">{sum(val.child[id].time)}</TableCell>
                                                                                        <TableCell scope="row">{calculatorBreakTime(val.child[id].time)}</TableCell>
                                                                                        <TableCell>
                                                                                            {hoursCheck(sum(val.child[id].time)) ?
                                                                                                <div className='action'>
                                                                                                    <AttendanceModal data={val.child[id].time.find((elem, ind) => {
                                                                                                        return ind === (val.child[id].time.length - 1);
                                                                                                    })} permission={permission} attendance_regulations_data={elem.attendance_regulations_data} timestamp={elem.timestamp} />
                                                                                                </div> :  
                                                                                                <div className="action">
                                                                                                    <HorizontalRuleIcon />
                                                                                                </div>}
                                                                                        </TableCell>
                                                                                    </TableRow>
                                                                                </React.Fragment>
                                                                            )
                                                                        })}
                                                                    </TableBody>
                                                                </Table>
                                                            </Collapse>
                                                        </TableCell>
                                                    </TableRow>

                                                </React.Fragment>
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