import Modal from 'react-bootstrap/Modal';
import React, { useEffect, useRef } from 'react'
import { useState } from 'react';
import Form from 'react-bootstrap/Form';
import { toast } from 'react-toastify';
import axios from 'axios';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import moment from 'moment';
import Spinner from '../common/Spinner';
import GlobalPageRedirect from '../auth_context/GlobalPageRedirect';
import { GetLocalStorage } from '../../service/StoreLocalStorage';

const LeaveModal = (props) => {
    let { data, getLeave, UserData, accessData } = props;
    const [show, setShow] = useState(false);
    const [loader, setloader] = useState(false)
    const [leaveTypeDetail, setleaveTypeDetail] = useState([])
    const [user, setUser] = useState([])
    let [page, setPage] = useState(false)
    let [leaveType, setleaveType] = useState("")
    const [leave, setleave] = useState({
        leave_type_id: '',
        leave_type_id_error: '',
    });
    const [from, setFrom] = useState({
        from_date: '',
        from_date_error: '',
    });
    const [to, setTo] = useState({
        to_date: '',
        to_date_error: '',
    });
    let day = ''
    const [status_info, setStatus] = useState({
        leave_status: "",
        leave_status_error: "",
        status: 'Approved'
    })
    const [info, setinfo] = useState({
        user_id: "",
        user_id_error: ""
    })
    const [reason, setReason] = useState({
        description: "",
        description_error: ""
    })
    const [id, setId] = useState('')
    const [error, setError] = useState([])
    let toggleButton = false

    let { getCommonApi } = GlobalPageRedirect();

    let fromDateRef = useRef();
    let toDateRef = useRef();

    // modal show function
    const handleShow = () => {
        if (data) {
            setleave({ leave_type_id: data.leave_type_id })
            setStatus({ leave_status: data.leave_status, status: data.status })
            setReason({ description: data.description })
            setFrom({ from_date: moment(new Date(data.from_date)).format("YYYY-MM-DD") })
            setTo({ to_date: moment(new Date(data.to_date)).format("YYYY-MM-DD") })
            setinfo({ user_id: data.user_id })
            setId(data.id)
        }
        setPage(true)
        setShow(true)
    }

    // modal close function
    const handleClose = (e) => {
        e.preventDefault();
        setShow(false)
        setleave({ leave_type_id: '', leave_type_id_error: "" })
        setStatus({ leave_status: '', leave_status_error: '', status: "Approved" })
        setReason({ description: '', description_error: '' })
        setFrom({ from_date: '', from_date_error: '' })
        setTo({ to_date: '', to_date_error: "" })
        setinfo({ user_id: '', user_id_error: "" })
        setError([])
        setPage(false)
    }

    //leave type  onchange function
    const InputEvent = (e) => {
        let value = e.target.value;
        setleave({ ...leave, leave_type_id: value })
        let data = leaveTypeDetail.find((val) => val.id.toString() === value)
        if (data?.name.toLowerCase() === "casual leave") {
            let date = new Date();
            date.setDate(date.getDate() + 4);
            setleaveType(moment(date).format("YYYY-MM-DD"))
            console.warn(moment(date).format("YYYY-MM-DD"))
        } else {
            setleaveType("");
        }
    }

    // submit function
    const HandleSubmit = (e) => {
        e.preventDefault();
        UserData && UserData.name.toLowerCase() === 'admin' && userValidation()
        leaveTypeValidation();
        fromDateValidation();
        toDateValidation();
        leaveStatusValidation();
        descriptionValidate()
        setError([])

        if (!leave.leave_type_id || !from.from_date || !to.to_date || !status_info.leave_status || !reason.description || (UserData && UserData.name.toLowerCase() === 'admin' && !info.user_id)) {
            return false;
        } else {
            setloader(true);
            // object destructuring
            let { leave_type_id } = leave
            let { from_date } = from
            let { to_date } = to
            let { leave_status, status } = status_info
            let { description } = reason
            let { user_id } = info

            if (data) {
                // edit api call
                let token = GetLocalStorage('token');
                const request = {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    }
                }
                axios.post(`${process.env.REACT_APP_API_KEY}/leave/update`, { id, leave_type_id, user_id, from_date: moment(from_date).format("DD-MM-YYYY"), to_date: moment(to_date).format("DD-MM-YYYY"), leave_status, description, day, status: UserData && UserData.name.toLowerCase() !== 'admin' ? "Pending" : status }, request)
                    .then(data => {
                        if (data.data.success) {
                            setloader(false)
                            toast.success('Successfully Edited a leave.')
                            setShow(false)
                            setPage(false)
                            getLeave()
                        } else {
                            setloader(false)
                            setPage(false)
                            toast.error("Something went wrong, Please check your details and try again.")
                        }
                    }).catch((error) => {
                        setloader(false)
                        setPage(false)
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
                setloader(true);
                // add api call
                let token = GetLocalStorage('token');
                const request = {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                }
                axios.post(`${process.env.REACT_APP_API_KEY}/leave/add`, { leave_type_id, user_id, from_date: moment(from_date).format("YYYY-MM-DD"), to_date: moment(to_date).format("YYYY-MM-DD"), leave_status, description, day, status: UserData && UserData.name.toLowerCase() !== 'admin' ? "Pending" : status }, request)
                    .then(data => {
                        if (data.data.success) {
                            setloader(false)
                            setPage(false)
                            toast.success('Successfully added a new leave.')
                            setShow(false)
                            setleave({ leave_type_id: '', leave_type_id_error: "" })
                            setStatus({ leave_status: '', leave_status_error: '', status: "Pending" })
                            setReason({ description: '', description_error: '' })
                            setFrom({ from_date: '', from_date_error: '' })
                            setTo({ to_date: '', to_date_error: "" })
                            setinfo({ user_id: '', user_id_error: "" })
                            getLeave()
                        } else {
                            setloader(false)
                            setPage(false)
                            toast.error("Something went wrong, Please check your details and try again.")
                        }
                    }).catch((error) => {
                        setloader(false)
                        setPage(false)
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

    useEffect(() => {
        // leave type get data in api
        const getLeaveType = async () => {
            try {
                let token = GetLocalStorage('token');
                const request = {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                }
                const res = await axios.get(`${process.env.REACT_APP_API_KEY}/leave_type/list`, request)
                if (res.data.success) {
                    setleaveTypeDetail(res.data.data)
                    setloader(false)
                }
            } catch (error) {
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
            }
        }
        // user data get
        const getuser = async () => {
            try {
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
            }
        }
        if (page) {
            setloader(true)
            getLeaveType()
        }
        if ((UserData && UserData.name.toLowerCase() === 'admin') && page) {
            getuser()
        }
        // eslint-disable-next-line
    }, [page])

    //user validation
    const userValidation = () => {
        if (user.length !== 0) {
            if (!info.user_id || info.user_id === '0') {
                setinfo({ ...info, user_id_error: "Please select user." })
                return false
            } else {
                setinfo({ ...info, user_id_error: '' })
            }
        }
    }
    // leave type validation
    const leaveTypeValidation = () => {
        if (leaveTypeDetail.length !== 0) {
            if (!leave.leave_type_id || leave.leave_type_id === '0') {
                setleave({ ...leave, leave_type_id_error: "Please select the option." })
                return false
            } else {
                setleave({ ...leave, leave_type_id_error: '' })
            }
        }
    }
    // from date validation
    const fromDateValidation = () => {
        if (!from.from_date) {
            setFrom({ ...from, from_date_error: "Please select date." })
            return false
        } else {
            setFrom({ ...from, from_date_error: '' })
        }
    }

    // from date onchange function
    const fromDateChange = (e) => {
        if (!e.target.value) {
            setFrom({ ...from, from_date_error: "Please select date.", from_date: "" })
        } else {
            setFrom({ ...from, from_date: e.target.value, from_date_error: '' })
        }
        if (to.to_date) {
            if (e.target.value >= to.to_date) {
                setTo({ ...to, to_date: "" })
            }
        }
    }


    // to date validation
    const toDateValidation = () => {
        if (!to.to_date) {
            setTo({ ...to, to_date_error: "Please select date." })
            return false
        } else {
            setTo({ ...to, to_date_error: '' })
        }
    }
    // to date onchange function
    const toDateChange = (e) => {
        if (!e.target.value) {
            setTo({ ...to, to_date_error: "Please select date.", to_date: "" })
        } else {
            setTo({ ...to, to_date: e.target.value, to_date_error: '' })
        }
    }
    // leave status validation
    const leaveStatusValidation = () => {
        if (!status_info.leave_status || status_info.leave_status === '0') {
            setStatus({ ...status_info, leave_status_error: "Please select a leave status." })
            return false
        } else {
            setStatus({ ...status_info, leave_status_error: '' })
        }
    }

    // numbers of day genrate
    if (from.from_date && to.to_date) {
        let text = from.from_date
        day = moment(to.to_date).diff(moment(text), 'days') + 1
    }

    // reason onchange function
    const reasonChange = (e) => {
        setReason({ ...reason, description: e.target.value })
    }
    // reason validate
    const descriptionValidate = () => {
        if (!reason.description.trim()) {
            setReason({ ...reason, description_error: 'Please enter a leave reason.' })
            // return false
        } else {
            setReason({ ...reason, description_error: '' })
        }
    }

    return (
        <>
            {data ? <i className="fa-solid fa-pen-to-square" onClick={handleShow} ></i>
                :  ((UserData && UserData.role?.name.toLowerCase() === 'admin') || (accessData.length !== 0 && accessData[0].create === "1")) &&
                <button className='btn btn-gradient-primary btn-rounded btn-fw text-center' onClick={handleShow}>
                    <i className="fa-solid fa-plus" ></i>&nbsp;Add
                </button>
            }

            <Modal show={show} animation={true} size="md" aria-labelledby="example-modal-sizes-title-sm" className='small-modal department-modal' centered>
                <Modal.Header className='small-modal'>
                    <Modal.Title>{data ? 'Edit Leave ' : 'Add Leave '}
                    </Modal.Title>
                    <p className='close-modal' onClick={handleClose}><i className="fa-solid fa-xmark"></i></p>
                </Modal.Header>
                <Modal.Body>
                    <div className=" grid-margin stretch-card inner-pages mb-lg-0">
                        <div className="card">
                            <div className="card-body">
                                <form className="forms-sample">
                                    {UserData && UserData.name.toLowerCase() === 'admin' && <div className="form-group">
                                        <label htmlFor="1" className='mt-3'>User</label>
                                        <select className="form-control " id="user" name='user' disabled={data} value={info
                                            .user_id} onChange={(e) => setinfo({ ...info, user_id: e.target.value })} onClick={userValidation} >
                                            <option value='0'>Select User </option>
                                            {user.map((val) => {
                                                return (
                                                    <option key={val.id} value={val.id}>{val.first_name.concat(' ', val.last_name)}</option>
                                                )
                                            })}
                                        </select>
                                        {info.user_id_error && <small id="emailHelp" className="form-text error">{info.user_id_error}</small>}
                                        {user.length === 0 && <small id="emailHelp" className="form-text error">Please insert at least one user.</small>}
                                    </div>}

                                    <div className="form-group">
                                        <label htmlFor="1" className='mt-3'> Leave Type</label>
                                        <select className="form-control text-capitalize " id="leaveType" name='leave_type_id' value={leave
                                            .leave_type_id} onChange={InputEvent} onClick={leaveTypeValidation} >
                                            <option value='0'>Select Leave Type </option>
                                            {leaveTypeDetail.map((val) => {
                                                return (
                                                    <option key={val.id} value={val.id} className='text-capitalize'>{val.name}</option>
                                                )
                                            })}
                                        </select>
                                        {leave.leave_type_id_error && <small id="emailHelp" className="form-text error">{leave.leave_type_id_error}</small>}
                                        {leaveTypeDetail.length === 0 && <small id="emailHelp" className="form-text error">Please insert at least one leave type.</small>}
                                    </div>

                                    <div className="form-group position-relative">
                                        <label htmlFor="exampleInputJoining">From</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={from.from_date}
                                            name='date'
                                            disabled={!leave.leave_type_id}
                                            min={leaveType && leaveType}
                                            ref={fromDateRef}
                                            onChange={fromDateChange}
                                            autoComplete='off'
                                            onClick={() => { fromDateRef.current.showPicker(); fromDateValidation(); }}
                                        />
                                        <CalendarMonthIcon className='calendar-icon' />
                                        {from.from_date_error && <small id="emailHelp" className="form-text error">{from.from_date_error}</small>}
                                    </div>

                                    <div className="form-group position-relative">
                                        <label htmlFor="exampleInputJoining">To</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={to.to_date || ''}
                                            name='todate'
                                            disabled={from.from_date === ''}
                                            ref={toDateRef}
                                            onChange={toDateChange}
                                            autoComplete='off'
                                            onClick={() => { toDateRef.current.showPicker(); toDateValidation(); }}
                                            min={from.from_date || new Date()}
                                        />
                                        <CalendarMonthIcon className='calendar-icon' />
                                        {to.to_date_error && <small id="emailHelp" className="form-text error">{to.to_date_error}</small>}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="1" className='mt-3'> Number of days</label>
                                        <input type="text" className="form-control" id="1" value={day} disabled />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="1" className='mt-3'> Leave status</label>
                                        <select className="form-control " id="leavestatus" name='leave_status' value={status_info.leave_status
                                        } onChange={(e) => setStatus({ ...status_info, leave_status: e.target.value })} onClick={leaveStatusValidation} >
                                            <option value='0'>Select Leave Status </option>
                                            <option value='Full'>Full</option>
                                            <option value='Half' disabled={day > 1}>Half</option>

                                        </select>
                                        {status_info.leave_status_error && <small id="emailHelp" className="form-text error">{status_info.leave_status_error}</small>}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="1" className='mt-3'>Leave Reason</label>
                                        <Form.Control as="textarea" placeholder="Leave Reason .  .  ." onChange={reasonChange} value={reason.description} onKeyUp={descriptionValidate} />
                                        {reason.description_error && <small id="emailHelp" className="form-text error">{reason.description_error}</small>}
                                    </div>

                                    {UserData && UserData.name.toLowerCase() === 'admin' &&
                                        <div className="form-group">
                                            <label htmlFor="1" className='mt-3'>Status</label>
                                            <select className="form-control " id="status" name='status' value={status_info.status} onChange={(e) => setStatus({ ...status_info, status: e.target.value })}>
                                                {data && <option value="Pending"> Pending</option>}
                                                {data && <option value='Read'>Read </option>}
                                                <option value='Approved'>Approved</option>
                                                <option value='Declined'>Declined</option>
                                            </select>
                                        </div>}

                                    <ol>
                                        {error.map((val) => {
                                            return <li className='error' key={val} >{val}</li>
                                        })}
                                    </ol>
                                    <div className='d-flex justify-content-end modal-button'>
                                        <button type="submit" className="btn btn-gradient-primary mr-2" onClick={HandleSubmit}>{data ? 'Update' : 'Submit'}</button>
                                        <button className="btn btn-light" onClick={handleClose}>Cancel</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                {loader && <Spinner />}
            </Modal>
        </>
    )
}

export default LeaveModal
