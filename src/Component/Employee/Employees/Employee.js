import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { Form } from "react-bootstrap";
import Spinner from "../../common/Spinner";
import { toast } from "react-toastify";
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

const Employee = ({ HandleProgress }) => {
  const [records, setRecords] = useState([]);
  const [allRecords, setallRecords] = useState([]);
  // eslint-disable-next-line
  const [value, setvalue] = useState("");
  const [recordsFilter, setRecordsFilter] = useState([]);
  const [loader, setloader] = useState(false);
  const [toggle, setToggle] = useState(false);

  let { UserData, accessData, handleVisibility, visible } = useContext(AppProvider);

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
    let { id } = row;
    setloader(true);
    try {
      let token = GetLocalStorage("token");
      const request = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const res = await axios.post(`${process.env.REACT_APP_API_KEY}/user/status`, { id: id }, request);

      if (res.data.success) {
        setToggle(!toggle);
        toast.success("Status updated successfully.");
      } else {
        setloader(false);
        toast.error(res.data.message);
      }
    } catch (error) {
      setloader(false);
      console.log("error", error);
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
    }
  };

  // delete function
  const handleDelete = (data) => {
    let { id } = data;
    let token = GetLocalStorage("token");
    const request = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    Swal.fire({
      title: "Delete Employee",
      text: "Are you sure want to delete?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1bcfb4",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
      width: "450px",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setloader(true);
        const res = await axios.post(`${process.env.REACT_APP_API_KEY}/user/delete`, { id: id }, request);
        if (res.data.success) {
          setToggle(!toggle);
          toast.success("Employee has been successfully deleted.");
        } else {
          setloader(false);
          toast.error(res.data.message);
        }
      }
    }).catch((error) => {
      console.log("error", error);
      setloader(false);
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
        val.mobile_no.toLowerCase().includes(data.toLowerCase()) ||
        val.role?.name.toLowerCase().includes(data.toLowerCase())
      );
    });
    setRecordsFilter(filter_data);
    setvalue(data);
  };

  // get employee data in backend
  const getAlluser = async () => {
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
      const res = await axios.get(`${process.env.REACT_APP_API_KEY}/user/list`, request);

      HandleProgress(80);
      if (res.data.success) {
        setallRecords(res.data.data)
        let data = res.data.data.filter((val) => {
          return val?.role?.name.toLowerCase() !== "admin"
        })
        setRecords(data);
        setRecordsFilter(data);
      }
    } catch (error) {
      console.log(error, " <<< ==== error ");
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
    getAlluser();
    // eslint-disable-next-line
  }, [toggle]);

  // pagination function
  const onChangePage = (e, page) => {
    setpage(page)
  }

  const onChangeRowsPerPage = (e) => {
    console.log(e.target.value)
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
        <div className=''>
          <div className='container-fluid '>
            <div className="row breadcrumb-btn">
              <div className="col-10">
                <ul id="breadcrumb" className="mb-0">
                  <li><a href="/" className="ihome"><span className="icon icon-home"> </span></a></li>
                  <li><a href="/employees" className="ibeaker"><i className="fa-solid fa-user icon"></i> Employee</a></li>
                </ul>
              </div>
              <div className="col-2">
                <div className='add-employee-btn'>
                  <AddEmployeeModal UserData={UserData.role.name} accessData={accessData.length !== 0 && accessData} getAlluser={getAlluser} allData={allRecords} />
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
            <div>
              <TableContainer >
                <Table className="common-table-section">
                  <TableHead className="common-header">
                    <TableRow>
                      <TableCell>
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
                        <TableSortLabel active={orderBy === "mobile_no"} direction={orderBy === "mobile_no" ? order : "asc"} onClick={() => handleRequestSort("mobile_no")}>
                          Contact No.
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel active={orderBy === "role"} direction={orderBy === "role" ? order : "asc"} onClick={() => handleRequestSort("role")}>
                          Role
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        Status
                      </TableCell>
                      <TableCell>
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recordsFilter.length !== 0 ? sortRowInformation(recordsFilter, getComparator(order, orderBy)).slice(count * page, count * page + count).map((val, ind) => {
                      return (
                        <TableRow key={ind}>
                          <TableCell>{val.employee_id}</TableCell>
                          <TableCell>  <NavLink className={'pr-3'} to={`${process.env.REACT_APP_IMAGE_API}/storage/${val.profile_image}`} target="_blank">
                            {val.profile_image &&
                              <img className="profile-action-icon text-center" src={val.profile_image && `${process.env.REACT_APP_IMAGE_API}/storage/${val.profile_image}`} alt="Profile_image" />}
                          </NavLink></TableCell>
                          <TableCell>
                            <div>
                              {/* <NavLink className={'pr-3'} to={`${process.env.REACT_APP_IMAGE_API}/storage/${val.profile_image}`} target="_blank">
                              {val.profile_image &&
                                <img className="profile-action-icon text-center" src={val.profile_image && `${process.env.REACT_APP_IMAGE_API}/storage/${val.profile_image}`} alt="Profile_image" />}
                            </NavLink> */}
                              {val.first_name.concat(" ", val.last_name)}
                            </div>
                          </TableCell>
                          <TableCell>{val.email}</TableCell>
                          <TableCell>{val.mobile_no}</TableCell>
                          <TableCell>{val?.role ? val.role?.name : <HiOutlineMinus />}</TableCell>
                          <TableCell>
                            <Switch color="success"
                              checked={val.status === "Active" ? true : false}
                              onChange={() => handleStatus(val)}
                              disabled={
                                (UserData && UserData.role.name.toLowerCase() !== "admin") &&
                                (accessData.length !== 0 && accessData[0].update === "0") ||
                                (UserData && UserData.id === val.id)
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <div className='action'>
                              <i className="fa-solid fa-eye" onClick={() => history('/employees/view/' + val.id)}></i>
                              {(UserData && UserData.role && UserData.role.name.toLowerCase() !== 'admin') && (accessData.length !== 0 && accessData[0].update === "0") ? "" :
                                <i className="fa-solid fa-pen-to-square" onClick={() => history('/employees/edit/' + val.id)}></i>}
                              {(UserData && UserData.id === val.id) || (UserData && UserData.role && UserData.role.name.toLowerCase() !== 'admin' && accessData.length !== 0 && accessData[0].delete === "0") ? "" :
                                <i className="fa-solid fa-trash-can" onClick={() => handleDelete(val.id)}></i>}
                            </div>
                          </TableCell>
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
      {loader && <Spinner />}
    </>
  );
};

export default Employee;
