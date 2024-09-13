import React, { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import Spinner from "../../common/Spinner"
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import DesignationModal from "./DesignationModal";
import { Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel } from "@mui/material";
import Error403 from "../../error_pages/Error403"
import Error500 from '../../error_pages/Error500';
import { customAxios } from "../../../service/CreateApi";
import Swal from "sweetalert2";
import usePagination from "../../../hooks/usePagination";

const Designation = () => {
  const [isLoading, setisLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [searchItem, setsearchItem] = useState("");
  const [permission, setPermission] = useState("");
  const [serverError, setServerError] = useState(false);
  const [permissionToggle, setPermissionToggle] = useState(true);

  // pagination state
  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } = usePagination(25);

  // sort state
  const [order, setOrder] = useState("asc")
  const [orderBy, setOrderBy] = useState("id")

  // get data in database
  const getdesignation = () => {
    setServerError(false);
    setisLoading(true);
    setPermissionToggle(true);
    customAxios().get('/designation/').then((res) => {
      let { success, data, permissions } = res.data;
      if (success) {
        setPermission(permissions);
        setRecords(data);
        setisLoading(false);
      }
    }).catch((error) => {
      setisLoading(false);
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
    }).finally(() => setPermissionToggle(false))
  };

  useEffect(() => {
    getdesignation();
    // eslint-disable-next-line
  }, []);

  // memoize filtered items
  const recordsFilter = useMemo(() => {
    return records.filter((item) => item.name.toLowerCase().includes(searchItem.toLowerCase()));
  }, [records, searchItem]);

  // delete function
  const handleDelete = (id) => {
    Swal.fire({
      title: "Delete Designation",
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
        const res = await customAxios().delete(`/designation/${id}`);
        if (res.data.success) {
          getdesignation();
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
            <div className=''>
              <div className='row justify-content-end align-items-center row-std m-0'>
                <div className="col-12 col-sm-5 d-flex justify-content-between align-items-center">
                  <div>
                    <ul id="breadcrumb" className="mb-0">
                      <li><NavLink to="/" className="ihome">Dashboard</NavLink></li>
                      <li><NavLink to="" className="ibeaker"><i className="fa-solid fa-play"></i> &nbsp; Designation</NavLink></li>
                    </ul>
                  </div>
                </div>
                <div className="col-12 col-sm-7 d-flex justify-content-end" id="two">
                  <div className="search-full">
                    <input type="search" className="input-search-full" autoComplete='off' value={searchItem} name="txt" placeholder="Search" onChange={(event) => setsearchItem(event.target.value)} />
                    <i className="fas fa-search"></i>
                  </div>
                  <div className="search-box mr-3">
                    <form name="search-inner">
                      <input type="search" className="input-search" autoComplete='off' value={searchItem} name="txt" onChange={(event) => setsearchItem(event.target.value)} />
                    </form>
                    <i className="fas fa-search"></i>
                  </div>
                  <DesignationModal getdesignation={getdesignation} permission={permission && permission} />
                </div>
              </div>
            </div>
            <div className="mx-4">
              {/* table */}
              <TableContainer >
                <Table className="common-table-section">
                  <TableHead className="common-header">
                    <TableRow>
                      <TableCell>
                        Id
                      </TableCell>
                      <TableCell>
                        <TableSortLabel active={orderBy === "name"} direction={orderBy === "name" ? order : "asc"} onClick={() => handleRequestSort("name")}>
                          Designation Name
                        </TableSortLabel>
                      </TableCell>
                      {permission && (permission.permissions.update === 1 || permission.permissions.delete === 1) &&
                        <TableCell>
                          Action
                        </TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recordsFilter.length !== 0 ? sortRowInformation(recordsFilter, getComparator(order, orderBy)).slice(rowsPerPage * page, rowsPerPage * page + rowsPerPage).map((val, ind) => {
                      return (
                        <TableRow key={ind}>
                          <TableCell>{rowsPerPage * page + ind + 1}</TableCell>
                          <TableCell>{val.name}</TableCell>
                          {permission && (permission.permissions.update === 1 || permission.permissions.delete === 1) &&
                            <TableCell>
                              <div className='action'>
                                {permission.permissions.update === 1 && <DesignationModal data={val} getdesignation={getdesignation} />}
                                {permission.permissions.delete === 1 && <i className="fa-solid fa-trash-can" onClick={() => handleDelete(val._id)}></i>}
                              </div>
                            </TableCell>}
                        </TableRow>
                      )
                    }) :
                      <TableRow>
                        <TableCell colSpan={3} align="center">
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
      </motion.div>
    </>
  );
};

export default Designation;
