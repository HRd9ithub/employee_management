import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { HiOutlineMinus } from "react-icons/hi";
import Spinners from "../common/Spinner";
import GlobalPageRedirect from "../auth_context/GlobalPageRedirect";
import { GetLocalStorage } from "../../service/StoreLocalStorage";
import { AiOutlineDownload } from "react-icons/ai";
import DateRangePicker from 'react-bootstrap-daterangepicker';
import 'bootstrap-daterangepicker/daterangepicker.css';
import { Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel } from "@mui/material";
import { CSVLink } from "react-csv";
import moment from "moment";
import Avatar from '@mui/material/Avatar';
import Error403 from "../error_pages/Error403";
import Error500 from '../error_pages/Error500';
import { useRef } from "react";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const TimeSheetComponent = () => {
    let date_today = new Date();
    const [data, setData] = useState([]);
    const [dataFilter, setDataFilter] = useState([]);
    const [permission, setpermission] = useState("");
    const [Loader, setLoader] = useState(false);
    const [startDate, setStartDate] = useState(new Date(date_today.getFullYear(), date_today.getMonth(), 1));
    const [endDate, setendtDate] = useState(new Date());
    const [userName, setUserName] = useState([]);
    const [user_id, setuser_id] = useState("");
    const [serverError, setServerError] = useState(false);


    let { getCommonApi } = GlobalPageRedirect()

    // pagination state
    const [count, setCount] = useState(5)
    const [page, setpage] = useState(0)

    // sort state
    const [order, setOrder] = useState("asc")
    const [orderBy, setOrderBy] = useState("date")

    let dateRangePickerRef = useRef(null)
    console.log(dateRangePickerRef.current, "dateRangePickerRef")

    // get timesheet data
    const getTimesheet = async (id, start, end) => {
        setLoader(true)
        try {
            const request = {
                params: { startDate: start || startDate, endDate: end || endDate, id },
                headers: {
                    Authorization: `Bearer ${GetLocalStorage("token")}`,
                },
            };
            const result = await axios.get(`${process.env.REACT_APP_API_KEY}/timeSheet`, request);
            if (result.data.success) {
                setData(result.data.data);
                setDataFilter(result.data.data);
                setpermission(result.data.permissions);
            }
        } catch (error) {
            if (!error.response) {
                toast.error(error.message);
            } else if (error.response.status === 401) {
                getCommonApi();
            } else {
                if(error.response.status === 500){
                    setServerError(true)
                  }
                if (error.response.data.message) {
                    toast.error(error.response.data.message)
                }
            }
        } finally {
            setTimeout(() => {
                setLoader(false)
            }, 500)
        }
    };

    // get user name
    const get_username = async () => {
        setLoader(true)
        try {
            const request = {
                headers: {
                    Authorization: `Bearer ${GetLocalStorage("token")}`,
                },
            };
            const res = await axios.post(`${process.env.REACT_APP_API_KEY}/user/username`, {}, request);

            if (res.data.success) {
                setUserName(res.data.data);
            }
        } catch (error) {
            if (!error.response) {
                toast.error(error.message);
            } else {
                if (error.response.status === 401) {
                    getCommonApi();
                } else {
                    if (error.response.data.message) {
                        toast.error(error.response.data.message)
                    }
                }
            }
        } finally {
            setTimeout(() => {
                setLoader(false)
            }, 800)
        }
    };

    // calcendar option
    const ranges = {
        Today: [moment(), moment()],
        Yesterday: [
            moment().subtract(1, "days"),
            moment().subtract(1, "days")
        ],
        "Last 7 Days": [moment().subtract(6, "days"), moment()],
        "Last 30 Days": [moment().subtract(29, "days"), moment()],
        "This Month": [moment().startOf("month"), moment().endOf("month")],
        "Last Month": [
            moment()
                .subtract(1, "month")
                .startOf("month"),
            moment()
                .subtract(1, "month")
                .endOf("month")
        ]
    };

    useEffect(() => {
        get_username();
        getTimesheet();
        // eslint-disable-next-line
    }, []);


    // Search filter
    const HandleFilter = (event) => {
        let { value } = event.target;

        const list = data.filter((val, ind) => {
            return (
                permission && permission.name.toLowerCase() === "admin" && (val.user?.first_name?.concat(" ", val.user.last_name).toLowerCase().includes(value.toLowerCase()) ||
                    val.date.includes(value) ||
                    val.login_time?.includes(value) ||
                    val.logout_time?.includes(value) ||
                    val.total?.includes(value))
            );
        });
        if (value) {
            setDataFilter(list);
        } else {
            setDataFilter(data)
        }
    }


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
        if (orderBy === "name") {
            if (b.user ? b.user.first_name?.concat(" ", b.last_name) : b.user < a.user ? a.user.first_name?.concat(" ", a.last_name) : a.user) {
                return -1
            }
            if (b.user ? b.user.first_name?.concat(" ", b.last_name) : b.user > a.user ? a.user.first_name?.concat(" ", a.last_name) : a.user) {
                return 1
            }
            return 0
        } else {
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

    // user change function
    const userChange = (e) => {
        setuser_id(e.target.value)
        getTimesheet(e.target.value)
    }

    const handleCallback = (start, end, label) => {
        setStartDate(start._d)
        setendtDate(end._d)
        getTimesheet(user_id, start._d, end._d)
    }

    let header = [
        { label: "Id", key: "id" },
        { label: "Name", key: "name" },
        { label: "Date", key: "Date" },
        { label: "Day", key: "Day" },
        { label: "Login Time", key: "login_time" },
        { label: "Login Out", key: "logout_time" },
        { label: "Total Hours", key: "Hours" },
    ]

    let csvdata = dataFilter.map((val, ind) => {
        return { id: ind + 1, name: val.user.first_name.concat(" ", val.user.last_name), Date: val.date, Day: moment(val.date).format('dddd'), login_time: val.login_time, logout_time: val.logout_time, Hours: val.total }
    })

    if (Loader) {
        return <Spinners />
    } else if (permission && (permission.name.toLowerCase() === "admin" || (permission.permissions.length !== 0 && permission.permissions.list === 1))) {
        return (<motion.div className="box" initial={{ opacity: 0, transform: "translateY(-20px)" }} animate={{ opacity: 1, transform: "translateY(0px)" }} transition={{ duration: 0.5 }}>
            {permission && (permission.name.toLowerCase() === "admin" || (permission.permissions.length !== 0 && permission.permissions.list === 1)) &&
                <div className=" container-fluid pt-4">
                    <div className="background-wrapper bg-white pt-2">
                        <div className=''>
                            <div className='row justify-content-end align-items-center row-std m-0'>
                                <div className="col-12 col-sm-5 d-flex justify-content-between align-items-center">
                                    <div>
                                        <ul id="breadcrumb" className="mb-0">
                                            <li><NavLink to="/" className="ihome">Dashboard</NavLink></li>
                                            <li><NavLink to="/timesheet" className="ibeaker"><i className="fa-solid fa-play"></i> &nbsp; Time Sheet</NavLink></li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="col-12 col-sm-7 d-flex justify-content-end" id="two">
                                    <div className="search-full">
                                        <input type="text" className="input-search-full" name="txt" placeholder="Search" onChange={HandleFilter} />
                                        <i className="fas fa-search"></i>
                                    </div>
                                    <div className="search-box mr-3">
                                        <form name="search-inner">
                                            <input type="text" className="input-search" name="txt" onChange={HandleFilter} />
                                        </form>
                                        <i className="fas fa-search"></i>
                                    </div>
                                    {dataFilter.length >= 1 &&
                                        <div className='btn btn-gradient-primary btn-rounded btn-fw text-center csv-button' >
                                            <CSVLink data={csvdata} headers={header} filename={"Work Report.csv"} target="_blank"><AiOutlineDownload />&nbsp;CSV</CSVLink>
                                        </div>}
                                </div>
                            </div>
                            <div className='container-fluid'>
                                <div className='row'>
                                    {permission && permission.name.toLowerCase() === "admin" &&
                                        <div className='col-12 col-sm-6 col-md-6 col-lg-6 col-xl-6 col-xxl-6'>
                                            <div className="form-group mb-0">
                                                <select className="form-control mt-3" id="employee" name='data' value={user_id} onChange={userChange} >
                                                    <option value=''>All</option>
                                                    {userName.map((val) => {
                                                        return (
                                                            val.role.toLowerCase() !== "admin" && <option key={val._id} value={val._id}>{val.first_name.concat(" ", val.last_name)}</option>
                                                        )
                                                    })}
                                                </select>
                                            </div>
                                        </div>}
                                    <div className='col-12 col-sm-6 col-md-6 col-lg-6 col-xl-6 col-xxl-6 ml-auto'>
                                        <div className="form-group mb-0 position-relative">
                                            <DateRangePicker initialSettings={{ startDate: startDate, endDate: endDate, ranges: ranges }} onCallback={handleCallback} >
                                                <input className="form-control mt-3" />
                                            </DateRangePicker>
                                            <CalendarMonthIcon className="range_icon" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* table */}
                        <div className="mx-4">
                            <TableContainer >
                                <Table className="common-table-section">
                                    <TableHead className="common-header">
                                        <TableRow>
                                            <TableCell>
                                                Id
                                            </TableCell>
                                            {permission && permission.name.toLowerCase() === "admin" && <TableCell>
                                                <TableSortLabel active={orderBy === "name"} direction={orderBy === "name" ? order : "asc"} onClick={() => handleRequestSort("name")}>
                                                    Employee
                                                </TableSortLabel>
                                            </TableCell>}
                                            <TableCell>
                                                <TableSortLabel active={orderBy === "date"} direction={orderBy === "date" ? order : "asc"} onClick={() => handleRequestSort("date")}>
                                                    Date
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell>
                                                <TableSortLabel active={orderBy === "login_time"} direction={orderBy === "login_time" ? order : "asc"} onClick={() => handleRequestSort("login_time")}>
                                                    Login Time
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell>
                                                <TableSortLabel active={orderBy === "logout_time"} direction={orderBy === "logout_time" ? order : "asc"} onClick={() => handleRequestSort("logout_time")}>
                                                    Logout Time
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell>
                                                <TableSortLabel active={orderBy === "total"} direction={orderBy === "total" ? order : "asc"} onClick={() => handleRequestSort("total")}>
                                                    Total Hours
                                                </TableSortLabel>
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {dataFilter.length !== 0 ? sortRowInformation(dataFilter, getComparator(order, orderBy)).slice(count * page, count * page + count).map((val, ind) => {
                                            return (
                                                <TableRow key={ind}>
                                                    <TableCell>{ind + 1}</TableCell>
                                                    {permission && permission.name.toLowerCase() === "admin" &&
                                                        <TableCell>
                                                            <div className={`pr-3 d-flex align-items-center name_col ${val.user.status === "Inactive" ? 'user-status-inactive' : ''}`}>
                                                                {val.user ? <>
                                                                    <Avatar alt={val.user.first_name} className='text-capitalize profile-action-icon text-center mr-2' src={val.user.profile_image && `${process.env.REACT_APP_IMAGE_API}/${val.user.profile_image}`} sx={{ width: 30, height: 30 }} />
                                                                    {val.user.first_name.concat(" ", val.user.last_name)}
                                                                </> : <HiOutlineMinus />
                                                                }
                                                            </div>
                                                        </TableCell>}
                                                    <TableCell>{val.date}</TableCell>
                                                    <TableCell>{val.login_time}</TableCell>
                                                    <TableCell>{val.logout_time ? val.logout_time : <HiOutlineMinus />}</TableCell>
                                                    <TableCell>{val.total ? val.total : (<HiOutlineMinus />)}</TableCell>
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
                                count={dataFilter.length}
                                page={page}>
                            </TablePagination>
                        </div>
                    </div>
                </div>}
        </motion.div >)
    } else if(serverError) {
        return <Error500 />
    }else{
        return <Error403 />
    }
};

export default TimeSheetComponent;
