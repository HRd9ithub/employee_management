import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react'
import DatePickers from "react-datepicker";
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { motion } from "framer-motion";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import Spinner from '../../common/Spinner';
import GlobalPageRedirect from '../../auth_context/GlobalPageRedirect';
import { subDays } from "date-fns";
import { NavLink } from 'react-router-dom';
import Error403 from '../../error_pages/Error403';
import Error500 from '../../error_pages/Error500';
import { customAxios } from '../../../service/CreateApi';

const Calendar = () => {
  let DateRef = useRef();
  const [startDate, setstartDate] = useState();
  const [list, setlist] = useState({
    name: '',
    date: ""
  })
  const [holidayDetail, setHolidayDetail] = useState([])
  const [holidayDetailfilter, setHolidayDetailfilter] = useState([])
  const [nameError, setnameError] = useState("")
  const [dateError, setdateError] = useState("")
  const [errorb, setErrorb] = useState([])
  const [toggle, setToggle] = useState(false)
  const [isLoading, setisLoading] = useState(false);
  const [editToggle, seteditToggle] = useState(false);
  const [datetoggle, setdatetoggle] = useState(false);
  const [permission, setpermission] = useState("");
  const [serverError, setServerError] = useState(false);

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
    setlist({ ...list, [event.target.name]: event.target.value })
  }

  const handlenameValidate = () => {
    if (!list.name) {
      setnameError('Name is a required field.')
    } else if (!list.name.trim() || !list.name.match(/^[A-Za-z ]+$/)) {
      setnameError('Please enter a valid holiday name.')
    } else {
      setnameError("")
    }
  }
  const handledateValidate = () => {
    if (!list.date) {
      setdateError('Date is a required field.');
    } else {
      setdateError("");
    }
  }

  // submit function
  const addTodo = (event) => {
    event.preventDefault();
    handledateValidate();
    handlenameValidate();

    let { name, date } = list;
    if (!name || nameError || !date || dateError) {
      return false
    }
    onSubmit()
  }


  const onSubmit = () => {
    setErrorb([])
    setisLoading(true)
    let url = "";

    if (editToggle) {
      url = customAxios().put(`/holiday/${list.id}`, {
        name: list.name.charAt(0).toUpperCase() + list.name.slice(1),
        date: list.date,
        day: moment(list.date).format("dddd")
      })
    } else {
      url = customAxios().post('/holiday/', {
        name: list.name.charAt(0).toUpperCase() + list.name.slice(1),
        date: list.date,
        day: moment(list.date).format("dddd")
      })
    }

    url.then(data => {
      if (data.data.success) {
        setlist({
          name: '',
          date: ""
        })
        setToggle(!toggle)
        seteditToggle(false)
        toast.success(data.data.message)
      }
    }).catch((error) => {
      if (!error.response) {
        toast.error(error.message)
      } else if (error.response.status === 401) {
        getCommonApi();
      } else {
        if (error.response.data.message) {
          toast.error(error.response.data.message)
        } else {
          setErrorb(error.response.data.error)
        }
      }
    }).finally(() => setisLoading(false))
  }

  // delete function
  const removeTodo = (id) => {
    Swal.fire({
      title: 'Delete Holiday',
      text: "Are you sure you want to delete?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: '#1bcfb4',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Delete it',
      cancelButtonText: 'Cancel',
      width: '450px',
    }).then(async (result) => {
      if (result.isConfirmed) {
        setisLoading(true)
        const res = await customAxios().delete(`/holiday/${id}`);
        if (res.data.success) {
          toast.success(res.data.message)
          setToggle(!toggle)
        }
      }
    }).catch((error) => {
      setisLoading(false)
      if (!error.response) {
        toast.error(error.message)
      } else if (error.response.status === 401) {
        getCommonApi();
      } else {
        if (error.response.data.message) {
          toast.error(error.response.data.message)
        }
      }
    })
  }

  // edit function
  const editHoliday = (id) => {
    setnameError('');
    setdateError('');
    let single_detail = holidayDetail.find((elem) => {
      return elem._id === id
    })
    setlist({ name: single_detail.name, id: single_detail._id, date: single_detail.date })
    seteditToggle(true)
  }

  // get holiday data
  useEffect(() => {
    const get_holiday_detail = async () => {
      try {
        setisLoading(true);
        setServerError(false);
        const res = await customAxios().get('/holiday/');
        if (res.data.success) {
          setHolidayDetail(res.data.data)
          setHolidayDetailfilter(res.data.data)
          setpermission(res.data.permissions)
        }
      } catch (error) {
        if (!error.response) {
          setServerError(true)
          toast.error(error.message)
        } else if (error.response.status === 401) {
          getCommonApi();
        } else {
          if (error.response.status === 500) {
            setServerError(true)
          }
          if (error.response.data.message) {
            toast.error(error.response.data.message)
          }
        }
      } finally {
        setisLoading(false)
      }
    }
    get_holiday_detail()
    // eslint-disable-next-line
  }, [toggle])

  if (isLoading) {
    return <Spinner />;
  } else if (serverError) {
    return <Error500 />;
  } else if (!permission || (permission.name.toLowerCase() !== "admin" && (permission.permissions.length !== 0 && permission.permissions.list === 0))) {
    return <Error403 />;
  }


  return (
    <>
      <motion.div
        className="box"
        initial={{ opacity: 0, transform: 'translateY(-20px)' }}
        animate={{ opacity: 1, transform: 'translateY(0px)' }}
        transition={{ duration: 0.5 }}
      >
        <div className='container-fluid pt-4 overflow-hidden'>
          <div className="background-wrapper bg-white pt-4">
            <div className="col-12 d-flex justify-content-between align-items-center pb-2">
              <div>
                <ul id="breadcrumb" className="mb-0">
                  <li><NavLink to="/" className="ihome">Dashboard</NavLink></li>
                  <li><NavLink to="" className="ibeaker"><i className="fa-solid fa-play"></i> &nbsp; Calender</NavLink></li>
                </ul>
              </div>
            </div>
            <div className="row px-4 pb-5">
              <div className="col-md-7 grid-margin stretch-card calender-wrapper employee-side-calender pb-3 pb-md-0 pb-lg-0 pb-xl-0">
                <div className="card">
                  <div className="card-body p-0 d-flex">
                    <div className="dashboard-custom-date-picker">
                      {(() => {
                        let highlight = [];

                        for (let index = 0; index < holidayDetailfilter.length; index++) {
                          highlight.push(subDays(new Date(`${holidayDetailfilter[index].date}`), 0));
                        }
                        return (
                          <DatePickers inline selected={startDate} onChange={handleChange} highlightDates={highlight} />
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-5 grid-margin stretch-card standard-wrapper employee-side">
                <div className="card calender">
                  <div className="card-body">
                    {permission && permission.name.toLowerCase() === "admin" &&
                      <form className="add-items d-flex justify-content-between align-items-start" onSubmit={addTodo}>
                        <div className='me-5 w-100'>
                          <input
                            type="text"
                            className="form-control h-auto"
                            placeholder="Enter holiday name"
                            value={list.name}
                            name='name'
                            onChange={inputChangeHandler}
                            onBlur={handlenameValidate}
                            autoComplete='off'
                          />
                          {nameError && <div className='error'>{nameError}</div>}
                        </div>
                        <div className='me-5 w-100 position-relative'>
                          <input type="date"
                            className="form-control"
                            name='date'
                            value={list.date || ''}
                            ref={DateRef}
                            onChange={inputChangeHandler}
                            autoComplete='off'
                            onClick={() => { DateRef.current.showPicker() }}
                            onBlur={handledateValidate}
                          />
                          <CalendarMonthIcon className='calendar-icon-holiday' onClick={() => { DateRef.current.showPicker(); }} />
                          {dateError && <div className='error'>{dateError}</div>}
                        </div>
                        <div className='add-update-button d-flex justify-content-center align-items-center'>
                          <button type="submit" className="btn btn-gradient-primary btn-add font-weight-bold mt-0" >{!editToggle ? 'Add' : 'Update'}</button>
                          {editToggle &&
                            <button className='delete action-icon' onClick={() => {
                              setlist({
                                name: '',
                                date: ""
                              })
                              seteditToggle(false)
                            }}>
                              <i className={`remove mdi mdi-close-circle-outline`} ></i>
                            </button>
                          }
                        </div>
                      </form>}
                    <div className="list-wrapper">
                      <ol>
                        {errorb.map((val) => {
                          return <li className='error' key={val}>{val}</li>
                        })}
                      </ol>

                      <ul className="d-flex flex-column todo-list">
                        {holidayDetail.sort(function (a, b) {
                          return new Date(a.date) - new Date(b.date)
                        }).map((elem, index) => {
                          return (
                            permission && (permission.name.toLowerCase() === "admin") ?
                              <li key={elem._id}>
                                <div className="form-check">
                                  <label htmlFor="" className="form-check-label m-0" onClick={() => { setstartDate(new Date(elem.date)); setdatetoggle(true) }} style={{ cursor: 'pointer', textTransform: 'capitalize' }}>  {moment(elem.date).format('DD MMM YYYY')}&nbsp;&nbsp;{elem.day}&nbsp;&nbsp;{elem.name}</label>
                                </div>
                                <button className='edit action-icon' onClick={() => editHoliday(elem._id)} >
                                  <i className="fa-solid fa-pen-to-square" ></i>
                                </button>
                                <button className='delete action-icon' onClick={() => removeTodo(elem._id)} >
                                  <i className={`remove mdi mdi-close-circle-outline`} ></i>
                                </button>
                              </li>
                              :
                              <li key={elem._id} style={{ cursor: 'pointer' }} onClick={() => { setstartDate(new Date(elem.date)); setdatetoggle(true) }}>
                                <div className="form-check">
                                  <label htmlFor="" className="form-check-label m-0" style={{ textTransform: 'capitalize' }}>  {moment(elem.date).format('DD MMM YYYY')}&nbsp;&nbsp;{elem.day}&nbsp;&nbsp;{elem.name}</label>
                                </div>
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
          </div>
        </div>
      </motion.div>
    </>
  )
}

export default Calendar
