import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Spinner from "../../common/Spinner";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import AddEmployeeModal from "./add_form/AddEmployeeModal";
import Switch from '@mui/material/Switch';
import { HiOutlineMinus } from "react-icons/hi";
import { Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel } from "@mui/material";
import Error403 from "../../error_pages/Error403";
import Error500 from '../../error_pages/Error500';
import { useMemo } from "react";
import { customAxios } from "../../../service/CreateApi";
import { GetLocalStorage, RemoveLocalStorage } from "../../../service/StoreLocalStorage";
import usePagination from "../../../hooks/usePagination";

const Employee = () => {
  const [records, setRecords] = useState([]);
  const [isLoading, setisLoading] = useState(false);
  const [permission, setPermission] = useState("");
  const [permissionToggle, setPermissionToggle] = useState(true);
  const [serverError, setServerError] = useState(false);
  const [searchItem, setsearchItem] = useState("");

  // pagination state
  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } = usePagination(100);


  // sort state
  const [order, setOrder] = useState("asc")
  const [orderBy, setOrderBy] = useState("employee_id")

  const history = useNavigate()

  // status update function
  const handleStatus = async (row) => {
    // eslint-disable-next-line
    let { _id } = row;
    setisLoading(true);
    try {
      const res = await customAxios().patch(`/user/${_id}`);

      if (res.data.success) {
        getAlluser();
        toast.success(res.data.message);
      }
    } catch (error) {
      setisLoading(false)
      if (!error.response) {
        toast.error(error.message)
      } else {
        if (error.response.data.message) {
          toast.error(error.response.data.message)
        }
      }
    }
  };

  // delete function
  const handleDelete = (id) => {
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
        setisLoading(true);
        const res = await customAxios().delete(`/user/${id}`);
        if (res.data.success) {
          getAlluser();
          toast.success(res.data.message);
        }
      }
    }).catch((error) => {
      setisLoading(false);
      if (!error.response) {
        toast.error(error.message)
      } else {
        if (error.response.data.message) {
          toast.error(error.response.data.message)
        }
      }
    })
  };

  // get employee data in backend
  const getAlluser = () => {
    setServerError(false)
    setisLoading(true);
    setPermissionToggle(true);

    const status = GetLocalStorage("status")

    customAxios().get(`/user?status=${status}`).then((res) => {
      if (res.data.success) {
        let { data, permissions } = res.data;
        setPermission(permissions);
        setRecords(data);
        setisLoading(false);
        RemoveLocalStorage("status");
      }
    }).catch((error) => {
      setisLoading(false);
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
    }).finally(() => setPermissionToggle(false))
  };

  useEffect(() => {
    getAlluser();
    // eslint-disable-next-line
  }, []);

  // memoize filtered items
  const recordsFilter = useMemo(() => {
    return records.filter((item) => {
      return (
        item.employee_id?.toLowerCase().includes(searchItem.toLowerCase()) ||
        item.name.toLowerCase().includes(searchItem.toLowerCase()) ||
        item.email.toLowerCase().includes(searchItem.toLowerCase()) ||
        item.phone.toString().includes(searchItem.toLowerCase()) ||
        item.role?.name.toLowerCase().includes(searchItem.toLowerCase()) ||
        (item.report && item.report?.name.toLowerCase().includes(searchItem.toLowerCase()))
      );
    })
  }, [records, searchItem]);

  // sort function
  const handleRequestSort = (name) => {
    const isAsc = (orderBy === name && order === "asc");

    setOrderBy(name)
    setOrder(isAsc ? "desc" : "asc")
  }

  const descedingComparator = (a, b, orderBy) => {
    if (b[orderBy] < a[orderBy]) {
      return -1
    }
    if (b[orderBy] > a[orderBy]) {
      return 1
    }
    return 0
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

  if (isLoading) {
    return <Spinner />;
  } else if (serverError) {
    return <Error500 />;
  } else if ((!permission || permission.permissions.list !== 1) && !permissionToggle) {
    return <Error403 />;
  }

  return (
    <>
      <motion.div className="box" initial={{ opacity: 0, transform: "translateY(-20px)" }} animate={{ opacity: 1, transform: "translateY(0px)" }} transition={{ duration: 0.5 }}>
        <div className="container-fluid py-4">
          <div className="background-wrapper bg-white pb-4">
            <div>
              <div className='row justify-content-end align-items-center row-std m-0'>
                <div className="col-12 col-sm-5 d-flex justify-content-between align-items-center">
                  <div>
                    <ul id="breadcrumb" className="mb-0">
                      <li><NavLink to="/" className="ihome">Dashboard</NavLink></li>
                      <li><NavLink to="" className="ibeaker"><i className="fa-solid fa-play"></i> &nbsp; Employee</NavLink></li>
                    </ul>
                  </div>
                </div>
                <div className="col-12 col-sm-7 d-flex justify-content-end" id="two">
                  <div className="search-full">
                    <input type="search" autoComplete="off" className="input-search-full" name="txt" value={searchItem} placeholder="Search" onChange={(event) => setsearchItem(event.target.value)} />
                    <i className="fas fa-search"></i>
                  </div>
                  <div className="search-box mr-3">
                    <form name="search-inner">
                      <input type="search" autoComplete="off" className="input-search" name="txt" value={searchItem} onChange={(event) => setsearchItem(event.target.value)} />
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
                      <TableCell>
                        <TableSortLabel active={orderBy === "employee_id"} direction={orderBy === "employee_id" ? order : "asc"} onClick={() => handleRequestSort("employee_id")}>
                          Employee ID
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel active={orderBy === "name"} direction={orderBy === "name" ? order : "asc"} onClick={() => handleRequestSort("name")}>
                          Name
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel active={orderBy === "email"} direction={orderBy === "email" ? order : "asc"} onClick={() => handleRequestSort("email")}>
                          Email
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel active={orderBy === "phone"} direction={orderBy === "phone" ? order : "asc"} onClick={() => handleRequestSort("phone")}>
                          Mobile
                        </TableSortLabel>
                      </TableCell>
                      <TableCell align="center">
                        Remaining leave
                      </TableCell>
                      <TableCell>
                        Status
                      </TableCell>
                      {permission && (permission.permissions.update === 1 || permission.permissions.list === 1 || permission.permissions.delete === 1) &&
                        <TableCell>
                          Action
                        </TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recordsFilter.length !== 0 ? sortRowInformation(recordsFilter, getComparator(order, orderBy)).slice(rowsPerPage * page, rowsPerPage * page + rowsPerPage).map((val, ind) => {
                      return (
                        <TableRow key={ind}>
                          <TableCell>{val.employee_id}</TableCell>
                          <TableCell>
                            <div className={`pr-3 name_col ${val.status === "Inactive" ? 'user-status-inactive' : ''}`}>
                              {val ? val.name : <HiOutlineMinus />}
                            </div>
                          </TableCell>
                          <TableCell>{val.email}</TableCell>
                          <TableCell>{val.phone}</TableCell>
                          <TableCell align="center">
                            {(val.leave && val.leave?.length !== 0) ? val.leave.map((elem, id) => {
                              return (
                                <div key={id}>
                                  <span>{elem.shortName}</span>
                                  <span>: </span>
                                  <span>{elem.remaining}/{elem.totalLeave}</span>
                                </div>
                              )
                            }) : <HiOutlineMinus />}
                          </TableCell>
                          <TableCell>
                            <Switch
                              className="status-switch"
                              checked={val.status === "Active" ? true : false}
                              onChange={() => handleStatus(val)}
                              disabled={!permission || permission.name.toLowerCase() !== "admin"}
                            />
                          </TableCell>
                          {permission && (permission.permissions.update === 1 || permission.permissions.list === 1 || permission.permissions.delete === 1) &&
                            <TableCell>
                              <div className='action'>
                                <i className="fa-solid fa-eye" onClick={() => history('/employees/view/' + val._id)}></i>
                                {permission && permission.permissions.update === 1 &&
                                  <i className="fa-solid fa-pen-to-square" onClick={() => history('/employees/edit/' + val._id)}></i>}
                                {permission && permission.permissions.delete === 1 &&
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
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPage={rowsPerPage}
                count={recordsFilter.length}
                page={page}>
              </TablePagination>
            </div>
          </div>
        </div>
      </motion.div >
    </>
  );
};

export default Employee;
