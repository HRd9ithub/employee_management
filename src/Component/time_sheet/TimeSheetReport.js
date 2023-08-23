import React, { useContext, useState } from 'react'
import DatePickers from "react-datepicker";
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css'
import { motion } from "framer-motion";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { AppProvider } from '../context/RouteContext'
import { NavLink } from 'react-router-dom';
import { useEffect } from 'react';
import axios from 'axios';
import Spinner from '../common/Spinner';
import { toast } from 'react-toastify';
import GlobalPageRedirect from '../auth_context/GlobalPageRedirect';
import DateRangePicker from 'react-bootstrap-daterangepicker';
import 'bootstrap-daterangepicker/daterangepicker.css';
import moment from 'moment';
import { Form } from 'react-bootstrap';
import { AiOutlineDownload } from "react-icons/ai";
import { CSVLink } from 'react-csv';
import { GetLocalStorage } from '../../service/StoreLocalStorage';
import { Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel } from "@mui/material";
import { subDays } from 'date-fns';

const TimeSheetReport = () => {
  let date_today = new Date();
  // const [startDate, setstartDate] = useState();
  const [user, setUser] = useState([]);
  const [data, setdata] = useState("4");
  const [startDate, setStartDate] = useState(new Date(date_today.getFullYear(), date_today.getMonth(), 1));
  const [selectedDate, setselectedDate] = useState(new Date());
  const [endDate, setendtDate] = useState(new Date());
  const [loader, setLoader] = useState(false);
  const [record, setRecord] = useState([])
  const [recordsFilter, setRecordFilter] = useState([])
  const [percentage, setpercentage] = useState("")
  const [toggle, settoggle] = useState(false)
  const [holidayDetail, setHolidayDetail] = useState([])

  // pagination state
  const [count, setCount] = useState(5)
  const [page, setpage] = useState(0)

  // sort state
  const [order, setOrder] = useState("asc")
  const [orderBy, setOrderBy] = useState("id")

  // eslint-disable-next-line
  let { accessData, UserData, handleVisibility, visible } = useContext(AppProvider);

  let { getCommonApi } = GlobalPageRedirect();

  // calendar date onchnage function
  const handleChange = date => {
    setselectedDate(date)
    settoggle(!toggle);
  };

  // get all user data
  useEffect(() => {
    const getuser = async () => {
      try {
        setLoader(true)
        let token = GetLocalStorage('token');
        const request = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
        }
        const res = await axios.get(`${process.env.REACT_APP_API_KEY}/user/list`, request)
        if (res.data.success) {
          setUser(res.data.data.filter((val) => val.role?.name.toLowerCase() !== "admin"))
        }
      } catch (error) {
        console.log('TimeSheetReport page get user data api ==== >>> ', error)
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
        setLoader(false)
      }
    }

    const get_holiday_detail = async () => {
      try {
        setLoader(true)
        let token = GetLocalStorage('token');
        const request = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
        }
        const res = await axios.get(`${process.env.REACT_APP_API_KEY}/holiday_calendar/list`, request)
        if (res.data.success) {
          setHolidayDetail(res.data.data)
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
        setLoader(false)
      }
    }
    if ((UserData && UserData.role.name.toLowerCase() === 'admin')) {
      getuser()
    }
    if ((UserData && UserData.role.name.toLowerCase() !== 'admin')) {
      get_holiday_detail()
    }
    // eslint-disable-next-line
  }, [])

  // filter onchange function
  const onChange = (e) => {
    let { value } = e.target;

    setdata(value)
    generateReport(value);
  }

  // generate  onclick function
  const generateReport = async (id) => {
    // handleMonthValidate();} else {
    let user_id = id || data

    let fromDate = moment(UserData && UserData.role?.name.toLowerCase() === 'admin' ? startDate : selectedDate).format("DD-MM-YYYY")
    let toDate = moment(UserData && UserData.role?.name.toLowerCase() === 'admin' ? endDate : selectedDate).format("DD-MM-YYYY")
    try {
      setLoader(true)
      const response = await axios.post(`${process.env.REACT_APP_API_KEY}/timesheet/filterTimeCount`, { fromDate, toDate, user_id }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GetLocalStorage('token')}`
        }
      });
      if (response.data.success) {
        if (UserData && UserData.role?.name.toLowerCase() === 'admin') {
          setRecord(response.data.data)
          setRecordFilter(response.data.data)
        } else {
          if (response.data.data.length > 0) {
            setpercentage(response.data.data[0].time)
          } else {
            setpercentage("0:0")
          }
        }
        setLoader(false);
      } else {
        setLoader(false)
        toast.error("Something went wrong, please check your details again and try.")
      }
    } catch (error) {
      console.log("🚀 ~ file: AccountForm.js:111 ~ HandleSubmit ~ error:", error)
      setLoader(false)
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
  }

  const handleCallback = (start, end, label) => {
    setStartDate(start._d)
    setendtDate(end._d)
  }

  // serach filter
  const handleFilter = (event) => {
    let data = event.target.value;
    let filter_data = record.filter((val, ind) => {
      return (
        (ind + 1).toString().includes(data.toLowerCase()) ||
        val.date?.toLowerCase().includes(data.toLowerCase()) ||
        (val.date && moment(val.date).format('dddd')).toLowerCase().includes(data.toLowerCase()) ||
        val.time?.toLowerCase().includes(data.toLowerCase())
      );
    });
    setRecordFilter(filter_data);
  }

  let header = [
    { label: "Id", key: "id" },
    { label: "Date", key: "Date" },
    { label: "Day", key: "Day" },
    { label: "Total Hours", key: "Hours" },
  ]

  let csvdata = recordsFilter.map((val, ind) => {
    return { id: ind + 1, Date: val.date, Day: moment(val.date).format('dddd'), Hours: val.time }
  })

  useEffect(() => {
    generateReport();
    // eslint-disable-next-line
  }, [UserData, toggle])

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
      <motion.div
        className="box"
        initial={{ opacity: 0, transform: 'translateY(-20px)' }}
        animate={{ opacity: 1, transform: 'translateY(0px)' }}
        transition={{ duration: 0.5 }}
      >
        {UserData && UserData.role?.name.toLowerCase() !== 'admin' ?
          <div className="row">
            <div className="col-md-5 grid-margin stretch-card">
              <div className="card ">
                <div className="card-body p-0 d-flex">
                  <div className="dashboard-custom-date-picker">
                    {(() => {
                      let highlight = [];

                      for (let index = 0; index < holidayDetail.length; index++) {
                        highlight.push(subDays(new Date(`${holidayDetail[index].date}`), 0));
                      }
                      return (
                        <DatePickers inline selected={selectedDate} onChange={handleChange} highlightDates={highlight} />
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-7 grid-margin stretch-card">
              <div className="card">
                <div className='head text-center'>
                  <h1>Total Working Hours</h1>
                </div>
                <div className='hours-standard'>
                  <CircularProgressbar
                    value={percentage.split(":").shift()}
                    text={`${percentage}`}
                    maxValue={10}
                    styles={buildStyles({
                      strokeLinecap: 'butt',
                      textSize: '16px',
                      maxValue: 10,
                      pathTransitionDuration: 0.8,
                      // pathColor: `rgb(7 74 151 ${percentage / 10})`,
                      textColor: '#f88',
                      trailColor: '#d6d6d6',
                      backgroundColor: '#074a98',
                    })}
                  />
                </div>
              </div>
            </div>
          </div> :
          <div className=''>
            <div className='container-fluid '>
              <div className="row breadcrumb-btn">
                <div className="col-lg-10 col-md-10 col-sm-9 col-8">
                  <ul id="breadcrumb" className="mb-0">
                    <li><a href="/" className="ihome"><span className="icon icon-home"> </span></a></li>
                    <li><a href="/TimeSheetReport" className="ibeaker"><i className="fa-solid fa-user icon"></i> Time Sheet Report</a></li>
                  </ul>
                </div>
                <div className="col-lg-2 col-md-2 col-sm-3 col-3">
                  <div className=' btn btn-gradient-primary btn-rounded btn-fw text-center'>
                    <CSVLink data={csvdata} headers={header} filename={"Work Report.csv"} target="_blank"><AiOutlineDownload />&nbsp;CSV</CSVLink>
                  </div>
                </div>
              </div>
            </div>
            <div className="background-wrapper bg-white pt-5">
              <div className='container-fluid'>
                <div className='row row-std inner-pages'>
                  {/* search box */}
                  <div className="col-md-8 col-sm-12 p-0 text-end" id="two"></div>
                  <div className="col-md-4 col-sm-12" id="two">
                    <Form.Control type="text" className="open" id="exampleInputUsername1" onChange={handleFilter} placeholder=" &#xf002; &nbsp; Search " size="lg" style={{ fontFamily: 'font_awesome', fontWeight: '500' }} />
                  </div>
                  {/* employee dropdrown part */}
                  <div className='col-md-6 col-sm-6 col-12 pr-sm-1'>
                    <div className="form-group mb-0">
                      <label htmlFor="1" className='mt-3'>Employees </label>
                      <select className="form-control" id="employee" name='data' value={data} onChange={onChange}>
                        <option value='0'>All</option>
                        {user.map((val) => {
                          return (
                            <option key={val.id} value={val.id}>{val.first_name.concat(" ", val.last_name)}</option>
                          )
                        })}
                      </select>
                    </div>
                  </div>
                  {/* month dropdrown part */}
                  <div className='col-md-6 col-sm-6 col-12 pl-sm-1'>
                    <div className="form-group mb-0">
                      <label htmlFor="1" className='mt-3'> Select date</label>
                      <DateRangePicker initialSettings={{ startDate: startDate, endDate: endDate }} onCallback={handleCallback}><input className="form-control" /></DateRangePicker>
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
                        {/* <TableSortLabel active={orderBy === "id"} direction={orderBy === "id" ? order : "asc"} onClick={() => handleRequestSort("id")}> */}
                        Id
                        {/* </TableSortLabel> */}
                      </TableCell>
                      <TableCell>
                        {/* <TableSortLabel active={orderBy === "date"} direction={orderBy === "date" ? order : "asc"} onClick={() => handleRequestSort("date")}> */}
                        name
                        {/* </TableSortLabel> */}
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
                      <TableCell>
                        <TableSortLabel active={orderBy === "time"} direction={orderBy === "time" ? order : "asc"} onClick={() => handleRequestSort("time")}>
                          Total Hours
                        </TableSortLabel>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recordsFilter.length !== 0 ? sortRowInformation(recordsFilter, getComparator(order, orderBy)).slice(count * page, count * page + count).map((val, ind) => {
                      return (
                        <TableRow key={ind}>
                          <TableCell>{ind + 1}</TableCell>
                          <TableCell>static</TableCell>
                          <TableCell>{val.date}</TableCell>
                          <TableCell>{moment(val.date).format('dddd')}</TableCell>
                          <TableCell>{val.time}</TableCell>
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
          </div>

        }
      </motion.div>
      {loader && <Spinner />}
    </>
  )
}

export default TimeSheetReport
