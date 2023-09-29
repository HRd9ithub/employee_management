import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import Spinner from "../../common/Spinner";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { useContext } from "react";
import { AppProvider } from "../../context/RouteContext";
import AddEmployeeModal from "./add_form/AddEmployeeModal";
import Switch from '@mui/material/Switch';
import { HiOutlineMinus } from "react-icons/hi";
import GlobalPageRedirect from "../../auth_context/GlobalPageRedirect";
import { GetLocalStorage } from "../../../service/StoreLocalStorage";
import { Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel } from "@mui/material";
import Avatar from '@mui/material/Avatar';
import Error403 from "../../error_pages/Error403";

const Employee = ({ socket }) => {
  const [records, setRecords] = useState([]);
  // eslint-disable-next-line
  const [value, setvalue] = useState("");
  const [recordsFilter, setRecordsFilter] = useState([]);
  const [loader, setloader] = useState(false);
  const [toggle, setToggle] = useState(false);
  const [permission, setPermission] = useState("")
  let { UserData } = useContext(AppProvider);

  // pagination state
  const [count, setCount] = useState(5)
  const [page, setpage] = useState(0)

  // sort state
  const [order, setOrder] = useState("asc")
  const [orderBy, setOrderBy] = useState("employee_id")

  const history = useNavigate()

  let { getCommonApi } = GlobalPageRedirect();

  // status update function
  const handleStatus = async (row) => {
     // eslint-disable-next-line
    let { _id,email } = row;
    setloader(true);
    let config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GetLocalStorage('token')}`
      },
    }
    try {
      const res = await axios.patch(`${process.env.REACT_APP_API_KEY}/user/${_id}`, {}, config);

      if (res.data.success) {
        setToggle(!toggle);
        toast.success(res.data.message);
        // socket.emit('status',{userId:email});
      }
    } catch (error) {
      if (!error.response) {
        toast.error(error.message)
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
      setloader(false)
    }
  };

  // delete function
  const handleDelete = (id) => {
    let token = GetLocalStorage("token");
    const request = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    Swal.fire({
      title: "Delete Employee",
      text: "Are you sure you want to delete?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1bcfb4",
      cancelButtonColor: "#d33",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      width: "450px",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setloader(true);
        const res = await axios.delete(`${process.env.REACT_APP_API_KEY}/user/${id}`, request);
        if (res.data.success) {
          setToggle(!toggle);
          toast.success(res.data.message);
        }
      }
    }).catch((error) => {
      setloader(false);
      if (!error.response) {
        toast.error(error.message)
      } else if (error.response.status === 401) {
        getCommonApi();
      } else {
        if (error.response.data.message) {
          toast.error(error.response.data.message)
        }
      }
    })
  };

  // search function
  const HandleFilter = (event) => {
    let data = event.target.value;
    let filter_data = records.filter((val) => {
      return (
        val.employee_id?.toLowerCase().includes(data.toLowerCase()) ||
        val.first_name?.concat(" ", val.last_name).toLowerCase().includes(data.toLowerCase()) ||
        val.email.toLowerCase().includes(data.toLowerCase()) ||
        val.phone.toString().includes(data.toLowerCase()) ||
        val.role?.name.toLowerCase().includes(data.toLowerCase()) ||
        (val.report && val.report?.first_name?.concat(" ", val.report.last_name).toLowerCase().includes(data.toLowerCase()))
      );
    });
    setRecordsFilter(filter_data);
    setvalue(data);
  };

  // get employee data in backend
  const getAlluser = async () => {
    try {
      setloader(true);

      const res = await axios.get(`${process.env.REACT_APP_API_KEY}/user`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GetLocalStorage('token')}`
        }
      });

      if (res.data.success) {
        setPermission(res.data.permissions)
        let data = res.data.data.filter((val) => {
          return val?.role?.name.toLowerCase() !== "admin"
        })
        setRecords(data);
        setRecordsFilter(data);
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
      setloader(false);
    }
  };

  useEffect(() => {
    getAlluser();
    // eslint-disable-next-line
  }, [toggle]);

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
    if (orderBy === "role") {
      if (b[orderBy].name < a[orderBy].name) {
        return -1
      }
      if (b[orderBy].name > a[orderBy].name) {
        return 1
      }
      return 0
    } else if (orderBy === "name") {
      if (b.first_name?.concat(" ", b.last_name) < a.first_name?.concat(" ", a.last_name)) {
        return -1
      }
      if (b.first_name?.concat(" ", b.last_name) > a.first_name?.concat(" ", a.last_name)) {
        return 1
      }
      return 0
    } else if (orderBy === "report") {
      if (b[orderBy]?.first_name?.concat(" ", b.last_name) < a[orderBy]?.first_name?.concat(" ", a.last_name)) {
        return -1
      }
      if (b[orderBy]?.first_name?.concat(" ", b.last_name) > a[orderBy]?.first_name?.concat(" ", a.last_name)) {
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


  return (
    <>
      <motion.div className="box" initial={{ opacity: 0, transform: "translateY(-20px)" }} animate={{ opacity: 1, transform: "translateY(0px)" }} transition={{ duration: 0.5 }}>
        {permission && (permission.name.toLowerCase() === "admin" || (permission.permissions.length !== 0 && permission.permissions.list === 1)) ?
          <div className=" container-fluid pt-4">
            <div className="background-wrapper bg-white pt-2">
              <div className=''>
                <div className='row justify-content-end align-items-center row-std m-0'>
                  <div className="col-12 col-sm-5 d-flex justify-content-between align-items-center">
                    <div>
                      {/* <NavLink className="path-header">Employee</NavLink> */}
                      <ul id="breadcrumb" className="mb-0">
                        <li><NavLink to="/" className="ihome">Dashboard</NavLink></li>
                        <li><NavLink to="/employees" className="ibeaker"><i className="fa-solid fa-play"></i> &nbsp; Employee</NavLink></li>
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
                    <AddEmployeeModal getAlluser={getAlluser} permission={permission} />
                  </div>
                </div>
              </div>
              {/* table */}
              <div className="mx-4">
                <TableContainer >
                  <Table className="common-table-section">
                    <TableHead className="common-header">
                      <TableRow>
                        <TableCell align="center" >
                          <TableSortLabel active={orderBy === "employee_id"} direction={orderBy === "employee_id" ? order : "asc"} onClick={() => handleRequestSort("employee_id")}>
                            Employee Id
                          </TableSortLabel>
                        </TableCell>
                        <TableCell>
                          Profile
                        </TableCell>
                        <TableCell>
                          <TableSortLabel active={orderBy === "name"} direction={orderBy === "name" ? order : "asc"} onClick={() => handleRequestSort("name")}>
                            Name
                          </TableSortLabel>
                        </TableCell>
                        <TableCell>
                          <TableSortLabel active={orderBy === "email"} direction={orderBy === "email" ? order : "asc"} onClick={() => handleRequestSort("email")}>
                            Email Address
                          </TableSortLabel>
                        </TableCell>
                        <TableCell>
                          <TableSortLabel active={orderBy === "phone"} direction={orderBy === "phone" ? order : "asc"} onClick={() => handleRequestSort("phone")}>
                            Contact No.
                          </TableSortLabel>
                        </TableCell>
                        <TableCell>
                          <TableSortLabel active={orderBy === "role"} direction={orderBy === "role" ? order : "asc"} onClick={() => handleRequestSort("role")}>
                            Role
                          </TableSortLabel>
                        </TableCell>
                        <TableCell>
                          <TableSortLabel active={orderBy === "report"} direction={orderBy === "report" ? order : "asc"} onClick={() => handleRequestSort("report")}>
                            Report To
                          </TableSortLabel>
                        </TableCell>
                        <TableCell>
                          Status
                        </TableCell>
                        {permission && (permission.name.toLowerCase() === "admin" || (permission.permissions.length !== 0 && (permission.permissions.update === 1 || permission.permissions.list === 1 || permission.permissions.delete === 1))) &&
                          <TableCell>
                            Action
                          </TableCell>}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recordsFilter.length !== 0 ? sortRowInformation(recordsFilter, getComparator(order, orderBy)).slice(count * page, count * page + count).map((val, ind) => {
                        return (
                          <TableRow key={ind}>
                            <TableCell align="center">{val.employee_id}</TableCell>
                            <TableCell>  <NavLink className='pr-3 name_col' to={`${process.env.REACT_APP_IMAGE_API}/${val.profile_image}`} target="_blank">
                              {val.profile_image &&
                                <Avatar alt={val.first_name} className='text-capitalize profile-action-icon text-center' src={val.profile_image && `${process.env.REACT_APP_IMAGE_API}/${val.profile_image}`} sx={{ width: 30, height: 30 }} />}
                            </NavLink></TableCell>
                            <TableCell>
                              <div>
                                {val.first_name.concat(" ", val.last_name)}
                              </div>
                            </TableCell>
                            <TableCell>{val.email}</TableCell>
                            <TableCell>{val.phone}</TableCell>
                            <TableCell>{val?.role ? val.role?.name : <HiOutlineMinus />}</TableCell>
                            <TableCell>
                              <NavLink className='pr-3 d-flex align-items-center name_col' to={`${process.env.REACT_APP_IMAGE_API}/${val.report?.profile_image}`} target="_blank">
                                {val.report ? <>
                                  <Avatar alt={val.report.first_name} className='text-capitalize profile-action-icon text-center mr-2' src={val.report.profile_image && `${process.env.REACT_APP_IMAGE_API}/${val.report.profile_image}`} sx={{ width: 30, height: 30 }} />
                                  {val?.report?.first_name.concat(" ", val.report.last_name)}
                                </> : <HiOutlineMinus />
                                }
                              </NavLink>
                            </TableCell>
                            <TableCell>
                              <Switch color="success"
                                checked={val.status === "Active" ? true : false}
                                onChange={() => handleStatus(val)}
                                disabled={
                                  permission && (permission.name.toLowerCase() === "admin" || (permission.permissions.length !== 0 && permission.permissions.update === 1)) &&
                                  UserData && UserData._id === val._id
                                }
                              />
                            </TableCell>
                            {permission && (permission.name.toLowerCase() === "admin" || (permission.permissions.length !== 0 && (permission.permissions.update === 1 || permission.permissions.list === 1 || permission.permissions.delete === 1))) &&
                              <TableCell>
                                <div className='action'>
                                  <i className="fa-solid fa-eye" onClick={() => history('/employees/view/' + val._id)}></i>
                                  {permission && (permission.name.toLowerCase() === "admin" || (permission.permissions.length !== 0 && permission.permissions.update === 1)) &&
                                    <i className="fa-solid fa-pen-to-square" onClick={() => history('/employees/edit/' + val._id)}></i>}
                                  {permission && (permission.name.toLowerCase() === "admin" || (permission.permissions.length !== 0 && permission.permissions.delete === 1)) &&
                                    <i className="fa-solid fa-trash-can" onClick={() => handleDelete(val._id)}></i>}
                                </div>
                              </TableCell>}
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
                  onPageChange={onChangePage}
                  onRowsPerPageChange={onChangeRowsPerPage}
                  rowsPerPage={count}
                  count={recordsFilter.length}
                  page={page}>
                </TablePagination>
              </div>
            </div>
          </div> : !loader && <Error403/>}
      </motion.div >
      {loader && <Spinner />
      }
    </>
  );
};

export default Employee;
