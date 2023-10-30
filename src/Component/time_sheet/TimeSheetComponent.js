import React, { useEffect, useState, useMemo, useContext } from "react";
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import { toast } from "react-hot-toast";
import { HiOutlineMinus } from "react-icons/hi";
import GlobalPageRedirect from "../auth_context/GlobalPageRedirect";
import { AiOutlineDownload } from "react-icons/ai";
import DateRangePicker from 'react-bootstrap-daterangepicker';
import 'bootstrap-daterangepicker/daterangepicker.css';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel } from "@mui/material";
import { CSVLink } from "react-csv";
import moment from "moment";
import Error403 from "../error_pages/Error403";
import Error500 from '../error_pages/Error500';
import { customAxios } from "../../service/CreateApi";
import Spinner from "../common/Spinner";
import { AppProvider } from "../context/RouteContext";

const TimeSheetComponent = () => {
    let date_today = new Date();
    const [data, setData] = useState([]);
    const [permission, setpermission] = useState("");
    const [isLoading, setisLoading] = useState(false);
    const [startDate, setStartDate] = useState(moment(date_today).subtract(1, "day"));
    const [endDate, setendtDate] = useState(moment(date_today).subtract(1, "day"));
    const [user_id, setuser_id] = useState("");
    const [serverError, setServerError] = useState(false);
    const [searchItem, setsearchItem] = useState("");

    let { getCommonApi } = GlobalPageRedirect();
    let { get_username, userName, Loading } = useContext(AppProvider);

    // pagination state
    const [count, setCount] = useState(5)
    const [page, setpage] = useState(0)

    // sort state
    const [order, setOrder] = useState("desc")
    const [orderBy, setOrderBy] = useState("date")

    // get timesheet data
    const getTimesheet = async (id, start, end) => {
        try {
            setisLoading(true)
            setServerError(false);
            const result = await customAxios().get(`/timesheet?startDate=${moment(start || startDate).format("YYYY-MM-DD")}&endDate=${moment(end || endDate).format("YYYY-MM-DD")}&id=${id ? id : ""} `);
            if (result.data.success) {
                setpermission(result.data.permissions);
                setData(result.data.data);
            }
        } catch (error) {
            if (!error.response) {
                setServerError(true)
                toast.error(error.message);
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
            setTimeout(() => {
                setisLoading(false)
            }, 500)
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

    // memoize filtered items
    const dataFilter = useMemo(() => {
        return data.filter((val) => {
            return (
                moment(val.date).format("DD MMM YYYY").toLowerCase().includes(searchItem.toLowerCase()) ||
                moment(val.login_time, "HH:mm:ss").format("hh:mm:ss A")?.includes(searchItem.toLowerCase()) ||
                moment(val.logout_time, "HH:mm:ss").format("hh:mm:ss A")?.includes(searchItem.toLowerCase()) ||
                val.total?.includes(searchItem.toLowerCase())
            );
        });
    }, [data, searchItem]);


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
            if (b.user.first_name?.concat(" ", b.last_name) < a.user.first_name?.concat(" ", a.last_name)) {
                return -1
            }
            if (b.user.first_name?.concat(" ", b.last_name) > a.user.first_name?.concat(" ", a.last_name)) {
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
    }

    const handleCallback = (start, end, label) => {
        setStartDate(start._d)
        setendtDate(end._d);
        permission && permission.name.toLowerCase() !== "admin" && getTimesheet(user_id, start._d, end._d)
    }

    const generateTimeSheet = () => {
        getTimesheet(user_id, startDate, endDate)
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


    if (isLoading || Loading) {
        return <Spinner />;
    } else if (serverError) {
        return <Error500 />;
    } else if (!permission || (permission.name.toLowerCase() !== "admin" && (permission.permissions.length !== 0 && permission.permissions.list === 0))) {
        return <Error403 />;
    }


    return (<motion.div className="box" initial={{ opacity: 0, transform: "translateY(-20px)" }} animate={{ opacity: 1, transform: "translateY(0px)" }} transition={{ duration: 0.5 }}>
        <div className=" container-fluid pt-4">
            <div className="background-wrapper bg-white pt-4">
                <div className=''>
                    <div className='row justify-content-end align-items-center row-std m-0'>
                        <div className="col-12 col-sm-5 col-xl-3 d-flex justify-content-between align-items-center">
                            <div>
                                <ul id="breadcrumb" className="mb-0">
                                    <li><NavLink to="/" className="ihome">Dashboard</NavLink></li>
                                    <li><NavLink to="" className="ibeaker"><i className="fa-solid fa-play"></i> &nbsp; Time Sheet</NavLink></li>
                                </ul>
                            </div>
                        </div>
                        <div className="col-12 col-sm-7 col-xl-9 d-flex justify-content-end" id="two">
                            <div className="d-flex justify-content-end align-items-center w-100" style={{ gap: '15px' }}>
                                {permission && permission.name.toLowerCase() === "admin" &&
                                    <div className="search-full w-25 pr-0 hide-at-small-screen">
                                        <div className="form-group mb-0">
                                            <select className="form-control mb-0" id="employee" name='data' value={user_id} onChange={userChange} >
                                                <option value=''>All</option>
                                                {userName.map((val) => {
                                                    return (
                                                        val.role.toLowerCase() !== "admin" && <option key={val._id} value={val._id}>{val.name}</option>
                                                    )
                                                })}
                                            </select>
                                        </div>
                                    </div>}
                                <div className="form-group mb-0 position-relative w-25 hide-at-small-screen">
                                    <div className="form-group mb-0 position-relative">
                                        <DateRangePicker initialSettings={{ startDate: startDate, endDate: endDate, ranges: ranges, maxDate: new Date() }} onCallback={handleCallback} >
                                            <input className="form-control mb-0" />
                                        </DateRangePicker>
                                        <CalendarMonthIcon className="range_icon" />
                                    </div>
                                </div>
                                {permission && permission.name.toLowerCase() === "admin" &&
                                    <button className='btn btn-gradient-primary btn-rounded btn-fw text-center hide-at-small-screen' onClick={generateTimeSheet} >
                                        <i className="fa-solid fa-plus" ></i>&nbsp;Generate TimeSheet
                                    </button>}
                                <div className="search-full pr-0">
                                    <input type="search" className="input-search-full" autoComplete='off' value={searchItem} name="txt" placeholder="Search" onChange={(event) => setsearchItem(event.target.value)} />
                                    <i className="fas fa-search"></i>
                                </div>
                                <div className="search-box mr-3">
                                    <form name="search-inner">
                                        <input type="search" className="input-search" autoComplete='off' value={searchItem} name="txt" onChange={(event) => setsearchItem(event.target.value)} />
                                    </form>
                                    <i className="fas fa-search"></i>
                                </div>
                                {dataFilter.length >= 1 &&
                                    <div className='btn btn-gradient-primary btn-rounded btn-fw text-center csv-button' >
                                        <CSVLink data={csvdata} headers={header} filename={"Work Report.csv"} target="_blank"><AiOutlineDownload />&nbsp;CSV</CSVLink>
                                    </div>}
                            </div>
                        </div>
                    </div>
                    <div className='container-fluid show-at-small-screen'>
                        <div className='row'>
                            {permission && permission.name.toLowerCase() === "admin" &&
                                <div className='col-12 col-sm-6 col-md-4 col-lg-4 col-xl-4 col-xxl-4'>
                                    <div className="form-group mb-0">
                                        <select className="form-control mt-3" id="employee" name='data' value={user_id} onChange={userChange} >
                                            <option value=''>All</option>
                                            {userName.map((val) => {
                                                return (
                                                    val.role.toLowerCase() !== "admin" && <option key={val._id} value={val._id}>{val.name}</option>
                                                )
                                            })}
                                        </select>
                                    </div>
                                </div>}
                            <div className='col-12 col-sm-6 col-md-4 col-lg-4 col-xl-4 col-xxl-4 ml-auto'>
                                <div className="form-group mb-0 position-relative">
                                    <DateRangePicker initialSettings={{ startDate: startDate, endDate: endDate, ranges: ranges, maxDate: new Date() }} onCallback={handleCallback} >
                                        <input className="form-control mt-3" />
                                    </DateRangePicker>
                                    <CalendarMonthIcon className="range_icon" />
                                </div>
                            </div>
                            {permission && permission.name.toLowerCase() === "admin" &&
                                <div className='col-12 col-sm-6 col-md-4 col-lg-4 col-xl-4 col-xxl-4'>
                                    <button className='btn btn-gradient-primary btn-rounded btn-fw text-center mt-3' onClick={generateTimeSheet} >
                                        <i className="fa-solid fa-plus" ></i>&nbsp;Generate Timesheet
                                    </button>
                                </div>}
                        </div>
                    </div>
                </div>

                {/* table */}
                <div className="mx-4">
                    <TableContainer >
                        <Table className="common-table-section">
                            <TableHead className="common-header">
                                <TableRow>
                                    <TableCell>id</TableCell>
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
                                            {(permission && permission.name?.toLowerCase() === "admin") &&
                                                <TableCell>
                                                    <div className='pr-3'>
                                                        {val.user ? <NavLink to={"/employees/view/" + val.user_id} className={`${val.user.status === "Inactive" ? 'user-status-inactive' : 'name_col'}`}>{val.user?.first_name.concat(" ", val.user.last_name)}</NavLink> : <HiOutlineMinus />}
                                                    </div>
                                                </TableCell>
                                            }
                                            <TableCell>{moment(val.date).format("DD MMM YYYY")}</TableCell>
                                            <TableCell>{moment(val.login_time, "HH:mm:ss").format("hh:mm:ss A")}</TableCell>
                                            <TableCell>{val.logout_time ? moment(val.logout_time, "HH:mm:ss").format("hh:mm:ss A") : <HiOutlineMinus />}</TableCell>
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
        </div>
    </motion.div >
    )
};

export default TimeSheetComponent;
