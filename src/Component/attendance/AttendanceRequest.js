import React, { useState, useEffect, useContext } from 'react'
import { NavLink } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from "framer-motion";
import { Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel } from "@mui/material";
import moment from 'moment';
import { customAxios } from '../../service/CreateApi';
import Spinner from "../common/Spinner";
import Error500 from '../error_pages/Error500';
import DateRangePicker from 'react-bootstrap-daterangepicker';
import 'bootstrap-daterangepicker/daterangepicker.css';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ranges from '../../helper/calcendarOption';
import Error403 from '../error_pages/Error403';
import { AppProvider } from '../context/RouteContext';
import usePagination from '../../hooks/usePagination';
import { HiOutlineMinus } from 'react-icons/hi';
import { Modal } from 'react-bootstrap';

const AttendanceRequest = () => {
  const [isLoading, setisLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [permission, setpermission] = useState("");
  const [permissionToggle, setPermissionToggle] = useState(true);
  const [serverError, setServerError] = useState(false);
  const [startDate, setStartDate] = useState(moment().clone().startOf('month'));
  const [endDate, setendtDate] = useState(moment(new Date(new Date().toDateString())));
  const [user_id, setuser_id] = useState("");
  const [status, setStatus] = useState("");
  const statusOption = ['Pending', "Read", "Approved", "Declined"];
  const [show, setShow] = useState(false)
  const [requestDetails, setRequestDetails] = useState({})

  // pagination state
  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } = usePagination(25);

  // sort state
  const [order, setOrder] = useState("asc")
  const [orderBy, setOrderBy] = useState("date");

  let { get_username, userName } = useContext(AppProvider);

  const getAttendanceRequestData = async () => {
    try {
      setisLoading(true);
      setPermissionToggle(true);
      setServerError(false);

      const response = await customAxios().get(`/attendance/requests?startDate=${startDate}&endDate=${endDate}&id=${user_id}&status=${status}`);

      if (response.data.success) {
        const { data, permissions } = response.data;
        setRecords(data)
        setpermission(permissions);
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
    getAttendanceRequestData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, user_id, status])

  useEffect(() => {
    get_username();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      if (b?.matched_attendance?.timestamp < a?.matched_attendance?.timestamp) {
        return -1
      }
      if (b?.matched_attendance?.timestamp > a?.matched_attendance?.timestamp) {
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

  // date range change function
  const handleCallback = (start, end, label) => {
    setStartDate(start._d)
    setendtDate(end._d);
  }

  // user onchange
  const userOnChange = (event) => {
    setuser_id(event.target.value)
  }
  const handleChangeStatus = (event) => {
    setStatus(event.target.value)
  }

  // modal show 
  const handleShow = (val) => {
    setShow(true)
    setRequestDetails(val)
  }
  // modal Hide 
  const handleClose = () => {
    setShow(false)
    setRequestDetails("");
  }

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

            <div className='row justify-content-end align-items-center row-std m-0 px-4'>
              <div className="col-12 col-sm-7 d-flex justify-content-between align-items-center p-0">
                <div>
                  <ul id="breadcrumb" className="mb-0">
                    <li><NavLink to="/" className="ihome">Dashboard</NavLink></li>
                    <li><NavLink to="/attendance" className="ibeaker"><i className="fa-solid fa-play"></i> &nbsp; Attendance</NavLink></li>
                    <li><NavLink to="" className="ibeaker"><i className="fa-solid fa-play"></i> &nbsp; Requests</NavLink></li>
                  </ul>
                </div>
              </div>
              <div className="col-12 col-sm-5 d-flex justify-content-end pr-0" id="two">
                <NavLink to={"/attendance"} className="btn btn-gradient-primary btn-rounded btn-fw text-center"><i className="fa-solid fa-arrow-left"></i>&nbsp;Back</NavLink>
              </div>
            </div>
            {/* table */}
            <div className="mx-4 pt-4">
              <div className="row justify-content-end">
                <div className="col-12 col-xl-9" id="two">
                  <div className="row justify-content-end">
                    <div className="col-sm-6 col-xl-4 mt-2">
                      <div className="search-full pr-0">
                        <div className="form-group mb-0">
                          <select className="form-control mb-0" id="status" name='status' value={status} onChange={handleChangeStatus}>
                            <option value="">All</option>
                            {statusOption.map((val, i) => {
                              return (
                                <option key={i} value={val}>{val}</option>
                              )
                            })}
                          </select>
                        </div>
                      </div>
                    </div>
                    {permission && permission.name.toLowerCase() === "admin" &&
                      <div className="col-sm-6 col-xl-4 mt-2">
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
                        </div>
                      </div>}
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
                <Table className="common-table-section">
                  <TableHead className="common-header">
                    <TableRow>
                      <TableCell>
                        Id
                      </TableCell>
                      {permission && permission.name.toLowerCase() === "admin" && <TableCell>
                        Employee
                      </TableCell>}
                      <TableCell>
                        <TableSortLabel active={orderBy === "date"} direction={orderBy === "date" ? order : "asc"} onClick={() => handleRequestSort("date")}>
                          Attendance Date
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        Original Time
                      </TableCell>
                      <TableCell>
                        Updated Time
                      </TableCell>
                      <TableCell>
                        <TableSortLabel active={orderBy === "createdAt"} direction={orderBy === "createdAt" ? order : "asc"} onClick={() => handleRequestSort("createdAt")}>
                          Created at
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel active={orderBy === "status"} direction={orderBy === "status" ? order : "asc"} onClick={() => handleRequestSort("status")}>
                          Status
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {records.length !== 0 ? sortRowInformation(records, getComparator(order, orderBy)).slice(rowsPerPage * page, rowsPerPage * page + rowsPerPage).map((val, ind) => {
                      return (
                        <TableRow key={val._id}>
                          <TableCell>{rowsPerPage * page + ind + 1}</TableCell>
                          {permission && permission.name.toLowerCase() === "admin" &&
                            <TableCell>
                              <div className='pr-3'>
                                {val.user ? <NavLink to={"/employees/view/" + val.userId} className={`name_col'}`}>{val.user?.name}</NavLink> : <HiOutlineMinus />}
                              </div>
                            </TableCell>
                          }
                          <TableCell>{val.matched_attendance ? moment(val.matched_attendance.timestamp).format('DD MMM YYYY') : <HiOutlineMinus />}</TableCell>
                          <TableCell>
                            {val?.matched_attendance?.time
                              ? `${val.matched_attendance.time?.clock_in}${val.matched_attendance.time?.clock_out ? " - " + val.matched_attendance.time?.clock_out : " - "}` : <HiOutlineMinus />
                            }
                          </TableCell>
                          <TableCell>{val.clock_in?.concat(" - ", val.clock_out)}</TableCell>
                          <TableCell>{val.createdAt ? moment(val.createdAt).format('DD MMM YYYY') : <HiOutlineMinus />}</TableCell>
                          <TableCell><button className={`${val.status === "Declined" ? "btn-gradient-danger" : val.status === "Approved" ? "btn-gradient-success" : val.status === "Pending" ? "btn-gradient-secondary" : "btn-gradient-info"} btn status-label`} style={{ cursor: "default" }}>{val.status}</button></TableCell>
                          <TableCell>
                            <div className="action">
                              {permission && permission.name.toLowerCase() === "admin" && val.status !== "Declined" && val.status !== "Approved" &&
                                <NavLink to={`/attendance/${val.attendanceId}`} style={{ textDecoration: "none" }} >
                                  <i class="fa-solid fa-code-pull-request" title='regularize' ></i>
                                </NavLink>}
                              <i className="fa-solid fa-eye" onClick={() => handleShow(val)}></i>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    }) :
                      <TableRow>
                        <TableCell colSpan={9} align="center">
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
                count={records.length}
                page={page}>
              </TablePagination>
            </div >
          </div >
        </div>
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
                View Request
              </Modal.Title>
              <p className="close-modal" onClick={handleClose}>
                <i className="fa-solid fa-xmark"></i>
              </p>
            </Modal.Header>
            <Modal.Body>
              <div className=" grid-margin stretch-card inner-pages mb-lg-0">
                <div className="card">
                  <div className="card-body">
                    <table class="table">
                      <tbody>
                        <tr>
                          <th scope="row">Clock-in</th>
                          <td>{requestDetails.clock_in}</td>
                        </tr>
                        <tr>
                          <th scope="row">Clock-out</th>
                          <td>{requestDetails.clock_out}</td>
                        </tr>
                        <tr>
                          <th scope="row">Reason</th>
                          <td style={{ whiteSpace: "break-spaces" }}><p>{requestDetails.explanation}</p></td>
                        </tr>
                        {requestDetails.comment &&
                          <tr>
                            <th scope="row">Comment</th>
                            <td style={{ whiteSpace: "break-spaces" }}><p>{requestDetails.comment}</p></td>
                          </tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </Modal.Body>
          </Modal>}
      </motion.div>
    </>
  )
}
export default AttendanceRequest