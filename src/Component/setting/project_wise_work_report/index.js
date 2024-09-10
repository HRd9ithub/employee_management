import React, { useEffect, useState, useLayoutEffect } from "react";
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
import ranges from "../../../helper/calcendarOption";
import usePagination from "../../../hooks/usePagination";

const ProjectWorkReportComponent = () => {
  const date_today = new Date();
  const startMonthDate = moment().startOf('month').format('YYYY-MM-DD');

  const [dataFilter, setDataFilter] = useState([]);
  const [permission, setPermission] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState(moment(date_today).subtract(1, "day"));
  const [endDate, setEndDate] = useState(moment(date_today).subtract(1, "day"));
  const [projectId, setProjectId] = useState("");
  const [show, setShow] = useState(false);
  const [serverError, setServerError] = useState(false);
  const [description, setDescription] = useState({});
  const [permissionToggle, setPermissionToggle] = useState(true);
  const [project, setProject] = useState([]);

  // Pagination state
  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } = usePagination(50);

  // Sort state
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("date");

  // Fetch report data
  const getWorkReportsByProject = async () => {
    setIsLoading(true);
    setPermissionToggle(true);
    setServerError(false);

    try {
      const result = await customAxios().get(`/report/project-wise`, {
        params: {
          startDate: moment(startDate).format("YYYY-MM-DD"),
          endDate: moment(endDate).format("YYYY-MM-DD"),
          projectId
        }
      });

      if (result.data.success) {
        setPermission(result.data.permissions);
        setDataFilter(result.data.data);
      }
    } catch (error) {
      if (!error.response) {
        setServerError(true);
        toast.error(error.message);
      } else {
        if (error.response.status === 500) {
          setServerError(true);
        }
        if (error.response.data.message) {
          toast.error(error.response.data.message);
        }
      }
    } finally {
      setIsLoading(false);
      setPermissionToggle(false);
    }
  };

  // Fetch project data
  const getProject = async () => {
    setIsLoading(true);
    try {
      const res = await customAxios().get('/project?key="project');
      if (res.data.success) {
        setProject(res.data.data);
      }
    } catch (error) {
      if (!error.response) {
        toast.error(error.message);
      } else {
        if (error.response.data.message) {
          toast.error(error.response.data.message);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  useLayoutEffect(() => {
    getProject();
  }, []);

  useEffect(() => {
    getWorkReportsByProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sort functions
  const handleRequestSort = (name) => {
    const isAsc = (orderBy === name && order === "asc");
    setOrderBy(name);
    setOrder(isAsc ? "desc" : "asc");
  };

  const descendingComparator = (a, b, orderBy) => {
    if (orderBy === "name") {
      return (b.user?.first_name?.concat(" ", b.user?.last_name) < a.user?.first_name?.concat(" ", a.user?.last_name)) ? -1 : 1;
    } else if (orderBy === "extraWork") {
      return (b[orderBy]?.hours < a[orderBy]?.hours) ? -1 : 1;
    } else {
      return (b[orderBy] < a[orderBy]) ? -1 : 1;
    }
  };

  const getComparator = (order, orderBy) => {
    return order === "desc"
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  };

  const sortRowInformation = (array, comparator) => {
    const rowArray = array.map((elem, ind) => [elem, ind]);
    rowArray.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return rowArray.map((el) => el[0]);
  };

  // Event handlers
  const handleChangeProject = (e) => {
    setProjectId(e.target.value);
  };

  const handleCallback = (start, end, label) => {
    setStartDate(start._d);
    setEndDate(end._d);
  };

  const generateReport = () => {
    getWorkReportsByProject();
  };

  const handleShow = (val) => {
    setShow(true);
    setDescription(val);
  };

  const handleClose = () => {
    setShow(false);
    setDescription({});
  };

  if (isLoading) return <Spinner />;
  if (serverError) return <Error500 />;
  if ((!permission || permission.permissions.list !== 1) && !permissionToggle) return <Error403 />;

  return (
    <motion.div className="box" initial={{ opacity: 0, transform: "translateY(-20px)" }} animate={{ opacity: 1, transform: "translateY(0px)" }} transition={{ duration: 0.5 }}>
      <div className="container-fluid py-4">
        <div className="background-wrapper bg-white pb-4">
          {/* Header */}
          <div className="row justify-content-end align-items-center row-std m-0">
            <div className="col-12 col-sm-6 col-xl-4 d-flex justify-content-between align-items-center">
              <ul id="breadcrumb" className="mb-0">
                <li><NavLink to="/" className="ihome">Dashboard</NavLink></li>
                <li><NavLink to="" className="ibeaker"><i className="fa-solid fa-play"></i> &nbsp;Work Report by Project</NavLink></li>
              </ul>
            </div>
            <div className="col-12 col-sm-6 col-xl-8 d-flex justify-content-end" id="two">
              <div className="d-flex justify-content-end align-items-center w-100" style={{ gap: '15px' }}>
                <div className="search-full w-25 pr-0 hide-at-small-screen">
                  <div className="form-group mb-0">
                    <select className="form-control mb-0" id="project" name='projectId' value={projectId} onChange={handleChangeProject}>
                      <option value="">Select project</option>
                      {project.map((val) => (
                        <option key={val._id} value={val._id}>{val.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-group mb-0 position-relative w-25 hide-at-small-screen">
                  <DateRangePicker
                    initialSettings={{ startDate, endDate, ranges, maxDate: new Date() }}
                    onCallback={handleCallback}
                  >
                    <input className="form-control mb-0" />
                  </DateRangePicker>
                  <CalendarMonthIcon className="range_icon" />
                </div>
                <button
                  className='btn btn-gradient-primary btn-rounded btn-fw text-center hide-at-small-screen'
                  onClick={generateReport}
                >
                  <i className="fa-solid fa-plus"></i>&nbsp;Generate Report
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Header */}
          <div className='container-fluid show-at-small-screen'>
            <div className='row'>
              <div className='col-12 col-sm-6 col-md-4 col-lg-4 col-xl-4 col-xxl-4'>
                <div className="form-group mb-0">
                  <select className="form-control mt-3" id="project" name='projectId' value={projectId} onChange={handleChangeProject}>
                    <option value="">All</option>
                    {project.map((val) => (
                      <option key={val._id} value={val._id}>{val.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className='col-12 col-sm-6 col-md-4 col-lg-4 col-xl-4 col-xxl-4 ml-auto'>
                <div className="form-group mb-0 position-relative">
                  <DateRangePicker
                    initialSettings={{ startDate, endDate, ranges, maxDate: new Date() }}
                    onCallback={handleCallback}
                  >
                    <input className="form-control mt-3" />
                  </DateRangePicker>
                  <CalendarMonthIcon className="range_icon" />
                </div>
              </div>
              <div className='col-12 col-sm-6 col-md-4 col-lg-4 col-xl-4 col-xxl-4'>
                <button
                  className='btn btn-gradient-primary btn-rounded btn-fw text-center mt-3'
                  onClick={generateReport}
                >
                  <i className="fa-solid fa-plus"></i>&nbsp;Generate Report
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="mx-4">
            <TableContainer>
              <Table className="common-table-section">
                <TableHead className="common-header">
                  <TableRow>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === "date"}
                        direction={orderBy === "date" ? order : "asc"}
                        onClick={() => handleRequestSort("date")}
                      >
                        Date
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === "name"}
                        direction={orderBy === "name" ? order : "asc"}
                        onClick={() => handleRequestSort("name")}
                      >
                        Employee
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === "totalHours"}
                        direction={orderBy === "totalHours" ? order : "asc"}
                        onClick={() => handleRequestSort("totalHours")}
                      >
                        Total Hours
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === "extraWork"}
                        direction={orderBy === "extraWork" ? order : "asc"}
                        onClick={() => handleRequestSort("extraWork")}
                      >
                        Extra Hours
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="center">Description</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dataFilter.length !== 0 ?
                    sortRowInformation(dataFilter, getComparator(order, orderBy))
                      .slice(rowsPerPage * page, rowsPerPage * page + rowsPerPage)
                      .map((val, ind) => (
                        <TableRow key={ind}>
                          <TableCell>{val.date && moment(val.date).format("DD MMM YYYY")}</TableCell>
                          <TableCell>
                            <div className='pr-3'>
                              {val.user
                                ? <NavLink className={`${val.user.status === "Inactive" ? 'user-status-inactive' : 'name_col'}`}>
                                  {val.user?.first_name.concat(" ", val.user?.last_name)}
                                </NavLink>
                                : <HiOutlineMinus />}
                            </div>
                          </TableCell>
                          <TableCell>
                            {val.totalHours}
                            {val.leave_for && <span className="text-red"> ({val.leave_for})</span>}
                          </TableCell>
                          <TableCell>
                            {val.extraWork?.hours ? val.extraWork?.hours : <HiOutlineMinus />}
                          </TableCell>
                          <TableCell align="center">
                            <NavLink to="" onClick={() => handleShow(val)}>View</NavLink>
                          </TableCell>
                        </TableRow>
                      ))
                    :
                    <TableRow>
                      <TableCell colSpan={5} align="center">No Records Found</TableCell>
                    </TableRow>
                  }
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 15, 25, 50, 100]}
              component="div"
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPage={rowsPerPage}
              count={dataFilter.length}
              page={page}
            />
          </div>
        </div>
      </div>

      {/* View description modal */}
      <Modal
        show={show}
        animation={true}
        size="md"
        aria-labelledby="example-modal-sizes-title-sm"
        className="department-modal work-report-view-modal"
        centered
      >
        <Modal.Header className="small-modal">
          <Modal.Title>View Description</Modal.Title>
          <p className="close-modal" onClick={handleClose}>
            <i className="fa-solid fa-xmark"></i>
          </p>
        </Modal.Header>
        <Modal.Body>
          <div className="grid-margin stretch-card inner-pages mb-lg-0">
            <div className="card">
              {description?.work?.map((currElem, ind) => (
                <div className="card-body table_section pb-0" key={currElem._id}>
                  <div className="d-flex justify-content-between align-items-center">
                    <h4 className="mb-0">{ind + 1}. {currElem.project?.name}</h4>
                    <h5 className="mb-0">{currElem.hours}h</h5>
                  </div>
                  <hr />
                  <div className="report-description-preview" dangerouslySetInnerHTML={{ __html: currElem.description }}></div>
                </div>
              ))}
              {(description.extraWork && Object.keys(description.extraWork).length !== 0) && (
                <div style={{ padding: "1rem 2.5rem" }}>
                  <label style={{ color: "#0a4a92", fontWeight: 500, fontSize: "15px", borderBottom: "2px solid", marginBottom: "1rem" }}>
                    Extra Work Detail
                  </label>
                  <div className="d-flex justify-content-between align-items-center">
                    {description.extraWork?.project && <h4 className="mb-0">1. {description.extraWork?.project?.name}</h4>}
                    <h5 className="mb-0">{description?.extraWork?.hours}h</h5>
                  </div>
                  <hr />
                  <div className="report-description-preview" dangerouslySetInnerHTML={{ __html: description?.extraWork?.description }}></div>
                </div>
              )}
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </motion.div>
  );
};

export default ProjectWorkReportComponent;
