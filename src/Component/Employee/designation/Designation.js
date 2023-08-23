import React, { useContext, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";
import Spinner from "../../common/Spinner"
import { toast } from "react-toastify";
import { Form } from "react-bootstrap";
import { motion } from "framer-motion";
import { AppProvider } from "../../context/RouteContext";
import DesignationModal from "./DesignationModal";
import GlobalPageRedirect from "../../auth_context/GlobalPageRedirect";
import { GetLocalStorage } from "../../../service/StoreLocalStorage";
import { Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel } from "@mui/material";

const Designation = ({ HandleProgress }) => {
  const [loader, setloader] = useState(false);
  const [records, setRecords] = useState([]);
  const [recordsFilter, setRecordsFilter] = useState([]);

  let { UserData, accessData, handleVisibility, visible } = useContext(AppProvider);

  // pagination state
  const [count, setCount] = useState(5)
  const [page, setpage] = useState(0)

  // sort state
  const [order, setOrder] = useState("asc")
  const [orderBy, setOrderBy] = useState("id")

  let { getCommonApi } = GlobalPageRedirect();

  // delete function
  // const handleDelete = (id) => {
  //   let token = GetLocalStorage("token");
  //   const request = {
  //     headers: {
  //       Authorization: `Bearer ${token}`,
  //     },
  //   };
  //   Swal.fire({
  //     title: "Delete Designation",
  //     text: "Are you sure want to delete?",
  //     icon: "warning",
  //     showCancelButton: true,
  //     confirmButtonColor: "#1bcfb4",
  //     cancelButtonColor: "#d33",
  //     confirmButtonText: "Yes, delete it!",
  //     cancelButtonText: "No, cancel!",
  //     width: "450px",
  //   }).then(async (result) => {
  //     if (result.isConfirmed) {
  //       setloader(true);
  //       const res = await axios.post(`${process.env.REACT_APP_API_KEY}/designation/delete`, { id: id }, request);
  //       if (res.data.success) {
  //         setToggle(!toggle);
  //         toast.success("Successfully deleted a designation.");
  //       } else {
  //         setloader(false);
  //         toast.error(res.data.message);
  //       }
  //     }
  //   }).catch((error) => {
  //     setloader(false);
  //     console.log("🚀 ~ file: Designation.js:101 ~ handleDelete ~ error:", error);
  //     if (error.response.status === 401) {
  //       getCommonApi();
  //     } else {
  //       if (error.response.data.message) {
  //         toast.error(error.response.data.message)
  //       } else {
  //         if (typeof error.response.data.error === "string") {
  //           toast.error(error.response.data.error)
  //         }
  //       }
  //     }
  //   });
  // };

  // get data in mysql
  const getdesignation = async () => {
    HandleProgress(20);
    try {
      setloader(true);
      let token = GetLocalStorage("token");
      const request = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      HandleProgress(50);
      const res = await axios.get(`${process.env.REACT_APP_API_KEY}/designation/list`, request);
      HandleProgress(70);
      if (res.data.success) {
        setRecords(res.data.data);
        setRecordsFilter(res.data.data);
      }
    } catch (error) {
      console.log("🚀 ~ file: Designation.js:122 ~ getdesignation ~ error:", error);
      if (error.response.status === 401) {
        getCommonApi();
      } else {
        if (error.response.data.message) {
          toast.error(error.response.data.message)
        } else {
          if (typeof error.response.data.error === "string") {
            toast.error(error.response.data.error)
          }
        }
      }
    } finally {
      HandleProgress(100);
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
      return val.name.toLowerCase().includes(data.toLowerCase()) ||
        val.id.toString().includes(data.toLowerCase())
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
      <motion.div
        className="box" initial={{ opacity: 0, transform: "translateY(-20px)" }} animate={{ opacity: 1, transform: "translateY(0px)" }} transition={{ duration: 0.5 }}>

        <div className=''>
        <div className=''>
          <div className='container-fluid '>
            <div className="row breadcrumb-btn">
              <div className="col-10">
                <ul id="breadcrumb" className="mb-0">
                  <li><NavLink to="/" className="ihome"><span className="icon icon-home"> </span></NavLink></li>
                  <li><NavLink to="/designation" className="ibeaker"><i className="fa-solid fa-user icon"></i> Designation</NavLink></li>
                </ul>
              </div>
              <div className="col-2">
                <div className=' add-employee-btn'>
                <DesignationModal
                    getdesignation={getdesignation}
                    accessData={accessData}
                    user={UserData && UserData.role.name}
                    records={records}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="background-wrapper bg-white pt-5">
            <div className='container-fluid pr-5'>
              <div className='row justify-content-end row-std inner-pages'>
                {/* search box */}
                <div className={`col-md-3 col-sm-4 col-3 p-0 text-end `} id="two">
                  <Form.Control type="text" className={`${visible ? "open" : "close-btn"}`} id="exampleInputUsername1" placeholder=" &#xf002; &nbsp; Search " size="lg" onChange={HandleFilter} style={{ fontFamily: 'font_awesome', fontWeight: '500' }} />
                  <div className="magnifierContainer">
                    <i className={`fa-solid fa-magnifying-glass material-icons`} onClick={handleVisibility}></i>
                  </div>
                </div>
              </div>
            </div>

          
          {/* table */}
          <div></div>
          <TableContainer >
            <Table className="common-table-section">
              <TableHead className="common-header">
                <TableRow>
                  <TableCell>
                    <TableSortLabel active={orderBy === "id"} direction={orderBy === "id" ? order : "asc"} onClick={() => handleRequestSort("id")}>
                      Id
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel active={orderBy === "name"} direction={orderBy === "name" ? order : "asc"} onClick={() => handleRequestSort("name")}>
                      Designation
                    </TableSortLabel>
                  </TableCell>
                  {((UserData && UserData.role.name.toLowerCase() === "admin") || (accessData.length !== 0 && accessData[0].update !== "0")) &&
                    <TableCell>
                      Action
                    </TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {recordsFilter.length !== 0 ? sortRowInformation(recordsFilter, getComparator(order, orderBy)).slice(count * page, count * page + count).map((val, ind) => {
                  return (
                    <TableRow key={ind}>
                      <TableCell>{val.id}</TableCell>
                      <TableCell>{val.name}</TableCell>
                      {((UserData && UserData.role.name.toLowerCase() === "admin") || (accessData.length !== 0 && accessData[0].update !== "0")) &&
                        <TableCell>
                          <div className='action'>
                            <DesignationModal
                              data={val}
                              getdesignation={getdesignation}
                              accessData={accessData}
                              user={UserData && UserData.role.name}
                              records={records}
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
    </div >
      </motion.div >
  { loader && <Spinner />}
    </>
  );
};

export default Designation;
