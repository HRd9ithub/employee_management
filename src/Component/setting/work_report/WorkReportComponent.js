/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useContext, useMemo } from "react";
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import { toast } from "react-hot-toast";
import { HiOutlineMinus } from "react-icons/hi";
import Spinner from "../../common/Spinner";
import DateRangePicker from 'react-bootstrap-daterangepicker';
import 'bootstrap-daterangepicker/daterangepicker.css';
import { Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TablePagination, TableRow, TableSortLabel } from "@mui/material";
import moment from "moment";
import Error403 from "../../error_pages/Error403";
import Error500 from '../../error_pages/Error500';
import WorkReportModal from "./WorkReportModal";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import Modal from "react-bootstrap/Modal";
import { customAxios } from "../../../service/CreateApi";
import DowlonadReport from "./dowlonadReport";
import { AppProvider } from "../../context/RouteContext";
import ranges from "../../../helper/calcendarOption";
import ErrorComponent from "../../common/ErrorComponent";
import usePagination from "../../../hooks/usePagination";
import { SetLocalStorage } from "../../../service/StoreLocalStorage";

const WorkReportComponent = () => {
    const date_today = new Date();
    const matchDate = [moment(date_today).format("YYYY-MM-DD"), moment(date_today).subtract(1, "d").format("YYYY-MM-DD")]
    const [dataFilter, setDataFilter] = useState([]);
    const [permission, setPermission] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubLoading, setIsSubLoading] = useState(false);
    const [startDate, setStartDate] = useState(moment().clone().startOf('month'));
    const [endDate, setEndDate] = useState(moment().clone().endOf('month'));
    const [user_id, setUser_id] = useState("");
    const [show, setShow] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [serverError, setServerError] = useState(false);
    const [description, setDescription] = useState({});
    const [permissionToggle, setPermissionToggle] = useState(true);
    const [localStorageToggle, setLocalStorageToggle] = useState(false);
    const [newRecord, setNewRecord] = useState("");
    const [error, setError] = useState([]);
    const [extraHoursRowToggle, setExtraHoursRowToggle] = useState(false);

    let { get_username, userName, getLeaveNotification } = useContext(AppProvider);

    // pagination state
    const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage, setPage } = usePagination(50);

    // sort state
    const [order, setOrder] = useState("asc")
    const [orderBy, setOrderBy] = useState("date")

    // get report data
    const getReport = async (id, start, end) => {
        // Toggle extra hours row visibility based on the presence of an ID
        setExtraHoursRowToggle(!!id);

        // Update start and end dates if provided and different from current state
        if (start && startDate !== start) setStartDate(start);
        if (end && endDate !== end) setEndDate(end);

        setIsLoading(true);
        setPermissionToggle(true);
        setServerError(false);

        try {
            const response = await customAxios().get(
                `/report?startDate=${moment(start || startDate).format("YYYY-MM-DD")}&endDate=${moment(end || endDate).format("YYYY-MM-DD")}&id=${id || ""}`
            );

            if (response.data.success) {
                setPage(0);
                setPermission(response.data.permissions);

                let reportData = [];

                if (id || response.data.permissions?.name?.toLowerCase() !== "admin") {
                    response.data.data.forEach((val, ind) => {
                        const startDiff = moment(val.date).diff(moment(start || startDate), "days");

                        // Fill missing dates at the start of the report
                        if (ind === 0 && startDiff > 0) {
                            reportData.push(
                                ...Array(startDiff).fill().map((_, i) => ({
                                    date: moment(start || startDate).add(i, "days").format("YYYY-MM-DD"),
                                    user: val.user,
                                    userId: val.userId,
                                    totalHours: 0,
                                    extraTotalHours: 0,
                                    extraWork: [],
                                    work: [],
                                }))
                            );
                        }

                        // Add current data point
                        reportData.push(val);

                        // Fill missing dates between current and next entry
                        if (
                            ind < response.data.data.length - 1 &&
                            moment(response.data.data[ind + 1].date).diff(moment(val.date), "days") > 1
                        ) {
                            const nextDiff = moment(response.data.data[ind + 1].date).diff(moment(val.date), "days") - 1;
                            reportData.push(
                                ...Array(nextDiff).fill().map((_, i) => ({
                                    date: moment(val.date).add(i + 1, "days").format("YYYY-MM-DD"),
                                    user: val.user,
                                    userId: val.userId,
                                    totalHours: 0,
                                    extraTotalHours: 0,
                                    extraWork: [],
                                    work: [],
                                }))
                            );
                        }

                        // Fill missing dates at the end of the report
                        if (ind === response.data.data.length - 1) {
                            const endDiff = moment(end || endDate).diff(moment(val.date), "days");
                            if (endDiff > 0) {
                                reportData.push(
                                    ...Array(endDiff).fill().map((_, i) => ({
                                        date: moment(val.date).add(i + 1, "days").format("YYYY-MM-DD"),
                                        user: val.user,
                                        userId: val.userId,
                                        totalHours: 0,
                                        extraTotalHours: 0,
                                        extraWork: [],
                                        work: [],
                                    }))
                                );
                            }
                        }
                    });

                    if (reportData.length === 0) {
                        const userObj = userName.find((user) => user._id === id);
                        const totalDays = moment(end || endDate).diff(moment(start || startDate), "days") + 1;
                        reportData.push(
                            ...Array(totalDays).fill().map((_, i) => ({
                                date: moment(start || startDate).add(i, "days").format("YYYY-MM-DD"),
                                totalHours: 0,
                                extraTotalHours: 0,
                                extraWork: [],
                                work: [],
                                user: {
                                    status: "Inactive",
                                    first_name: userObj?.name?.split(" ")[0],
                                    last_name: userObj?.name?.split(" ")[1],
                                },
                            }))
                        );
                    }

                    setDataFilter(
                        reportData.filter(
                            (entry) => !(!entry._id && entry.date === moment(date_today).format("YYYY-MM-DD"))
                        )
                    );

                } else {
                    setDataFilter(response.data.data);
                }
            }
        } catch (error) {
            setIsLoading(false);

            if (!error.response) {
                setServerError(true);
                toast.error(error.message);
            } else {
                if (error.response.status === 500) setServerError(true);
                if (error.response.data.message) toast.error(error.response.data.message);
            }
        } finally {
            setPermissionToggle(false);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!localStorageToggle || localStorage.getItem("filter")) {
            const filter = JSON.parse(localStorage.getItem("filter"));
            const newData = JSON.parse(localStorage.getItem("data"));
            get_username();
            if (filter) {
                getReport(filter.id, new Date(filter.date), new Date(filter.date));
                setStartDate(new Date(filter.date));
                setEndDate(new Date(filter.date));
                setUser_id(filter.id);
                if (newData) {
                    setNewRecord(newData)
                    setShowModal(true);
                }
                setLocalStorageToggle(true)
            } else {
                const start = moment().clone().startOf('month');
                const end = moment(date_today).subtract(0, "day");
                setStartDate(start);
                setEndDate(end);
                getReport("", start, end);
            }
        }
        // eslint-disable-next-line
    }, [localStorageToggle, localStorage.getItem("filter")]);

    // sort function
    const handleRequestSort = (name) => {
        const isAsc = (orderBy === name && order === "asc");

        setOrderBy(name)
        setOrder(isAsc ? "desc" : "asc")
    }

    const descendingComparator = (a, b, orderBy) => {
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
        return order === "desc" ? (a, b) => descendingComparator(a, b, orderBy) : (a, b) => -descendingComparator(a, b, orderBy)
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
        setUser_id(e.target.value)
    }

    const handleCallback = (start, end, label) => {
        setStartDate(start._d)
        setEndDate(end._d);
        permission && permission.name.toLowerCase() !== "admin" && getReport(user_id, start._d, end._d)
    }

    const generateReport = () => {
        getReport(user_id, startDate, endDate)
    }

    // modal show 
    const handleShow = (val) => {
        setShow(true)
        setDescription(val)
    }
    // modal Hide 
    const handleClose = () => {
        setShow(false)
        setShowModal(false);
        setNewRecord("");
        localStorage.removeItem("filter")
        localStorage.removeItem("data")
    }

    // approved request
    const acceptRequest = async (e) => {
        e && e.preventDefault();
        const { userId, date, totalHours, work, wortReportId, _id, extraWork, extraTotalHours } = newRecord;

        let url = "";
        const payload = {
            userId: userId,
            date: date,
            totalHours: totalHours,
            work: work,
            extraWork: extraWork,
            extraTotalHours: extraTotalHours,
            _id
        };

        if (wortReportId) {
            url = customAxios().patch(`/report/${wortReportId}`, payload)
        } else {
            url = customAxios().post('/report', payload)
        }

        setIsSubLoading(true);
        url.then(data => {
            if (data.data.success) {
                toast.success(data.data.message);
                getLeaveNotification();
                getReport(userId);
                setShowModal(false)
                setIsSubLoading(false);
                setNewRecord("");
                localStorage.removeItem("filter")
                localStorage.removeItem("data")
            }
        }).catch((error) => {
            setIsSubLoading(false);
            if (!error.response) {
                toast.error(error.message);
            } else {
                if (error.response.data.message) {
                    toast.error(error.response.data.message)
                } else {
                    setError(error.response.data.error)
                }
            }
        })
    }

    // declined request
    const declinedRequest = async () => {
        try {
            const { userId, _id } = newRecord;
            setIsSubLoading(true);
            const res = await customAxios().put(`/report_request/${_id}`, { status: "Declined" })
            if (res.data.success) {
                toast.success(res.data.message);
                getLeaveNotification();
                getReport(userId);
                setShowModal(false)
                setIsSubLoading(false);
                setNewRecord("");
                localStorage.removeItem("filter")
                localStorage.removeItem("data")
            }
        } catch (error) {
            setIsSubLoading(false)
            if (!error.response) {
                toast.error(error.message)
            } else if (error.response.data.message) {
                toast.error(error.response.data.message)
            }
        }
    }

    const totalExtraHours = useMemo(() =>
        sortRowInformation(dataFilter, getComparator(order, orderBy))
            .slice(rowsPerPage * page, rowsPerPage * page + rowsPerPage)
            .reduce((acc, cur) => acc + (cur.extraTotalHours || 0), 0),
        [dataFilter, order, orderBy, rowsPerPage, page]
    );

    const pendingTotalHours = useMemo(() => {
        if (dataFilter.length && permission && (permission.name.toLowerCase() !== "admin" || extraHoursRowToggle)) {
            return sortRowInformation(dataFilter, getComparator(order, orderBy))
                .slice(rowsPerPage * page, rowsPerPage * page + rowsPerPage)
                .reduce((acc, cur) => {
                    if (!dataFilter.some(d => d.date === cur.date && d.name) && Number(cur.totalHours)) {
                        const requiredHours = cur.leave_for ? 4.5 : 8.5;
                        acc += Math.max(0, requiredHours - parseFloat(Number(cur.totalHours).toFixed(2)));
                    }
                    return acc;
                }, 0);
        }
        return 0;
    }, [dataFilter, order, orderBy, rowsPerPage, page, permission, extraHoursRowToggle]);

    const totalHoursCount = useMemo(() => {
        if (dataFilter.length && permission && (permission.name.toLowerCase() !== "admin" || extraHoursRowToggle)) {
            return sortRowInformation(dataFilter, getComparator(order, orderBy))
                .slice(rowsPerPage * page, rowsPerPage * page + rowsPerPage)
                .reduce((acc, cur) => {
                    if (!dataFilter.some(d => d.date === cur.date && d.name) && Number(cur.totalHours)) {
                        acc += Math.max(0, parseFloat(Number(cur.totalHours).toFixed(2)));
                    }
                    return acc;
                }, 0);
        }
        return 0;
    }, [dataFilter, order, orderBy, rowsPerPage, page, permission, extraHoursRowToggle]);

    const handleClass = (val) => {
        if (val._id && !val.name && moment(val.date).format("dddd") !== "Saturday" && moment(val.date).format("dddd") !== "Sunday") {
            return ""
        } else {
            return "Leave_column"
        }
    }

    const handleStorageLeave = (val) => {
        SetLocalStorage("leave-filter", JSON.stringify({ id: val.userId, start: startDate, end: endDate }));
    }

    if (isLoading) {
        return <Spinner />;
    } else if (serverError) {
        return <Error500 />;
    } else if ((!permission || permission.permissions.list !== 1) && !permissionToggle) {
        return <Error403 />;
    }

    return (
        <motion.div className="box" initial={{ opacity: 0, transform: "translateY(-20px)" }} animate={{ opacity: 1, transform: "translateY(0px)" }} transition={{ duration: 0.5 }}>
            <div className=" container-fluid py-4">
                <div className="background-wrapper bg-white pb-4">
                    <div>
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
                                    <NavLink to="/work-report/request-view" className="btn btn-gradient-primary btn-rounded btn-fw text-center">View Request</NavLink>
                                    {permission && permission.name.toLowerCase() !== "admin" && <WorkReportModal permission={permission && permission} getReport={getReport} isRequest={true} setuser_id={setUser_id} />}
                                    <WorkReportModal permission={permission && permission} getReport={getReport} setuser_id={setUser_id} />
                                    {permission && permission.name.toLowerCase() === "admin" && <DowlonadReport />}
                                </div>
                            </div>
                        </div>
                        <div className='container-fluid'>
                            <div className='row'>
                                {permission && permission.name.toLowerCase() === "admin" &&
                                    <div className='col-12 col-sm-6 col-md-4 col-lg-4 col-xl-4 col-xxl-4 pr-lg-0'>
                                        <div className="form-group mb-0">
                                            <select className="form-control mt-3" id="employee" name='data' value={user_id} onChange={userChange} >
                                                <option value="">All</option>
                                                {userName.map((val) => {
                                                    return (
                                                        val?.role?.toLowerCase() !== "admin" && <option key={val._id} value={val._id}>{val.name}</option>
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
                                    <div className='col-12 col-sm-6 col-md-4 col-lg-4 col-xl-4 col-xxl-4 px-lg-0'>
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
                                        <TableCell>
                                            <TableSortLabel active={orderBy === "date"} direction={orderBy === "date" ? order : "asc"} onClick={() => handleRequestSort("date")}>
                                                Date
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell>
                                            Day
                                        </TableCell>
                                        {permission && permission.name.toLowerCase() === "admin" && <TableCell>
                                            Employee
                                        </TableCell>}
                                        <TableCell>
                                            <TableSortLabel active={orderBy === "totalHours"} direction={orderBy === "totalHours" ? order : "asc"} onClick={() => handleRequestSort("totalHours")}>
                                                Total Hours
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell>
                                            <TableSortLabel active={orderBy === "extraTotalHours"} direction={orderBy === "extraTotalHours" ? order : "asc"} onClick={() => handleRequestSort("extraTotalHours")}>
                                                Extra Hours
                                            </TableSortLabel>
                                        </TableCell>
                                        {permission && (permission.permissions.update === 1 || permission.permissions.view === 1) &&
                                            <TableCell>
                                                Action
                                            </TableCell>}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {dataFilter.length !== 0 ?
                                        sortRowInformation(dataFilter, getComparator(order, orderBy)).slice(rowsPerPage * page, rowsPerPage * page + rowsPerPage).map((val, ind) => {
                                            return (
                                                <React.Fragment key={ind}>
                                                    <TableRow>
                                                        <TableCell className={handleClass(val)}>{moment(val.date).format("DD MMM YYYY")}</TableCell>
                                                        <TableCell className={handleClass(val)}>{moment(val.date).format("dddd")}</TableCell>
                                                        {permission && permission.name.toLowerCase() === "admin" &&
                                                            <TableCell>
                                                                <div className='pr-3'>
                                                                    {val.user ? <NavLink to={"/employees/view/" + val.userId} className={`${val.user.status === "Inactive" || handleClass(val) ? 'user-status-inactive' : 'name_col'}`}>{val.user?.first_name.concat(" ", val.user.last_name)}</NavLink> : <HiOutlineMinus />}
                                                                </div>
                                                            </TableCell>
                                                        }
                                                        {val.name ? <>
                                                            <TableCell colSpan={2} align="center" className="Leave_column">
                                                                {permission && permission.name.toLowerCase() === "admin" ?
                                                                    <NavLink to={"/leave-report"} className="user-status-inactive" onClickCapture={() => handleStorageLeave(val)}>{val?.leave_for?.concat(" ", val.name)}</NavLink> :
                                                                    val?.leave_for?.concat(" ", val.name)
                                                                }
                                                            </TableCell>
                                                        </> :
                                                            <>
                                                                <TableCell className={handleClass(val)}>
                                                                    {parseFloat(Number(val.totalHours).toFixed(2))}{val.leave_for && (permission && permission.name.toLowerCase() === "admin" ?
                                                                        <NavLink to={"/leave-report"} className="user-status-inactive" onClickCapture={() => handleStorageLeave(val)}>({val?.leave_for})</NavLink> :
                                                                        (val?.leave_for)
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className={handleClass(val)}>{val.extraTotalHours ? val.extraTotalHours : 0}</TableCell>
                                                            </>}
                                                        <TableCell align="center">
                                                            <div className="action">
                                                                {!val.name && val._id ? <>
                                                                    <i className="fa-solid fa-eye" onClick={() => handleShow(val)}></i>
                                                                    <WorkReportModal permission={permission && permission} getReport={getReport} data={val} isRequest={!((permission && permission.name.toLowerCase() === "admin") || matchDate.includes(moment(val.date).format("YYYY-MM-DD")))} setuser_id={setUser_id} />
                                                                </> :
                                                                    <HiOutlineMinus className="Leave_column" />
                                                                }
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                </React.Fragment>
                                            )
                                        }) :
                                        <TableRow>
                                            <TableCell colSpan={7} align="center">
                                                No Records Found
                                            </TableCell>
                                        </TableRow>
                                    }
                                </TableBody>
                                {dataFilter.length !== 0 && permission && (permission.name.toLowerCase() !== "admin" || extraHoursRowToggle) &&
                                    <TableFooter>
                                        <TableRow>
                                            <TableCell component={"th"} style={{ fontSize: "unset" }} colSpan={2} align="left">Total :</TableCell>
                                            {permission && permission.name.toLowerCase() === "admin" && <TableCell></TableCell>}
                                            <TableCell component={"th"} style={{ fontSize: "unset" }} align="left">{parseFloat(Number(totalHoursCount).toFixed(2))}</TableCell>
                                            <TableCell component={"th"} style={{ fontSize: "unset" }} colSpan={2} align="left">{parseFloat(Number(totalExtraHours - pendingTotalHours).toFixed(2))}</TableCell>
                                        </TableRow>
                                    </TableFooter>}
                            </Table>
                        </TableContainer>
                        <TablePagination rowsPerPageOptions={[5, 10, 15, 25, 50, 100]}
                            component="div"
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            rowsPerPage={rowsPerPage}
                            count={dataFilter.length}
                            page={page}>
                        </TablePagination>
                    </div>
                </div>
            </div>

            {/* view description modal */}
            {show &&
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
                                {description?.work?.map((currElem, ind) => {
                                    return <div className="card-body table_section pb-0" key={currElem._id}>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <h4 className="mb-0">{ind + 1}. {currElem.project?.name}</h4>
                                            <h5 className="mb-0">{currElem.hours}h</h5>
                                        </div>
                                        <hr />
                                        <div className="report-description-preview" dangerouslySetInnerHTML={{ __html: currElem.description }}></div>
                                    </div>
                                })}
                                {description?.extraWork?.map((currElem, ind) => {
                                    return <div className="card-body table_section pb-0" key={currElem._id}>
                                        {ind === 0 && <label style={{ color: "#0a4a92", fontWeight: 500, fontSize: "15px", borderBottom: "2px solid", marginBottom: "1rem" }}>Extra Work Detail</label>}
                                        <div className="d-flex justify-content-between align-items-center">
                                            <h4 className="mb-0">{ind + 1}. {currElem.project?.name}</h4>
                                            <h5 className="mb-0">{currElem.hours}h</h5>
                                        </div>
                                        <hr />
                                        <div className="report-description-preview" dangerouslySetInnerHTML={{ __html: currElem.description }}></div>
                                    </div>
                                })}
                            </div>
                        </div>
                    </Modal.Body>
                </Modal>}

            {/* request data */}
            {showModal &&
                <Modal
                    show={showModal}
                    animation={true}
                    size="md"
                    aria-labelledby="example-modal-sizes-title-sm"
                    className="department-modal work-report-view-modal"
                    centered
                >
                    <Modal.Header className="small-modal">
                        <Modal.Title>
                            {newRecord.title} - {moment(newRecord.date).format("DD MMM YYYY")}
                        </Modal.Title>
                        <p className="close-modal" onClick={handleClose}>
                            <i className="fa-solid fa-xmark"></i>
                        </p>
                    </Modal.Header>
                    <Modal.Body>
                        <div className=" grid-margin stretch-card inner-pages mb-lg-0">
                            <div className="card">
                                {newRecord && newRecord.work.map((val) => {
                                    return (
                                        <div className="card-body table_section pb-0" key={val._id}>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <h4 className="mb-0">{val?.project?.name}</h4>
                                                <h5 className="mb-0">{val.hours}h</h5>
                                            </div>
                                            <hr />
                                            <div className="report-description-preview" dangerouslySetInnerHTML={{ __html: val.description }}></div>
                                        </div>
                                    )
                                })}
                                {newRecord && newRecord.extraWork.map((val, ind) => {
                                    return (
                                        <div className="card-body table_section pb-0" key={val._id}>
                                            {ind === 0 && <label style={{ color: "#0a4a92", fontWeight: 500, fontSize: "15px", borderBottom: "2px solid", marginBottom: "1rem" }}>Extra Work Detail</label>}
                                            <div className="d-flex justify-content-between align-items-center">
                                                <h4 className="mb-0">{val?.project?.name}</h4>
                                                <h5 className="mb-0">{val.hours}h</h5>
                                            </div>
                                            <hr />
                                            <div className="report-description-preview" dangerouslySetInnerHTML={{ __html: val.description }}></div>
                                        </div>
                                    )
                                })}
                                {error.length !== 0 &&
                                    <div className="row mx-0 mt-2 mb-0">
                                        <div className="col-md-12">
                                            <ErrorComponent errors={error} />
                                        </div>
                                    </div>
                                }
                                <div className='d-flex justify-content-center modal-button m-3'>
                                    <button type="submit" className="btn btn-gradient-primary mr-2" onClick={acceptRequest} >Approve</button>
                                    <button className="btn btn-light" onClick={declinedRequest}>Decline</button>
                                </div>
                            </div>
                        </div>
                    </Modal.Body>
                    {isSubLoading && <Spinner />}
                </Modal>}
        </motion.div >)
};

export default WorkReportComponent;