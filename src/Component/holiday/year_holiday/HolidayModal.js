import axios from 'axios';
import React, { useRef, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import GlobalPageRedirect from '../../auth_context/GlobalPageRedirect';
import Spinner from '../../common/Spinner';
import DatePicker from 'react-date-picker';
import { GetLocalStorage } from '../../../service/StoreLocalStorage';
import { toast } from 'react-toastify';

const HolidayModal = ({ data, accessData, user, setToggle, toggle }) => {

  const [show, setShow] = useState(false);
  const [list, setlist] = useState({
    name: '',
    date: ""
  })
  const [nameError, setNameError] = useState("")
  const [dateError, setdateError] = useState("")
  const [id, setId] = useState('')
  const [loader, setloader] = useState(false)
  let toggleButton = false
  const [Error, setError] = useState([]);

  let { getCommonApi } = GlobalPageRedirect();

  let DateRef = useRef(null);

  // modal show function
  const handleShow = () => {
    if (data) {
      setId(data.id);
      setlist({
        name: data.name,
        date: data.date
      })
    }
    setShow(true)
  }

  // modal close function
  const handleClose = (e) => {
    e.preventDefault();
    setShow(false)
    setError([])
    setNameError("")
    setdateError("")
    setlist({
      name: "",
      date: ""
    })
    setId('')
  }

  // onchange
  const onchange = (e) => {
    setlist({ ...list, [e.target.name]: e.target.value })
    if (e.target.name === "date") {
      if (!e.target.value) {
        setdateError('Please select date.')
      } else {
        setdateError("");
      }
    }
  }

  // name validation 
  const nameValidate = () => {
    if (!list.name) {
      setNameError('Please enter holiday name.')
    } else if (!list.name.trim() || !list.name.match(/^[A-Za-z ]+$/)) {
      setNameError('Please enter a valid holiday name.')
    } else {
      setNameError("");
    }
  }

  const dateValidation = () => {
    if (!list.date) {
      setdateError('Please select date.')
    } else {
      setdateError("");
    }
  }


  const onSubmit = (e) => {
    e.preventDefault();
    setError([])
    nameValidate();
    dateValidation()

    if (!list.name || !list.date || nameError || dateError) {
      return false
    } else {
      if (id) {
        setloader(true)
        let token = GetLocalStorage('token');
        const request = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
        }
        axios.post(`${process.env.REACT_APP_API_KEY}/holiday_calendar/update`, { id: id, name: list.name.charAt(0).toUpperCase() + list.name.slice(1), date: list.date }, request)
          .then(data => {
            if (data.data.success) {
              setShow(false)
              setloader(false)
              setToggle(!toggle)
              toast.success('Successfully edited a holiday.')
              setlist({
                name: '',
                date: ""
              })
            } else {
              setloader(false);
              toast.error('Something went wrong, Please check your details and try again.')
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
                } else {
                  setError(error.response.data.error);
                }
              }
            }
          })
      }
      else {
        setloader(true)
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
            setShow(false)
            setloader(false)
            setToggle(!toggle)
            toast.success('Data added a successfully.')
            if (data.data.success) {
              setlist({
                name: '',
                date: ""
              })
              setId("")
            } else {
              setloader(false)
              toast.error('Something went wrong, Please check your details and try again.')
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
                } else {
                  setError(error.response.data.error);
                }
              }
            }
          })
      }
    }
  }


  // button toggle diable or not
  if (user.toLowerCase() !== 'admin') {
    if (accessData.length !== 0 && accessData[0].create === "1") {
      toggleButton = false
    } else {
      toggleButton = true
    }
  } else {
    toggleButton = false
  }

  return (
    <>
      {data ? <i className="fa-solid fa-pen-to-square" onClick={handleShow} ></i> :
        <button
          className='btn btn-gradient-primary btn-rounded btn-fw text-center ' onClick={handleShow} disabled={toggleButton}>
          <i className="fa-solid fa-plus" ></i>&nbsp;Add
        </button>
      }
      {/* Department Name * */}
      <Modal show={show} animation={true} size="md" aria-labelledby="example-modal-sizes-title-sm" className='small-modal department-modal' centered>
        <Modal.Header className='small-modal'>
          <Modal.Title>{data ? 'Edit Holiday' : 'Add Holiday'}
          </Modal.Title>
          <p className='close-modal' onClick={handleClose}><i className="fa-solid fa-xmark"></i></p>
        </Modal.Header>
        <Modal.Body>
          <div className=" grid-margin stretch-card inner-pages mb-lg-0">
            <div className="card">
              <div className="card-body">
                <form className="forms-sample">
                  <div className="form-group">
                    <label htmlFor="exampleInputfname" className='mt-3'> Holiday Name</label>
                    <input
                      type="text"
                      className="form-control text-capitalize"
                      placeholder="Enter holiday name"
                      value={list.name}
                      name='name'
                      onChange={onchange}
                      autoComplete='off'
                      onKeyUp={nameValidate}
                    />
                    {nameError && <small id="emailHelp" className="form-text error">{nameError}</small>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="exampleInputfname" className='mt-3'> Holiday Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={list.date}
                      name='date'
                      ref={DateRef}
                      onChange={onchange}
                      autoComplete='off'
                      onClick={() => { DateRef.current.showPicker(); dateValidation(); }}
                    />
                    {dateError && <small id="emailHelp" className="form-text error">{dateError}</small>}
                  </div>
                  <div className="form-group position-relative">
                    <label htmlFor="exampleInputfname" className='mt-3'> Holiday Name</label>
                    <DatePicker className="w-100 calcedar-field"
                      // onChange={fromDateChange}
                      format='y-MM-dd'
                      yearPlaceholder='YYYY'
                      monthPlaceholder='MM'
                      dayPlaceholder='DD'
                      // calendarIcon={<CalendarMonthIcon className='calendar-icon' />}
                      clearIcon=''
                      minDate={new Date()}
                    // value={from.from_date || ''}
                    // onCalendarClose={fromDateValidation}
                    />
                  </div>
                  <ol>
                    {Error.map((val) => {
                      return <li className='error' key={val} >{val}</li>
                    })}
                  </ol>
                  <div className='d-flex justify-content-end modal-button'>
                    <button type="submit" className="btn btn-gradient-primary mr-2" onClick={onSubmit}>Save</button>
                    <button className="btn btn-light" onClick={handleClose}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          {loader && <Spinner />}
        </Modal.Body >
      </Modal >
    </>
  )
}

export default HolidayModal