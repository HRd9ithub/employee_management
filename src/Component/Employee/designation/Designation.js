import React, {useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import Spinner from "../../common/Spinner"
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import DesignationModal from "./DesignationModal";
import GlobalPageRedirect from "../../auth_context/GlobalPageRedirect";
import { Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel } from "@mui/material";
import axios from "axios";
import { GetLocalStorage } from "../../../service/StoreLocalStorage";

const Designation = () => {
  const [loader, setloader] = useState(false);
  const [records, setRecords] = useState([]);
  const [recordsFilter, setRecordsFilter] = useState([]);
  const [permission, setPermission] = useState("");
  // pagination state
  const [count, setCount] = useState(5)
  const [page, setpage] = useState(0)

  // sort state
  const [order, setOrder] = useState("asc")
  const [orderBy, setOrderBy] = useState("id")

  let { getCommonApi } = GlobalPageRedirect();


  // get data in mysql
  const getdesignation = async () => {
    try {
      setloader(true);
      let config = {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${GetLocalStorage('token')}`
        },
    }
      const res = await axios.get(`${process.env.REACT_APP_API_KEY}/designation/`,config);
      if (res.data.success) {
        setPermission(res.data.permissions)
        setRecords(res.data.data);
        setRecordsFilter(res.data.data);
      }
    } catch (error) {
      console.log("🚀 ~ file: Designation.js:122 ~ getdesignation ~ error:", error);
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
      setloader(false);
    }
  };

  useEffect(() => {
    getdesignation();
    // eslint-disable-next-line
  }, []);

  // search fillter function
  const HandleFilter = (event) => {
    let data = event.target.value;
    let filter_data = records.filter((val) => {
      return val.name.toLowerCase().includes(data.toLowerCase())
    });
    setRecordsFilter(filter_data);
  };


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

  return (
    <>
      <motion.div className="box" initial={{ opacity: 0, transform: "translateY(-20px)" }} animate={{ opacity: 1, transform: "translateY(0px)" }} transition={{ duration: 0.5 }}>
        <div className=" container-fluid pt-4">
          <div className="background-wrapper bg-white pt-2">
            <div className=''>
              <div className='row justify-content-end align-items-center row-std m-0'>
                <div className="col-12 d-flex justify-content-between align-items-center">
                  <div>
                    <NavLink className="path-header">Designation</NavLink>
                    <ul id="breadcrumb" className="mb-0">
                      <li><NavLink to="/" className="ihome">Dashboard</NavLink></li>
                      <li><NavLink to="/designation" className="ibeaker"><i className="fa-solid fa-play"></i> &nbsp; Designation</NavLink></li>
                    </ul>
                  </div>
                  <div className="d-flex" id="two">
                    <div className="search-full">
                      <input type="text" className="input-search-full" name="txt" placeholder="Search" onChange={HandleFilter}/>
                      <i className="fas fa-search"></i>
                    </div>
                    <div className="search-box mr-3">
                      <form name="search-inner">
                        <input type="text" className="input-search" name="txt" onChange={HandleFilter} />
                      </form>
                      <i className="fas fa-search"></i>
                    </div>
                    <DesignationModal getdesignation={getdesignation} ecords={records} permission={permission && permission}/>
                  </div>
                </div>
              </div>
            </div>

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
                        Designation
                      </TableSortLabel>
                    </TableCell>
                    {permission && (permission.name.toLowerCase() === "admin" || (permission.permissions.length !== 0 && permission.permissions.update === 1)) &&
                      <TableCell>
                        Action
                      </TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recordsFilter.length !== 0 ? sortRowInformation(recordsFilter, getComparator(order, orderBy)).slice(count * page, count * page + count).map((val, ind) => {
                    return (
                      <TableRow key={ind}>
                        <TableCell>{ind + 1}</TableCell>
                        <TableCell>{val.name}</TableCell>
                        {permission && (permission.name.toLowerCase() === "admin" || (permission.permissions.length !== 0 && permission.permissions.update === 1)) &&
                          <TableCell>
                            <div className='action'>
                              <DesignationModal
                                data={val}
                                getdesignation={getdesignation}
                              />
                              {/* {(UserData && UserData.role.name.toLowerCase() !== "admin") && (accessData.length !== 0 && accessData[0].delete === "0") ? "" : <i className="fa-solid fa-trash-can" onClick={() => handleDelete(val.id)}></i>} */}
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
              onPageChange={onChangePage}
              onRowsPerPageChange={onChangeRowsPerPage}
              rowsPerPage={count}
              count={recordsFilter.length}
              page={page}>
            </TablePagination>
          </div>
        </div>
      </motion.div >
      {loader && <Spinner />
      }
    </>
  );
};

export default Designation;
