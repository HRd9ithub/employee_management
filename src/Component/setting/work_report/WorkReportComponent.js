import React, { useEffect, useState, useContext } from "react";
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import { toast } from "react-hot-toast";
import { HiOutlineMinus } from "react-icons/hi";
import Spinner from "../../common/Spinner";
import DateRangePicker from 'react-bootstrap-daterangepicker';
import 'bootstrap-daterangepicker/daterangepicker.css';
import { Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel } from "@mui/material";
import moment from "moment";
import Error403 from "../../error_pages/Error403";
import Error500 from '../../error_pages/Error500';
import WorkReportModal from "./WorkReportModal";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import Modal from "react-bootstrap/Modal";
import { customAxios } from "../../../service/CreateApi";
import RequestModal from "./RequestModal";
import DowlonadReport from "./dowlonadReport";
import { AppProvider } from "../../context/RouteContext";
import ranges from "../../../helper/calcendarOption";

const WorkReportComponent = () => {
    let date_today = new Date();
    // eslint-disable-next-line
    const [data, setData] = useState([]);
    const [dataFilter, setDataFilter] = useState([]);
    const [permission, setpermission] = useState("");
    const [isLoading, setisLoading] = useState(false);
    const [startDate, setStartDate] = useState(moment(date_today).subtract(1, "day"));
    const [endDate, setendtDate] = useState(moment(date_today).subtract(1, "day"));
    const [user_id, setuser_id] = useState("");
    const [show, setShow] = useState(false)
    const [serverError, setServerError] = useState(false);
    const [description, setdescription] = useState([]);

    let { get_username, userName } = useContext(AppProvider);

    // pagination state
    const [count, setCount] = useState(50)
    const [page, setpage] = useState(0)

    // sort state
    const [order, setOrder] = useState("desc")
    const [orderBy, setOrderBy] = useState("date")

    // get report data
    const getReport = async (id, start, end) => {
        setisLoading(true);
        setServerError(false);
        customAxios().get(`/report?startDate=${moment(start || startDate).format("YYYY-MM-DD")}&endDate=${moment(end || endDate).format("YYYY-MM-DD")}&id=${id ? id : ""} `).then((result) => {
            if (result.data.success) {
                setpermission(result.data.permissions);
                setData(result.data.data);
                setDataFilter(result.data.data);
                setisLoading(false)
            }
        }).catch((error) => {
            setisLoading(false)
            if (!error.response) {
                setServerError(true)
                toast.error(error.message);
            } else {
                if (error.response.status === 500) {
                    setServerError(true)
                }
                if (error.response.data.message) {
                    toast.error(error.response.data.message)
                }
            }
        })
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
            if (b.user?.first_name?.concat(" ", b.user?.last_name) < a.user?.first_name?.concat(" ", a.user?.last_name)) {
                return -1
            }
            if (b.user?.first_name?.concat(" ", b.user?.last_name) > a.user?.first_name?.concat(" ", a.user?.last_name)) {
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
        permission && permission.name.toLowerCase() !== "admin"  && getReport(user_id, start._d, end._d)
    }

    const generateReport = () => {
        getReport(user_id,startDate, endDate)
    }

    // modal show 
    const handleShow = (val) => {
        setShow(true)
        setdescription(val.work)
    }
    // modal Hide 
    const handleClose = () => {
        setShow(false)
    }

    if (isLoading) {
        return <Spinner />;
    }else if(serverError){
        return <Error500 />;
    }else if (!permission || permission.permissions.list !== 1) {
        return <Error403 />;
      }
    
    return (
        <motion.div className="box" initial={{ opacity: 0, transform: "translateY(-20px)" }} animate={{ opacity: 1, transform: "translateY(0px)" }} transition={{ duration: 0.5 }}>
            <div className=" container-fluid pt-4">
                <div className="background-wrapper bg-white pt-4">
                    <div className=''>
                        <div className='row justify-content-end align-items-center row-std m-0'>
                            <div className="col-12 col-sm-5 col-xl-3 d-flex justify-content-between align-items-center">
                                <div>
                                    <ul id="breadcrumb" className="mb-0">
                                        <li><NavLink to="/" className="ihome">Dashboard</NavLink></li>
                                        <li><NavLink to="" className="ibeaker"><i className="fa-solid fa-play"></i> &nbsp; Work Report</NavLink></li>
                                    </ul>
                                </div>
                            </div>
                            <div className="col-12 col-sm-7 col-xl-9 d-flex justify-content-end" id="two">
                                <div className="d-flex justify-content-end align-items-center w-100" style={{ gap: '15px' }}>
                                    {permission && permission.name.toLowerCase() === "admin" &&
                                        <div className="search-full w-25 pr-0 hide-at-small-screen">
                                            <div className="form-group mb-0">
                                                <select className="form-control mb-0" id="employee" name='data' value={user_id} onChange={userChange} >
                                                    <option value="">Select employee</option>
                                                    {userName.map((val) => {
                                                        return (
                                                            val?.role?.toLowerCase() !== "admin" && <option key={val._id} value={val._id}>{val.name}</option>
                                                        )
                                                    })}
                                                </select>
                                            </div>
                                        </div>}
                                    <div className="form-group mb-0 position-relative w-25 hide-at-small-screen">
                                        <div className="form-group mb-0 position-relative">
                                            <DateRangePicker initialSettings={{ startDate: startDate, endDate: endDate, ranges: ranges, maxDate: new Date() }} onCallback={handleCallback} ><input className="form-control mb-0" /></DateRangePicker>
                                            <CalendarMonthIcon className="range_icon" />
                                        </div>
                                    </div>
                                    {permission && permission.name.toLowerCase() === "admin" &&
                                    <button
                                        className='btn btn-gradient-primary btn-rounded btn-fw text-center hide-at-small-screen' onClick={generateReport} >
                                        <i className="fa-solid fa-plus" ></i>&nbsp;Generate Report
                                    </button>}
                                    {permission && permission.name.toLowerCase() !== "admin" && <RequestModal />}
                                    <WorkReportModal permission={permission && permission} getReport={getReport} />
                                    {permission && permission.name.toLowerCase() === "admin" && <DowlonadReport />}
                                </div>
                            </div>
                        </div>
                        <div className='container-fluid show-at-small-screen'>
                            <div className='row'>
                                {permission && permission.name.toLowerCase() === "admin" &&
                                <div className='col-12 col-sm-6 col-md-4 col-lg-4 col-xl-4 col-xxl-4'>
                                    <div className="form-group mb-0">
                                        <select className="form-control mt-3" id="employee" name='data' value={user_id} onChange={userChange} >
                                            <option value="">All</option>
                                            {userName.map((val) => {
                                                return (
                                                    <option key={val._id} value={val._id}>{val.name}</option>
                                                )
                                            })}
                                        </select>
                                    </div>
                                </div>}
                                <div className='col-12 col-sm-6 col-md-4 col-lg-4 col-xl-4 col-xxl-4 ml-auto'>
                                    <div className="form-group mb-0 position-relative">
                                        <DateRangePicker initialSettings={{ startDate: startDate, endDate: endDate, ranges: ranges, maxDate: new Date() }} onCallback={handleCallback} ><input className="form-control mt-3" /></DateRangePicker>
                                        <CalendarMonthIcon className="range_icon" />
                                    </div>
                                </div>
                                {permission && permission.name.toLowerCase() === "admin" &&
                                <div className='col-12 col-sm-6 col-md-4 col-lg-4 col-xl-4 col-xxl-4'>
                                    <button
                                        className='btn btn-gradient-primary btn-rounded btn-fw text-center mt-3' onClick={generateReport} >
                                        <i className="fa-solid fa-plus" ></i>&nbsp;Generate Report
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
                                        {permission && permission.name.toLowerCase() === "admin" && <TableCell>
                                            {/* <TableSortLabel active={orderBy === "name"} direction={orderBy === "name" ? order : "asc"} onClick={() => handleRequestSort("name")}> */}
                                            Employee
                                            {/* </TableSortLabel> */}
                                        </TableCell>}
                                        <TableCell>
                                            <TableSortLabel active={orderBy === "date"} direction={orderBy === "date" ? order : "asc"} onClick={() => handleRequestSort("date")}>
                                                Date
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell>
                                            <TableSortLabel active={orderBy === "totalHours"} direction={orderBy === "totalHours" ? order : "asc"} onClick={() => handleRequestSort("totalHours")}>
                                                Total Hours
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell align="center">
                                            Description
                                        </TableCell>
                                        {permission && permission.permissions.update === 1 &&
                                            <TableCell>
                                                Action
                                            </TableCell>}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {dataFilter.length !== 0 ? sortRowInformation(dataFilter, getComparator(order, orderBy)).slice(count * page, count * page + count).map((val, ind) => {
                                        return (
                                            <TableRow key={ind}>
                                                {permission && permission.name.toLowerCase() === "admin" &&
                                                    <TableCell>
                                                        <div className='pr-3'>
                                                            {val.user ? <NavLink to={"/employees/view/" + val.user_id} className={`${val.user.status === "Inactive" ? 'user-status-inactive' : 'name_col'}`}>{val.user?.first_name.concat(" ", val.user.last_name)}</NavLink> : <HiOutlineMinus />}
                                                        </div>
                                                    </TableCell>
                                                }
                                                <TableCell>{moment(val.date).format("DD MMM YYYY")}</TableCell>
                                                <TableCell>{val.totalHours}</TableCell>
                                                <TableCell align="center"><NavLink to="" onClick={() => handleShow(val)}>View</NavLink></TableCell>
                                                {permission && permission.name.toLowerCase() === "admin" ? <TableCell align="center">
                                                    <div className="action">
                                                        <WorkReportModal permission={permission && permission} getReport={getReport} data={val} />
                                                    </div>
                                                </TableCell> :
                                                    <TableCell>
                                                        <div className="action">
                                                            <RequestModal data={val.date} />
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
                    </div>
                </div>
            </div>

            {/* view description modal */}
            <Modal
                show={show}
                animation={true}
                size="md"
                aria-labelledby="example-modal-sizes-title-sm"
                className="department-modal work-report-view-modal"
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
                            {description?.map((currElem, ind) => {
                                return <div className="card-body table_section" key={currElem._id}>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h4>{ind + 1}. {currElem.project?.name}</h4>
                                        <h5 className="text-secondary">{currElem.hours}h</h5>
                                    </div>
                                    <hr />
                                    <div>
                                        {currElem.description}
                                    </div>
                                </div>
                            })}
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </motion.div >)
};

export default WorkReportComponent;