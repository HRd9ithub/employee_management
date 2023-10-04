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
import DateRangePicker from 'react-bootstrap-daterangepicker';
import 'bootstrap-daterangepicker/daterangepicker.css';
import { Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel } from "@mui/material";
import moment from "moment";
import Avatar from '@mui/material/Avatar';
import Error403 from "../error_pages/Error403";
import Error500 from '../error_pages/Error500';
import WorkReportModal from "./WorkReportModal";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import Modal from "react-bootstrap/Modal";

const WorkReportComponent = () => {
    let date_today = new Date();
    // eslint-disable-next-line
    const [data, setData] = useState([]);
    const [dataFilter, setDataFilter] = useState([]);
    const [permission, setpermission] = useState("");
    const [Loader, setLoader] = useState(false);
    const [startDate, setStartDate] = useState(new Date(date_today.getFullYear(), date_today.getMonth(), 1));
    const [endDate, setendtDate] = useState(new Date());
    const [userName, setUserName] = useState([]);
    const [user_id, setuser_id] = useState("");
    const [show, setShow] = useState(false)
    const [serverError, setServerError] = useState(false);
    const [description, setdescription] = useState("")

    let { getCommonApi } = GlobalPageRedirect()

    // pagination state
    const [count, setCount] = useState(10)
    const [page, setpage] = useState(0)

    // sort state
    const [order, setOrder] = useState("asc")
    const [orderBy, setOrderBy] = useState("date")

    // get report data
    const getReport = async (id, start, end) => {
        setLoader(true)
        try {
            const request = {
                params: { startDate: start || startDate, endDate: end || endDate, id: id || (userName.length !== 0 ? userName[0]._id : "") },
                headers: {
                    Authorization: `Bearer ${GetLocalStorage("token")}`,
                },
            };
            const result = await axios.get(`${process.env.REACT_APP_API_KEY}/report`, request);
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
                let data = res.data.data.filter((val) => val.role.toLowerCase() !== "admin")
                setUserName(data);
                // getReport(data.length !== 0 ? data[0]._id : "");
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

    useEffect(() => {
        get_username();
        getReport();
        // eslint-disable-next-line
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
        if (orderBy === "name") {
            if (b.user ? b.user.first_name?.concat(" ", b.last_name) : b.user < a.user ? a.user.first_name?.concat(" ", a.last_name) : a.user) {
                return -1
            }
            if (b.user ? b.user.first_name?.concat(" ", b.last_name) : b.user > a.user ? a.user.first_name?.concat(" ", a.last_name) : a.user) {
                return 1
            }
            return 0
        } else if (orderBy === "project") {
            if (b.project ? b.project?.name : b.project < a.project ? a.project.name : a.project) {
                return -1
            }
            if (b.project ? b.project.name : b.project > a.project ? a.project.name : a.project) {
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
        getReport(e.target.value)
    }

    const handleCallback = (start, end, label) => {
        setStartDate(start._d)
        setendtDate(end._d)
        getReport(user_id, start._d, end._d)
    }

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

    // modal show 
    const handleShow = (val) => {
        setShow(true)
        setdescription(val)
    }
    // modal Hide 
    const handleClose = () => {
        setShow(false)
    }

    if (Loader) {
        return <Spinners />
    } else if (permission && (permission.name.toLowerCase() === "admin" || (permission.permissions.length !== 0 && permission.permissions.list === 1))) {
        return (<motion.div className="box" initial={{ opacity: 0, transform: "translateY(-20px)" }} animate={{ opacity: 1, transform: "translateY(0px)" }} transition={{ duration: 0.5 }}>
            {permission && (permission.name.toLowerCase() === "admin" || (permission.permissions.length !== 0 && permission.permissions.list === 1)) &&
                <div className=" container-fluid pt-4">
                    <div className="background-wrapper bg-white pt-2">
                        <div className=''>
                            <div className='row justify-content-end align-items-center row-std m-0'>
                                <div className="col-12 col-sm-6 d-flex justify-content-between align-items-center">
                                    <div>
                                        <ul id="breadcrumb" className="mb-0">
                                            <li><NavLink to="/" className="ihome">Dashboard</NavLink></li>
                                            <li><NavLink to="/workreport" className="ibeaker"><i className="fa-solid fa-play"></i> &nbsp; Work Report</NavLink></li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="col-12 col-sm-6 d-flex justify-content-end" id="two">
                                    <WorkReportModal permission={permission && permission} getReport={getReport} />
                                </div>
                            </div>
                            <div className='container-fluid'>
                                <div className='row'>
                                    {permission && permission.name.toLowerCase() === "admin" &&
                                        <div className='col-12 col-sm-6 col-md-6 col-lg-6 col-xl-6 col-xxl-6'>
                                            <div className="form-group mb-0">
                                                <select className="form-control mt-3" id="employee" name='data' value={user_id} onChange={userChange} >
                                                    <option value="">Select employee</option>
                                                    {userName.map((val) => {
                                                        return (
                                                            <option key={val._id} value={val._id}>{val.first_name?.concat(" ", val.last_name)}</option>
                                                        )
                                                    })}
                                                </select>
                                            </div>
                                        </div>}
                                    <div className='col-12 col-sm-6 col-md-6 col-lg-6 col-xl-6 col-xxl-6 ml-auto'>
                                        <div className="form-group mb-0 position-relative">
                                            <DateRangePicker initialSettings={{ startDate: startDate, endDate: endDate, ranges: ranges }} onCallback={handleCallback} ><input className="form-control mt-3" /></DateRangePicker>
                                            <CalendarMonthIcon className="range_icon" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* table */}
                        <div className="mx-4">
                            {permission.name.toLowerCase() !== "admin" || user_id ? <>
                                <TableContainer >
                                    <Table className="common-table-section">
                                        <TableHead className="common-header">
                                            <TableRow>
                                                <TableCell>
                                                    Id
                                                </TableCell>
                                                <TableCell>
                                                    <TableSortLabel active={orderBy === "name"} direction={orderBy === "name" ? order : "asc"} onClick={() => handleRequestSort("name")}>
                                                        Date
                                                    </TableSortLabel>
                                                </TableCell>
                                                {permission && permission.name.toLowerCase() === "admin" && <TableCell>
                                                    <TableSortLabel active={orderBy === "date"} direction={orderBy === "date" ? order : "asc"} onClick={() => handleRequestSort("date")}>
                                                        Employee
                                                    </TableSortLabel>
                                                </TableCell>}
                                                <TableCell>
                                                    <TableSortLabel active={orderBy === "hours"} direction={orderBy === "hours" ? order : "asc"} onClick={() => handleRequestSort("hours")}>
                                                        Hours
                                                    </TableSortLabel>
                                                </TableCell>
                                                <TableCell>
                                                    <TableSortLabel active={orderBy === "project"} direction={orderBy === "project" ? order : "asc"} onClick={() => handleRequestSort("project")}>
                                                        Project
                                                    </TableSortLabel>
                                                </TableCell>
                                                <TableCell align="center">
                                                    Description
                                                </TableCell>
                                                {permission && (permission.name.toLowerCase() === "admin" || (permission.permissions.length !== 0 && permission.permissions.update === 1)) &&
                                                    <TableCell>
                                                        Action
                                                    </TableCell>}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {dataFilter.length !== 0 ? sortRowInformation(dataFilter, getComparator(order, orderBy)).slice(count * page, count * page + count).map((val, ind) => {
                                                return (
                                                    <TableRow key={ind}>
                                                        {!val.projectId && val.name !== "Leave" && <TableCell colSpan={7} align="center" className="Holiday_column">{val.date.concat(" - ", val.name)}</TableCell>}
                                                        {!val.projectId && val.name === "Leave" && <TableCell colSpan={7} align="center" className="Leave_column">{val.date.concat(" - ", val.name)}</TableCell>}
                                                        {val.projectId && <TableCell>{ind + 1}</TableCell>}
                                                        {val.projectId && <TableCell>{val.date}</TableCell>}
                                                        {val.projectId &&
                                                            permission && permission.name.toLowerCase() === "admin" &&
                                                            <TableCell>
                                                                <div className='pr-3 d-flex align-items-center name_col'>
                                                                    {val.user ? <>
                                                                        <Avatar alt={val.user.first_name} className='text-capitalize profile-action-icon text-center mr-2' src={val.user.profile_image && `${process.env.REACT_APP_IMAGE_API}/${val.user.profile_image}`} sx={{ width: 30, height: 30 }} />
                                                                        {val.user.first_name.concat(" ", val.user.last_name)}
                                                                    </> : <HiOutlineMinus />
                                                                    }
                                                                </div>
                                                            </TableCell>
                                                        }
                                                        {val.projectId && <TableCell>{val.hours}</TableCell>}
                                                        {val.projectId && <TableCell>{val.project.name}</TableCell>}
                                                        {val.projectId && <TableCell align="center"><NavLink to="" onClick={() => handleShow(val)}>View</NavLink></TableCell>}
                                                        {permission && (permission.name.toLowerCase() === "admin" || (permission.permissions.length !== 0 && permission.permissions.update === 1)) && val.projectId && <TableCell align="center">
                                                            <div className="action">
                                                                <WorkReportModal permission={permission && permission} getReport={getReport} data={val} />
                                                            </div>
                                                        </TableCell>}
                                                    </TableRow>
                                                )
                                            }) :
                                                <TableRow>
                                                    <TableCell colSpan={7} align="center">
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
                            </> :
                                <h4 class="no-data my-2">Please select employee first</h4>}
                        </div>
                    </div>
                </div>}


            <Modal
                show={show}
                animation={true}
                size="md"
                aria-labelledby="example-modal-sizes-title-sm"
                className="small-modal department-modal work-report-view-modal"
                centered
            >
                <Modal.Header className="small-modal">
                    <Modal.Title>
                        View Description
                    </Modal.Title>
                    <p className="close-modal" onClick={handleClose}>
                        <i className="fa-solid fa-xmark"></i>
                    </p>
                </Modal.Header>
                <Modal.Body>
                    <div className=" grid-margin stretch-card inner-pages mb-lg-0">
                        <div className="card">
                            <div className="card-body table_section">
                                <h4>{description?.project?.name}</h4>
                                <hr />
                                <div dangerouslySetInnerHTML={{ __html: description?.description }}></div>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </motion.div >)
    }  else if(serverError) {
        return <Error500 />
    }else{
        return <Error403 />
    }
};

export default WorkReportComponent;