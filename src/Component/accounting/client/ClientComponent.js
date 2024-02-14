/* eslint-disable react-hooks/exhaustive-deps */
import React, { useLayoutEffect, useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom';
import { motion } from "framer-motion";
import 'bootstrap-daterangepicker/daterangepicker.css';
import { Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel } from "@mui/material";
import { customAxios } from '../../../service/CreateApi';
import toast from 'react-hot-toast';
import Spinner from '../../common/Spinner';
import Error403 from '../../error_pages/Error403';
import Error500 from '../../error_pages/Error500';
import Swal from 'sweetalert2';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import ClientFormComponent from '../invoice/form/ClientFormComponent';
import { HiOutlineMinus } from "react-icons/hi";

const ClientComponent = () => {
  const [records, setRecords] = useState([]);
  const [isLoading, setisLoading] = useState(false);
  const [permission, setpermission] = useState("");
  const [serverError, setServerError] = useState(false);
  const [searchItem, setsearchItem] = useState("");
  const [permissionToggle, setPermissionToggle] = useState(true);

  const [tab, setTab] = useState('clients');

  // pagination state
  const [count, setCount] = useState(5)
  const [page, setpage] = useState(0)

  // sort state
  const [order, setOrder] = useState("asc")
  const [orderBy, setOrderBy] = useState("")
  /*--------------------
     get client data
  ----------------------*/
  const getClient = async () => {
    setServerError(false)
    setisLoading(true);
    setPermissionToggle(true);

    customAxios().get(`/invoice/client`).then((res) => {
      if (res.data.success) {
        const { data, permissions } = res.data;
        setpermission(permissions);
        setRecords(data);
        setisLoading(false);
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
  }

  useLayoutEffect(() => {
    getClient();
  }, [])


  /*--------------------
     Delete client funcation
  ----------------------*/
  const deleteInvoice = (id) => {
    Swal.fire({
      title: "Delete Invoice",
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
        const res = await customAxios().delete(`/invoice/client/${id}?p=${tab === "deletes" && true}`);
        if (res.data.success) {
          getClient();
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
  }

  /*--------------------
     Restore client funcation
  ----------------------*/
  const restoreInvoice = (id) => {
    setisLoading(true);
    customAxios().patch(`/invoice/client/${id}`).then((res) => {
      if (res.data.success) {
        getClient();
        toast.success(res.data.message);
        setisLoading(false);
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
  }

  /*--------------------
     pagination and sort table
  ----------------------*/

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
    if (orderBy === "name") {
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

  /*--------------------
      Search filter
  ----------------------*/
  const recordsFilter = useMemo(() => {
    const tabFilter = records.filter((item) => {
      if (tab === "clients") {
        return !item.deleteAt
      } else {
        return item.deleteAt
      }
    })

    return tabFilter.filter((item) => {
      return (
        item.first_name?.concat(" ",item.last_name).toLowerCase().includes(searchItem.toLowerCase()) ||
        item.email.toLowerCase().includes(searchItem.toLowerCase()) ||
        item.country.toLowerCase().includes(searchItem.toLowerCase()) ||
        item.state.toLowerCase().includes(searchItem.toLowerCase()) ||
        item.city.toLowerCase().includes(searchItem.toLowerCase()) ||
        item.postcode.toLowerCase().includes(searchItem.toLowerCase()) ||
        item.address.toLowerCase().includes(searchItem.toLowerCase()) ||
        item.phone.toString().includes(searchItem.toLowerCase()) 
      )
    })
  }, [records, searchItem, tab]);

  //  search onchange funcation
  const handleSearch = (event) => {
    setsearchItem(event.target.value);
  }

  /*--------------------
     tab onchage funcation
   ----------------------*/

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  if (isLoading) {
    return <Spinner />;
  } else if (serverError) {
    return <Error500 />;
  } else if ((!permission || permission.name.toLowerCase() !== "admin") && !permissionToggle) {
    return <Error403 />;
  }

  return (
    <>
      <motion.div className="box" initial={{ opacity: 0, transform: "translateY(-20px)" }} animate={{ opacity: 1, transform: "translateY(0px)" }} transition={{ duration: 0.5 }}>
        <div className="container-fluid py-4">
          <div className="background-wrapper bg-white pb-4">
            <div className=''>
              <div className='row justify-content-end align-items-center row-std m-0'>
                <div className="col-12 col-sm-5 col-xl-3 d-flex justify-content-between align-items-center">
                  <div>
                    <ul id="breadcrumb" className="mb-0">
                      <li><NavLink to="/" className="ihome">Dashboard</NavLink></li>
                      <li><NavLink to="" className="ibeaker"><i className="fa-solid fa-play"></i> &nbsp; Clients</NavLink></li>
                    </ul>
                  </div>
                </div>
                <div className="col-12 col-sm-7 col-xl-9 d-flex justify-content-end" id="two">
                  <div className="d-flex justify-content-end align-items-center w-100" style={{ gap: '15px' }}>
                    <div className="search-full pr-0">
                      <input type="search" className="input-search-full" autoComplete='off' name="txt" placeholder="Search" value={searchItem} onChange={handleSearch} />
                      <i className="fas fa-search"></i>
                    </div>
                    <div className="search-box mr-3">
                      <form name="search-inner">
                        <input type="search" className="input-search" autoComplete='off' name="txt" value={searchItem} onChange={handleSearch} />
                      </form>
                      <i className="fas fa-search"></i>
                    </div>
                    <ClientFormComponent getClientDetail={getClient} />
                  </div>
                </div>
              </div>
            </div>
            <div className="mx-4 pt-2">
              <Box sx={{ width: '100%', borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                  value={tab}
                  onChange={handleTabChange}
                  textColor="secondary"
                  variant="scrollable"
                  scrollButtons="auto"
                  indicatorColor="secondary"
                  aria-label="secondary tabs example"
                  className="tab-panel-content"
                >
                  <Tab value="clients" label="Clients" className="tab-panel-header" />
                  <Tab value="deletes" label="Deleted Clients" className="tab-panel-header" />
                </Tabs>
              </Box>
            </div>
            <div className="mx-4 pt-3">
              <TableContainer >
                <Table className="common-table-section expanted-table">
                  <TableHead className="common-header">
                    <TableRow>
                      <TableCell>
                        <TableSortLabel active={orderBy === "business_name"} direction={orderBy === "business_name" ? order : "asc"} onClick={() => handleRequestSort("business_name")}>
                          Name
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel active={orderBy === "address"} direction={orderBy === "address" ? order : "asc"} onClick={() => handleRequestSort("address")}>
                          Address
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel active={orderBy === "client_industry"} direction={orderBy === "client_industry" ? order : "asc"} onClick={() => handleRequestSort("client_industry")}>
                          Client Industry
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel active={orderBy === "GSTIN"} direction={orderBy === "GSTIN" ? order : "asc"} onClick={() => handleRequestSort("GSTIN")}>
                          GSTIN
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel active={orderBy === "email"} direction={orderBy === "email" ? order : "asc"} onClick={() => handleRequestSort("email")}>
                          Email
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel active={orderBy === "phone"} direction={orderBy === "phone" ? order : "asc"} onClick={() => handleRequestSort("phone")}>
                          Phone
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recordsFilter.length !== 0 ? sortRowInformation(recordsFilter, getComparator(order, orderBy)).slice(count * page, count * page + count).map((val, ind) => {
                      return (
                        <TableRow key={val._id}>
                          <TableCell>{val.business_name}</TableCell>
                          <TableCell className='client-address'>{val.address}{val.city && ", " + val.city}{val.state && ", " + val.state}{val.country && ", " + val.country}{val.postcode && " " + val.postcode}</TableCell>
                          <TableCell>{val.client_industry ? val.client_industry :  <HiOutlineMinus/> }</TableCell>
                          <TableCell>{val.GSTIN ? val.GSTIN  : <HiOutlineMinus/> }</TableCell>
                          <TableCell>{val.email ? val.email : <HiOutlineMinus/>}</TableCell>
                          <TableCell>{val.phone ? val.phone : <HiOutlineMinus/>}</TableCell>
                          <TableCell>
                            <div className='action'>
                              {tab === "deletes" ?
                                <>
                                  <i className="fa-solid fa-clock-rotate-left" onClick={() => restoreInvoice(val._id)}></i>
                                  <i className="fa-solid fa-trash-can" onClick={() => deleteInvoice(val._id)}></i>
                                </>
                                : <>
                                  <ClientFormComponent getClientDetail={getClient} data={val}/>
                                  <i className="fa-solid fa-trash-can" onClick={() => deleteInvoice(val._id)}></i>
                                </>
                              }
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    }) :
                      <TableRow>
                        <TableCell colSpan={10} align="center">
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
            </div >
          </div>
        </div>
      </motion.div>
    </>
  )
}

export default ClientComponent
