import axios from 'axios';
import moment from 'moment/moment';
import React, { useEffect, useRef, useState } from 'react'
import DatePickers from "react-datepicker";
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { motion } from "framer-motion";
import { useContext } from 'react';
import { AppProvider } from '../context/RouteContext';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import Spinner from '../common/Spinner';
import GlobalPageRedirect from '../auth_context/GlobalPageRedirect';
import { GetLocalStorage } from '../../service/StoreLocalStorage';
import { subDays } from "date-fns";

const Calendar = ({ HandleProgress }) => {
  let DateRef = useRef();
  const [startDate, setstartDate] = useState();
  const [list, setlist] = useState({
    name: '',
    date: ""
  })
  const [holidayDetail, setHolidayDetail] = useState([])
  const [holidayDetailfilter, setHolidayDetailfilter] = useState([])
  const [error, setError] = useState({})
  const [errorb, setErrorb] = useState([])
  const [isSubmit, setisSubmit] = useState(false)
  const [toggle, setToggle] = useState(false)
  const [loader, setLoader] = useState(false);
  const [editToggle, seteditToggle] = useState(false);
  const [datetoggle, setdatetoggle] = useState(false);

  let { accessData, UserData, } = useContext(AppProvider)

  let { getCommonApi } = GlobalPageRedirect();

  // calcedar date change function
  const handleChange = date => {
    setdatetoggle(false)
    setstartDate(date)
    let response = holidayDetailfilter.filter((val) => {
      return val.date === moment(date).format("YYYY-MM-DD")
    })
    setHolidayDetail(response)
  };

  // name onchange function and validation
  const inputChangeHandler = (event) => {
    setlist({ ...list, name: event.target.value })
    if (!event.target.value) {
      setError({ ...error, name: 'Please enter holiday name.' })
    } else if (!event.target.value.trim() || !event.target.value.match(/^[A-Za-z ]+$/)) {
      setError({ ...error, name: 'Please enter a valid holiday name.' })
    } else {
      delete error['name']
      setError({ ...error })
    }
  }

  // submit function
  const addTodo = (event) => {
    event.preventDefault();
    let res_error = validate(list)
    setError(res_error);
    Object.keys(res_error).length === 0 && setisSubmit(true)
  }

  // button click validation
  const validate = (val) => {
    let error = {};
    if (!val.name) {
      error.name = 'Please enter holiday name.'
    } else if (!val.name.trim() || !val.name.match(/^[A-Za-z ]+$/)) {
      error.name = 'Please enter a valid holiday name.'
    }

    if (!val.date) {
      error.date = 'Please select date.'
    }
    return error
  }

  useEffect(() => {
    if (Object.keys(error).length === 0 && isSubmit) {
      onSubmit()
    }
    // eslint-disable-next-line
  }, [error, isSubmit])

  const onSubmit = () => {
    setErrorb([])
    if (editToggle) {
      setLoader(true)
      let token = GetLocalStorage('token');
      const request = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
      }
      axios.post(`${process.env.REACT_APP_API_KEY}/holiday_calendar/update`, { id: list.id, name: list.name.charAt(0).toUpperCase() + list.name.slice(1), date: list.date }, request)
        .then(data => {
          if (data.data.success) {
            setlist({
              name: '',
              date: ""
            })
            setToggle(!toggle)
            seteditToggle(false)
            toast.success('Successfully edited a holiday.')
          } else {
            setLoader(false);
            toast.error('Something went wrong, Please check your details and try again.')
          }
          setisSubmit(false)
        }).catch((error) => {
          setLoader(false)
          setisSubmit(false)
          console.log('error', error)
          if (error.response.status === 401) {
            getCommonApi();
          } else {
            if (error.response.data.message) {
              toast.error(error.response.data.message)
            } else {
              if (typeof error.response.data.error === "string") {
                toast.error(error.response.data.error)
              } else {
                setError(error.response.data.error);
              }
            }
          }
        })
    } else {
      setLoader(true)
      let token = GetLocalStorage('token');
      const request = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      }
      axios.post(`${process.env.REACT_APP_API_KEY}/holiday_calendar/add`, { name: list.name.charAt(0).toUpperCase() + list.name.slice(1), date: list.date }, request)
        .then(data => {
          if (data.data.success) {
            setlist({
              name: '',
              date: ""
            })
            setToggle(!toggle)
            toast.success('Successfully added a new holiday.')
          } else {
            setLoader(false)
            toast.error('Something went wrong, Please check your details and try again.')
          }
          setisSubmit(false)
        }).catch((error) => {
          setisSubmit(false)
          setLoader(false)
          console.log('error', error)
          if (error.response.status === 401) {
            getCommonApi();
          } else {
            if (error.response.data.message) {
              toast.error(error.response.data.message)
            } else {
              if (typeof error.response.data.error === "string") {
                toast.error(error.response.data.error)
              } else {
                setError(error.response.data.error);
              }
            }
          }
        })
    }
  }

  // delete function
  const removeTodo = (id) => {
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
        setLoader(true)
        const res = await axios.post(`${process.env.REACT_APP_API_KEY}/holiday_calendar/delete`, { id: id }, request)
        if (res.data.success) {
          toast.success('Successfully deleted a holiday.')
          setToggle(!toggle)
        } else {
          setLoader(false);
          toast.error(res.data.message)
        }
      }
    }).catch((error) => {
      setLoader(false)
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

  // edit function
  const editHoliday = (id) => {
    let single_detail = holidayDetail.find((elem) => {
      return elem.id === id
    })
    setlist({ name: single_detail.name, id: single_detail.id, date: single_detail.date })
    seteditToggle(true)
  }

  // get holiday data
  useEffect(() => {
    const get_holiday_detail = async () => {
      HandleProgress(20)
      try {
        setLoader(true)
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
          setHolidayDetail(res.data.data)
          setHolidayDetailfilter(res.data.data)
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
        setLoader(false)
      }
    }
    get_holiday_detail()
    // eslint-disable-next-line
  }, [toggle])


  // date onchange and   validate
  const handleJoinDate = (value) => {
    if (!value) {
      setError({ ...error, date: 'Please select date.' })
    } else {
      setlist({ ...list, 'date': value })
      delete error['date']
      setError({ ...error })
    }
  }

  return (
    <>
      <motion.div
        className="box"
        initial={{ opacity: 0, transform: 'translateY(-20px)' }}
        animate={{ opacity: 1, transform: 'translateY(0px)' }}
        transition={{ duration: 0.5 }}
      >
        <div className="row calender-row inner-pages">
          <div className="col-lg-5 grid-margin stretch-card calender-wrapper">
            <div className="card">
              <div className="card-body p-0 d-flex">

                <div className="dashboard-custom-date-picker">
                  {(() => {
                    let highlight = [];

                    for (let index = 0; index < holidayDetailfilter.length; index++) {
                      highlight.push(subDays(new Date(`${holidayDetailfilter[index].date}`), 0));
                    }
                    return (
                      <DatePickers inline selected={startDate} onChange={handleChange} highlightDates={highlight}/>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-7 grid-margin stretch-card standard-wrapper">
            <div className="card calender">
              <div className="card-body">
                {UserData && UserData.role.name.toLowerCase() === 'admin' &&
                  <form className="add-items d-flex justify-content-between" onSubmit={addTodo}>
                    <div className='me-5 w-100'>
                      <input
                        type="text"
                        className="form-control h-auto"
                        placeholder="Enter holiday name"
                        value={list.name}
                        name='name'
                        onChange={inputChangeHandler}
                        autoComplete='off'
                      />
                      {error.name && <div className='error'>{error.name}</div>}
                    </div>
                    <div className='me-5 w-100 position-relative'>
                      <input type="date"
                        className="form-control"
                        value={list.date || ''}
                        ref={DateRef}
                        onChange={(e) => handleJoinDate(e.target.value)}
                        autoComplete='off'
                        onClick={() => { DateRef.current.showPicker(); }}
                        max={moment(new Date()).format("YYYY-MM-DD")}
                      />
                      <CalendarMonthIcon className='calendar-icon-holiday' />
                      {error.date && <div className='error'>{error.date}</div>}
                    </div>
                    {!editToggle ?
                      <button type="submit" className="btn btn-gradient-primary btn-add font-weight-bold" disabled={!((UserData && UserData.role.name.toLowerCase() === 'admin') || (accessData.length !== 0 && accessData[0].create === '1'))}>Add</button> :
                      <>
                        <button type="submit" className="btn btn-gradient-primary font-weight-bold px-lg-4 px-3">Update</button>
                        <button className=' delete action-icon' onClick={() => {
                          setlist({
                            name: '',
                            date: ""
                          })
                          seteditToggle(false)
                        }}>
                          <i className={`remove mdi mdi-close-circle-outline`} ></i>
                        </button>
                      </>}
                  </form>}
                <div className="list-wrapper">
                  <ol>
                    {errorb.map((val) => {
                      return <li className='error' key={val}>{val}</li>
                    })}
                  </ol>

                  <ul className="d-flex flex-column todo-list">
                    {holidayDetail.map((elem, index) => {
                      return (
                        <li key={elem.id}>
                          <div className="form-check">
                            <label htmlFor="" className="form-check-label" onClick={() => { setstartDate(new Date(elem.date)); setdatetoggle(true) }} style={{ cursor: 'pointer', textTransform: 'capitalize' }}>  {moment(elem.date).format('DD MMM YYYY')}&nbsp;{(moment(elem.date).format('dddd'))}&nbsp;&nbsp;{elem.name}
                              <i className="input-helper"></i>
                            </label>
                          </div>
                          {(UserData && UserData.role.name.toLowerCase() === 'admin') || (accessData.length !== 0 && accessData[0].update === '1') ?
                            <button className='edit action-icon' onClick={() => editHoliday(elem.id)} >
                              <i className="fa-solid fa-pen-to-square" ></i>
                            </button> : ""}
                          {(UserData && UserData.role.name.toLowerCase() === 'admin') || (accessData.length !== 0 && accessData[0].delete === '1') ?
                            <button className=' delete action-icon' onClick={() => removeTodo(elem.id)} >
                              <i className={`remove mdi mdi-close-circle-outline`} ></i>
                            </button> : ""}
                        </li>
                      )
                    })}
                    {holidayDetail.length === 0 && <div className='text-center my-4 text-muted'><h4>No Records Found</h4></div>}
                  </ul>
                  {startDate && !datetoggle &&
                    <div className='text-center text-md-right my-2'>
                      <button className='btn btn-light' disabled={holidayDetailfilter.length === 0} onClick={() => {
                        setstartDate("")
                        setHolidayDetail(holidayDetailfilter)
                      }}>View all</button>
                    </div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      {loader && <Spinner />}
    </>
  )
}

export default Calendar
