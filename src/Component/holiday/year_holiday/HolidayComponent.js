import React, { useContext, useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom';
import axios from 'axios'
import Spinner from '../../common/Spinner';
import Swal from 'sweetalert2'
import { toast } from 'react-toastify'
import { Form } from 'react-bootstrap';
import { motion } from 'framer-motion'
import { AppProvider } from '../../context/RouteContext'
import GlobalPageRedirect from '../../auth_context/GlobalPageRedirect'
import { GetLocalStorage } from '../../../service/StoreLocalStorage';
import { Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel } from "@mui/material";
import HolidayModal from './HolidayModal';
import moment from 'moment';

const HolidayComponent = ({ HandleProgress }) => {
  const [loader, setloader] = useState(false);
  const [records, setRecords] = useState([]);
  const [recordsFilter, setRecordsFilter] = useState([]);
  const [toggle, setToggle] = useState(false);

  let { UserData, accessData, handleVisibility, visible } = useContext(AppProvider)

  // pagination state
  const [count, setCount] = useState(5)
  const [page, setpage] = useState(0)

  // sort state
  const [order, setOrder] = useState("asc")
  const [orderBy, setOrderBy] = useState("id")

  let { getCommonApi } = GlobalPageRedirect();

  // get holiday data
  useEffect(() => {
    const get_holiday_detail = async () => {
      HandleProgress(20)
      try {
        setloader(true)
        let token = GetLocalStorage('token');
        const request = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
        }
        HandleProgress(50)
        const res = await axios.get(`${process.env.REACT_APP_API_KEY}/holiday_calendar/list`, request)
        HandleProgress(70)
        if (res.data.success) {
          setRecords(res.data.data)
          setRecordsFilter(res.data.data)
        }
      } catch (error) {
        console.log('error', error)
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
        HandleProgress(100)
        setloader(false)
      }
    }
    get_holiday_detail()
    // eslint-disable-next-line
  }, [toggle])


    // delete function
    const deleteHoliday = (id) => {
      let token = GetLocalStorage('token');
      const request = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
      Swal.fire({
        title: 'Delete Holiday',
        text: "Are you sure want to delete?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: '#1bcfb4',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel!',
        width: '450px',
      }).then(async (result) => {
        if (result.isConfirmed) {
          setloader(true)
          const res = await axios.post(`${process.env.REACT_APP_API_KEY}/holiday_calendar/delete`, { id: id }, request)
          if (res.data.success) {
            setloader(false);
            toast.success('Successfully deleted a holiday.')
            setToggle(!toggle)
          } else {
            setloader(false);
            toast.error(res.data.message)
          }
        }
      }).catch((error) => {
        setloader(false)
        console.log('error', error)
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
    }

    // search function
     const handleSerach = (e) => {
        let value = e.target.value.toLowerCase();

        let filter_data = records.filter((val) => {
          return val.id.toString().includes(value) ||
                 val.name.toLowerCase().includes(value) ||
                 moment(val.date).format('DD MMM YYYY').toLowerCase().includes(value) ||
                 moment(val.date).format('dddd').toLowerCase().includes(value)
        })
        setRecordsFilter(filter_data)
     }

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
    if (orderBy === "day") {
      if (moment(b.date).format('dddd') < moment(a.date).format('dddd')) {
        return -1
      }
      if (moment(b.date).format('dddd') > moment(a.date).format('dddd')) {
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
      {loader && <Spinner />}
      <motion.div
        className="box"
        initial={{ opacity: 0, transform: 'translateY(-20px)' }}
        animate={{ opacity: 1, transform: 'translateY(0px)' }}
        transition={{ duration: 0.5, ease: 'linear' }}
      >
        <div className='employee-content'>
          <div className='container-fluid inner-pages'>
            <div className='row align-items-center row-std'>
              <div className="col-md-7 col-sm-6 col-8 employee-path" id="one">
                <h1 className='page-title'>Holidays {new Date().getFullYear()}</h1>
                <ul className='path employee-path'>
                  <li className='path-title'><NavLink to='/'>Dashboard</NavLink></li>
                  <li className='path-title active'><NavLink to='/holidays'>Holidays</NavLink></li>
                </ul>
              </div>
              {/* search box */}
              <div className={`col-md-3 col-sm-4 col-3 p-0 text-end `} id="two">
                <Form.Control type="text" className={`${visible ? "open" : "close-btn"}`} id="exampleInputUsername1" placeholder=" &#xf002; &nbsp; Search " size="lg" style={{ fontFamily: 'font_awesome', fontWeight: '500' }} onChange={handleSerach} />
                <div className="magnifierContainer">
                  <i className={`fa-solid fa-magnifying-glass material-icons`} onClick={handleVisibility}></i>
                </div>
              </div>
              <div className="col-md-2 col-sm-2 col-1 p-0" id="three">
                <div className=' add-employee-btn'>
                  <HolidayModal accessData={accessData} toggle={toggle} user={UserData && UserData.role.name} records={records} setToggle={setToggle} />
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
                    <TableSortLabel active={orderBy === "id"} direction={orderBy === "id" ? order : "asc"} onClick={() => handleRequestSort("id")}>
                      Id
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel active={orderBy === "name"} direction={orderBy === "name" ? order : "asc"} onClick={() => handleRequestSort("name")}>
                      Holiday Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel active={orderBy === "date"} direction={orderBy === "date" ? order : "asc"} onClick={() => handleRequestSort("date")}>
                      Date
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel active={orderBy === "day"} direction={orderBy === "day" ? order : "asc"} onClick={() => handleRequestSort("day")}>
                      Day
                    </TableSortLabel>
                  </TableCell>
                  {!((UserData && UserData.role.name.toLowerCase() !== "admin") && (accessData.length === 0  || (accessData.length !== 0 && accessData[0].update === "0" && accessData[0].delete === "0"))) && 
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
                      <TableCell>{moment(val.date).format('DD MMM YYYY')}</TableCell>
                      <TableCell>{moment(val.date).format('dddd')}</TableCell>
                      {!((UserData && UserData.role.name.toLowerCase() !== "admin") && (accessData.length === 0  || (accessData.length !== 0 && accessData[0].update === "0" && accessData[0].delete === "0"))) && 
                      <TableCell>
                        <div className='action'>
                          {(UserData && UserData.role.name.toLowerCase() !== "admin") && (accessData.length === 0  || (accessData.length !== 0 && accessData[0].update === "0")) ? "" :
                             <HolidayModal accessData={accessData} toggle={toggle} user={UserData && UserData.role.name} records={records} setToggle={setToggle} data={val} />
                          }
                          {(UserData && UserData.role.name.toLowerCase() !== "admin") && accessData.length === 0  || (accessData.length !== 0 && accessData[0].delete === "0") ? "" : <i className="fa-solid fa-trash-can" onClick={() => deleteHoliday(val.id)}></i>}
                        </div>
                      </TableCell>}
                    </TableRow>
                  )
                }) :
                  <TableRow>
                    <TableCell colSpan={5} align="center">
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
      </motion.div>

    </>
  )
}

export default HolidayComponent;