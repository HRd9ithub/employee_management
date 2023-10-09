import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import Spinner from "../../common/Spinner";
import { toast } from "react-hot-toast";
import UserRoleModal from "./UserRoleModal";
import { motion } from "framer-motion";
import GlobalPageRedirect from "../../auth_context/GlobalPageRedirect";
import { Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel } from "@mui/material";
import Error403 from "../../error_pages/Error403";
import Error500 from '../../error_pages/Error500';
import { useMemo } from "react";
import { useEffect } from "react";
import { customAxios } from "../../../service/CreateApi";

const UserRole = () => {
  const [isLoading, setisLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [searchItem, setsearchItem] = useState("");
  const [permission, setPermission] = useState("");
  const [serverError, setServerError] = useState(false);

  // pagination state
  const [count, setCount] = useState(5)
  const [page, setpage] = useState(0)

  // sort state
  const [order, setOrder] = useState("asc")
  const [orderBy, setOrderBy] = useState("id")

  let { getCommonApi } = GlobalPageRedirect();

  // get user role data
  const getuserRole = async () => {
    try {
      setisLoading(true);
      setServerError(false)
      const res = await customAxios().get('/role');
      if (res.data.success) {
        let data = res.data.data.filter((val) => {
          return val.name.toLowerCase() !== "admin"
        })
        setPermission(res.data.permissions)
        setRecords(data);
      }
    } catch (error) {
      if (!error.response) {
        setServerError(true)
        toast.error(error.message)
      } else {
        if (error.response.status === 401) {
          getCommonApi();
        } else {
          if (error.response.status === 500) {
            setServerError(true)
          }
          if (error.response.data.message) {
            toast.error(error.response.data.message)
          }
        }
      }
    } finally {
      setisLoading(false);
    }
  };

  useEffect(() => {
    getuserRole();
    // eslint-disable-next-line
  }, []);

  // memoize filtered items
  const recordsFilter = useMemo(() => {
    return records.filter((item) => item.name.toLowerCase().includes(searchItem.toLowerCase()));
  }, [records, searchItem]);


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

  if(isLoading){
    return <Spinner />;
  }

  if(serverError){
    return <Error500/>;
  }

  if(!permission || (permission.name.toLowerCase() !== "admin" && (permission.permissions.length !== 0 && permission.permissions.list === 0))){
    return <Error403/>;
  }

  return (
    <>
        <motion.div
          className="box"
          initial={{ opacity: 0, transform: "translateY(-20px)" }}
          animate={{ opacity: 1, transform: "translateY(0px)" }}
          transition={{ duration: 0.5 }}
        >
            <div className=" container-fluid pt-4">
              <div className="background-wrapper bg-white pt-2">
                <div className=''>
                  <div className='row justify-content-end align-items-center row-std m-0'>
                    <div className="col-12 col-sm-5 d-flex justify-content-between align-items-center">
                      <div>
                        <ul id="breadcrumb" className="mb-0">
                          <li><NavLink to="/" className="ihome">Dashboard</NavLink></li>
                          <li><NavLink to="" className="ibeaker"><i className="fa-solid fa-play"></i> &nbsp; User Role</NavLink></li>
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
                      <UserRoleModal getuserRole={getuserRole} permission={permission && permission} />
                    </div>
                  </div>
                </div>


                {/* Table *********************** */}
                <div className="mx-4">
                  <TableContainer >
                    <Table className="common-table-section">
                      <TableHead className="common-header">
                        <TableRow>
                          <TableCell>
                            Id
                          </TableCell>
                          <TableCell>
                            <TableSortLabel active={orderBy === "name"} direction={orderBy === "name" ? order : "asc"} onClick={() => handleRequestSort("name")}>
                              User Role
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
                                    <UserRoleModal
                                      data={val}
                                      getuserRole={getuserRole}
                                    />
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
            </div>
        </motion.div> 
    </>
  );
};

export default UserRole;
