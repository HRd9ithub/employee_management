/* eslint-disable react-hooks/exhaustive-deps */
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
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { customAxios } from "../../../service/CreateApi";
import { AppProvider } from "../../context/RouteContext";
import ranges from "../../../helper/calcendarOption";
import usePagination from "../../../hooks/usePagination";
import { GetLocalStorage, RemoveLocalStorage } from "../../../service/StoreLocalStorage";

const LeaveReport = () => {
  const [dataFilter, setDataFilter] = useState([]);
  const [permission, setPermission] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState(moment().clone().startOf('month'));
  const [endDate, setEndDate] = useState(moment().clone().endOf('month'));
  const [user_id, setUser_id] = useState("");
  const [serverError, setServerError] = useState(false);
  const [permissionToggle, setPermissionToggle] = useState(true);

  let { get_username, userName } = useContext(AppProvider);

  // pagination state
  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage, setPage } = usePagination(50);

  // sort state
  const [order, setOrder] = useState("asc")
  const [orderBy, setOrderBy] = useState("date")

  // get report data
  const getReport = async (id, start, end) => {

    setIsLoading(true);
    setPermissionToggle(true);
    setServerError(false);

    try {
      const response = await customAxios().get(
        `/leave/report?startDate=${moment(start || startDate).format("YYYY-MM-DD")}&endDate=${moment(end || endDate).format("YYYY-MM-DD")}&id=${id || ""}`
      );

      if (response.data.success) {
        setPage(0);
        setPermission(response.data.permissions);
        setDataFilter(response.data.data);
        RemoveLocalStorage("leave-filter");
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
    get_username();
    const leaveFilter = GetLocalStorage("leave-filter");
    if (leaveFilter) {
      const { id, start, end } = JSON.parse(leaveFilter);
      setUser_id(id);
      setStartDate(new Date(start));
      setEndDate(new Date(end));
      getReport(id, start, end);
    } else {
      getReport();
    }
  }, []);

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
            <div className='row justify-content-start align-items-center row-std m-0'>
              <div className="col-12 col-sm-5 col-xl-3 d-flex justify-content-between align-items-center">
                <div>
                  <ul id="breadcrumb" className="mb-0">
                    <li><NavLink to="/" className="ihome">Dashboard</NavLink></li>
                    <li><NavLink to="" className="ibeaker"><i className="fa-solid fa-play"></i> &nbsp; Leave Report</NavLink></li>
                  </ul>
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
                    <TableCell>id</TableCell>
                    {(permission && permission.name?.toLowerCase() === "admin") && <>
                      <TableCell>
                        <TableSortLabel active={orderBy === "name"} direction={orderBy === "name" ? order : "asc"} onClick={() => handleRequestSort("name")}>
                          Employee
                        </TableSortLabel>
                      </TableCell>
                    </>}
                    <TableCell>
                      <TableSortLabel active={orderBy === "leaveType"} direction={orderBy === "leaveType" ? order : "asc"} onClick={() => handleRequestSort("leaveType")}>
                        Leave Type
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel active={orderBy === "from_date"} direction={orderBy === "from_date" ? order : "asc"} onClick={() => handleRequestSort("from_date")}>
                        from
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel active={orderBy === "to_date"} direction={orderBy === "to_date" ? order : "asc"} onClick={() => handleRequestSort("to_date")}>
                        To
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel active={orderBy === "duration"} direction={orderBy === "duration" ? order : "asc"} onClick={() => handleRequestSort("duration")}>
                        Duration
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel active={orderBy === "leave_for"} direction={orderBy === "leave_for" ? order : "asc"} onClick={() => handleRequestSort("leave_for")}>
                        Leave For
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel active={orderBy === "reason"} direction={orderBy === "reason" ? order : "asc"} onClick={() => handleRequestSort("reason")}>
                        Reason
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel active={orderBy === "createdAt"} direction={orderBy === "createdAt" ? order : "asc"} onClick={() => handleRequestSort("createdAt")}>
                        Applied on
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      Status
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dataFilter.length !== 0 ? sortRowInformation(dataFilter, getComparator(order, orderBy)).slice(rowsPerPage * page, rowsPerPage * page + rowsPerPage).map((val, ind) => {
                    return (
                      <TableRow key={ind}>
                        <TableCell>{rowsPerPage * page + ind + 1}</TableCell>
                        {(permission && permission.name?.toLowerCase() === "admin") &&
                          <TableCell>
                            <div className='pr-3'>
                              {val.user ? <NavLink to={"/employees/view/" + val.user_id} className={`${val.user.status === "Inactive" ? 'user-status-inactive' : 'name_col'}`}>{val.user?.first_name.concat(" ", val.user.last_name)}</NavLink> : <HiOutlineMinus />}
                            </div>
                          </TableCell>
                        }
                        <TableCell>{val.leaveType ? val.leaveType : <HiOutlineMinus />}</TableCell>
                        <TableCell>{moment(val.from_date).format("DD MMM YYYY")}</TableCell>
                        <TableCell>{moment(val.to_date).format("DD MMM YYYY")}</TableCell>
                        <TableCell>{val.duration}</TableCell>
                        <TableCell>{val.leave_for}</TableCell>
                        <TableCell>{val.reason}</TableCell>
                        <TableCell>{moment(val.createdAt).format("DD MMM YYYY")}</TableCell>
                        <TableCell>
                          <button className={`${val.status === "Declined" ? "btn-gradient-danger" : val.status === "Approved" ? "btn-gradient-success" : val.status === "Pending" ? "btn-gradient-secondary" : "btn-gradient-info"} btn status-label`} style={{ cursor: "default" }} >{val.status}</button>
                        </TableCell>
                      </TableRow>
                    )
                  }) :
                    <TableRow>
                      <TableCell colSpan={11} align="center">
                        No Records Found
                      </TableCell>
                    </TableRow>
                  }
                </TableBody>
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
    </motion.div >)
};

export default LeaveReport;