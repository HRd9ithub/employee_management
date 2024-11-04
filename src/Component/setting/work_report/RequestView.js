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
import Modal from "react-bootstrap/Modal";
import { customAxios } from "../../../service/CreateApi";
import { AppProvider } from "../../context/RouteContext";
import ranges from "../../../helper/calcendarOption";
import ErrorComponent from "../../common/ErrorComponent";
import usePagination from "../../../hooks/usePagination";

const RequestView = () => {
  const date_today = new Date();
  // eslint-disable-next-line
  const [data, setData] = useState([]);
  const [dataFilter, setDataFilter] = useState([]);
  const [permission, setpermission] = useState("");
  const [isLoading, setisLoading] = useState(false);
  const [isSubLoading, setisSubLoading] = useState(false);
  const [startDate, setStartDate] = useState(moment(date_today).subtract(1, "day"));
  const [endDate, setendtDate] = useState(moment(date_today).subtract(1, "day"));
  const [user_id, setuser_id] = useState("");
  const [show, setShow] = useState(false)
  const [serverError, setServerError] = useState(false);
  const [description, setdescription] = useState({});
  const [permissionToggle, setPermissionToggle] = useState(true);
  const [error, setError] = useState([]);

  const statusList = ["Approved", "Declined"]

  let { get_username, userName, getLeaveNotification } = useContext(AppProvider);

  // pagination state
  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage, setPage } = usePagination(50);

  // sort state
  const [order, setOrder] = useState("asc")
  const [orderBy, setOrderBy] = useState("date")

  // get report data
  const getRequestReport = async (id, start, end) => {
    start && setStartDate(start);
    end && setendtDate(end);
    setisLoading(true);
    setPermissionToggle(true);
    setServerError(false);
    customAxios().get(`/report/report-request-data?startDate=${moment(start || startDate).format("YYYY-MM-DD")}&endDate=${moment(end || endDate).format("YYYY-MM-DD")}&id=${id ? id : ""} `).then((result) => {
      if (result.data.success) {
        setPage(0);
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
    }).finally(() => setPermissionToggle(false));
  };

  useEffect(() => {
    const start = moment().clone().startOf('month');
    const end = moment(date_today);
    get_username();
    getRequestReport("", start, end);
  }, []);

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
    permission && permission.name.toLowerCase() !== "admin" && getRequestReport(user_id, start._d, end._d)
  }

  const generateReport = () => {
    getRequestReport(user_id, startDate, endDate)
  }

  // modal show 
  const handleShow = (val) => {
    setShow(true)
    setdescription(val)
  }

  // modal Hide 
  const handleClose = () => {
    setShow(false)
    setdescription({});
  }

  // approved request
  const acceptRequest = async (e) => {
    e && e.preventDefault();
    const { userId, date, totalHours, work, wortReportId, _id, extraWork, extraTotalHours } = description;

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

    setisSubLoading(true);
    url.then(data => {
      if (data.data.success) {
        toast.success(data.data.message);
        !description.deleteAt && getLeaveNotification();
        getRequestReport();
        setShow(false)
        setisSubLoading(false);
      }
    }).catch((error) => {
      setisSubLoading(false);
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
      const { _id } = description;
      setisSubLoading(true);
      const res = await customAxios().put(`/report_request/${_id}`, { status: "Declined" })
      if (res.data.success) {
        toast.success(res.data.message);
        !description.deleteAt && getLeaveNotification();
        getRequestReport();
        setShow(false)
        setisSubLoading(false);
      }
    } catch (error) {
      setisSubLoading(false)
      if (!error.response) {
        toast.error(error.message)
      } else if (error.response.data.message) {
        toast.error(error.response.data.message)
      }
    }
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
              <div className="col-12 col-sm-7 col-xl-9 d-flex justify-content-between align-items-center">
                <div>
                  <ul id="breadcrumb" className="mb-0">
                    <li><NavLink to="/" className="ihome">Dashboard</NavLink></li>
                    <li><NavLink to="/work-report/employee" className="ibeaker"><i className="fa-solid fa-play"></i> &nbsp; Work Report</NavLink></li>
                    <li><NavLink to="" className="ibeaker"><i className="fa-solid fa-play"></i> &nbsp; Request List</NavLink></li>
                  </ul>
                </div>
              </div>
              <div className="col-12 col-sm-5 col-xl-3 d-flex justify-content-end" id="two">
                <div className="d-flex justify-content-end align-items-center w-100" style={{ gap: '15px' }}>
                  <NavLink to="/work-report/employee" className="btn btn-gradient-primary btn-rounded btn-fw text-center"><i className="fa-solid fa-arrow-left"></i>&nbsp; Back</NavLink>
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
                      <i className="fa-solid fa-plus" ></i>&nbsp;Generate Request List
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
                    <TableCell>
                      <TableSortLabel active={orderBy === "title"} direction={orderBy === "title" ? order : "asc"} onClick={() => handleRequestSort("title")}>
                        Request
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
                  {dataFilter.length !== 0 ?
                    sortRowInformation(dataFilter, getComparator(order, orderBy)).slice(rowsPerPage * page, rowsPerPage * page + rowsPerPage).map((val, ind) => {
                      return (
                        <TableRow key={ind} >
                          {val.name ?
                            <TableCell colSpan={7} align="center" className="Leave_column">{moment(val.date).format("DD MMM YYYY").concat(" - ", val.name)}({val.leave_for}){permission && permission.name.toLowerCase() === "admin" && val.user && " - " + val.user?.first_name.concat(" ", val.user.last_name)}</TableCell>
                            :
                            <>
                              <TableCell>{moment(val.date).format("DD MMM YYYY")}</TableCell>
                              {permission && permission.name.toLowerCase() === "admin" &&
                                <TableCell>
                                  <div className='pr-3'>
                                    {val.user ? <NavLink to={"/employees/view/" + val.userId} className={`${val.user.status === "Inactive" ? 'user-status-inactive' : 'name_col'}`}>{val.user?.first_name.concat(" ", val.user.last_name)}</NavLink> : <HiOutlineMinus />}
                                  </div>
                                </TableCell>
                              }
                              <TableCell>{parseFloat(Number(val.totalHours).toFixed(2))}{val.leave_for && <span className="text-red"> ({val.leave_for})</span>}</TableCell>
                              <TableCell>{val.extraTotalHours ? val.extraTotalHours : <HiOutlineMinus />}</TableCell>
                              <TableCell>{val.title}</TableCell>
                              <TableCell><button className={`${val.status === "Declined" ? "btn-gradient-danger" : val.status === "Approved" ? "btn-gradient-success" : val.status === "Pending" ? "btn-gradient-secondary" : "btn-gradient-info"} btn status-label`} style={{ cursor: "default" }}>{val.status}</button></TableCell>
                              <TableCell align="center">
                                <div className='action'>
                                  <i className="fa-solid fa-eye" onClick={() => handleShow(val)}></i>
                                </div>
                              </TableCell>
                            </>}
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
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPage={rowsPerPage}
              count={dataFilter.length}
              page={page}>
            </TablePagination>
          </div>
        </div>
      </div>

      {/* view Detail model */}
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
              Request Detail
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

                {error.length !== 0 &&
                  <div className="row mx-0 mt-2 mb-0">
                    <div className="col-md-12">
                      <ErrorComponent errors={error} />
                    </div>
                  </div>
                }
                {!statusList.includes(description.status) && permission && permission?.name?.toLowerCase() === "admin" &&
                  <div className='d-flex justify-content-center modal-button m-3'>
                    <button type="submit" className="btn btn-gradient-primary mr-2" onClick={acceptRequest} >Approve</button>
                    <button className="btn btn-light" onClick={declinedRequest}>Decline</button>
                  </div>}
              </div>
            </div>
          </Modal.Body>
          {isSubLoading && <Spinner />}
        </Modal>}
    </motion.div >)
};

export default RequestView;