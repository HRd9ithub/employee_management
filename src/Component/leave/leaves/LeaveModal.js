import Modal from 'react-bootstrap/Modal';
import React, { useEffect, useState, useRef } from 'react'
import Form from 'react-bootstrap/Form';
import { toast } from 'react-hot-toast';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import moment from 'moment';
import Spinner from '../../common/Spinner';
import { customAxios } from '../../../service/CreateApi';
import { useMemo } from 'react';

const LeaveModal = (props) => {
    let { data, getLeave, permission, startDate, endDate, user_id_drop } = props;
    const [show, setShow] = useState(false);
    const [isLoading, setisLoading] = useState(false)
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

    const fromDateRef = useRef();
    const toDateRef = useRef();

    // modal show function
    const handleShow = () => {
        if (data) {
            if (data?.leaveType?.toLowerCase() === "casual leave") {
                const date = new Date();
                date.setDate(date.getDate() + 4);
                setleaveType(moment(date).format("YYYY-MM-DD"))
            }
            setleave({ leave_type_id: data.leave_type_id })
            setStatus({ leave_status: data.leave_for, status: data.status })
            setReason({ description: data.reason })
            setFrom({ from_date: data.from_date })
            setTo({ to_date: data.to_date })
            setinfo({ user_id: data.user_id })
            setId(data._id)
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
        const value = e.target.value;
        if (value && value !== "0") {
            setleave({ ...leave, leave_type_id: value })
            const data = leaveTypeDetail.find((val) => val._id === value)
            if (data?.name.toLowerCase() === "casual leave") {
                const date = new Date();
                date.setDate(date.getDate() + 4);
                setleaveType(moment(date).format("YYYY-MM-DD"))
            } else {
                setleaveType("");
            }
        } else {
            setleave({ ...leave, leave_type_id: value })
        }
    }

    // submit function
    const HandleSubmit = (e) => {
        e.preventDefault();
        permission && permission.name?.toLowerCase() === 'admin' && userValidation()
        leaveTypeValidation();
        fromDateValidation();
        toDateValidation();
        leaveStatusValidation();
        descriptionValidate()
        setError([])

        if (!leave.leave_type_id || !from.from_date || !to.to_date || !status_info.leave_status || !reason.description || (permission && permission.name?.toLowerCase() === 'admin' && !info.user_id)) {
            return false;
        }
        if (leave.leave_type_id_error || from.from_date_error || to.to_date_error || status_info.leave_status_error || reason.description_error || (permission && permission.name?.toLowerCase() === 'admin' && info.user_id_error)) {
            return false
        }
        setisLoading(true);
        // object destructuring
        let { leave_type_id } = leave
        let { from_date } = from
        let { to_date } = to
        let { leave_status, status } = status_info
        let { description } = reason
        let { user_id } = info

        // edit api call
        let common = {
            leave_type_id,
            user_id,
            from_date: moment(from_date).format("YYYY-MM-DD"),
            to_date: moment(to_date).format("YYYY-MM-DD"),
            leave_for: leave_status,
            reason: description,
            duration: day,
            status: (permission && permission.name?.toLowerCase() === 'admin') ? status : "Pending"
        }
        let url = ""
        if (id) {
            url = customAxios().put(`/leave/${id}`, common)
        } else {
            url = customAxios().post('/leave', common)
        }
        url.then(data => {
            if (data.data.success) {
                toast.success(data.data.message);
                setShow(false)
                setleave({ leave_type_id: '', leave_type_id_error: "" })
                setStatus({ leave_status: '', leave_status_error: '', status: "Approved" })
                setReason({ description: '', description_error: '' })
                setFrom({ from_date: '', from_date_error: '' })
                setTo({ to_date: '', to_date_error: "" })
                setinfo({ user_id: '', user_id_error: "" })
                getLeave(startDate, endDate, user_id_drop);
            }
        }).catch((error) => {
            if (!error.response) {
                toast.error(error.message);
            } else {
                if (error.response.data.message) {
                    toast.error(error.response.data.message)
                } else {
                    setError(error.response.data.error);
                }
            }
        }).finally(() => {
            setPage(false);
            setisLoading(false)
        })

    }

    useEffect(() => {
        // leave type get data in api
        const getLeaveType = async () => {
            setisLoading(true)
            try {
                const res = await customAxios().get('/leavetype?key="leave"');
                if (res.data.success) {
                    setleaveTypeDetail(res.data.data)
                }
            } catch (error) {
                if (!error.response) {
                    toast.error(error.message);
                } else {
                    if (error.response.data.message) {
                        toast.error(error.response.data.message)
                    }
                }
            } finally {
                setisLoading(false)
            }
        }
        // get user name
        const get_username = async () => {
            setisLoading(true)
            try {
                const res = await customAxios().post('/user/username');

                if (res.data.success) {
                    let data = res.data.data.filter((val) => val.role.toLowerCase() !== "admin")
                    setUser(data);
                }
            } catch (error) {
                if (!error.response) {
                    toast.error(error.message);
                } else {
                    if (error.response.data.message) {
                        toast.error(error.response.data.message)
                    }
                }
            } finally {
                setisLoading(false)
            }
        };
        if (page) {
            getLeaveType()
        }
        if ((permission && permission.name?.toLowerCase() === 'admin') && page) {
            get_username()
        }
        // eslint-disable-next-line
    }, [page])

    //user validation
    const userValidation = () => {
        if (!info.user_id || info.user_id === '0') {
            setinfo({ ...info, user_id_error: "Employee is a required field." })
            return false
        } else {
            setinfo({ ...info, user_id_error: '' })
        }
    }
    // leave type validation
    const leaveTypeValidation = () => {
        if (!leave.leave_type_id || leave.leave_type_id === '0') {
            setleave({ ...leave, leave_type_id_error: "Leave type is a required field." })
            return false
        } else {
            setleave({ ...leave, leave_type_id_error: '' })
        }
    }
    // from date validation
    const fromDateValidation = () => {
        if (!from.from_date) {
            setFrom({ ...from, from_date_error: "From date is a required field." })
            return false
        } else {
            setFrom({ ...from, from_date_error: '' })
        }
    }

    // from date onchange function
    const fromDateChange = (e) => {
        setFrom({ ...from, from_date: e.target.value })
        if (to.to_date) {
            if (e.target.value >= to.to_date) {
                setTo({ ...to, to_date: "" })
            }
        }
    }


    // to date validation
    const toDateValidation = () => {
        if (!to.to_date) {
            setTo({ ...to, to_date_error: "To date is a required field." })
            return false
        } else {
            setTo({ ...to, to_date_error: '' })
        }
    }
    // to date onchange function
    const toDateChange = (e) => {
        setTo({ ...to, to_date: e.target.value })
    }

    // leave status validation
    const leaveStatusValidation = () => {
        if (!status_info.leave_status || status_info.leave_status === '0') {
            setStatus({ ...status_info, leave_status_error: "Leave status is a required field." })
            return false
        } else {
            setStatus({ ...status_info, leave_status_error: '' })
        }
    }

    // numbers of day genrate

    let day = useMemo(() => {
        if (from.from_date && to.to_date) {
            let text = from.from_date
            return moment(to.to_date).diff(moment(text), 'days') + 1
        } else {
            return 0
        }
    }, [from, to])

    useMemo(() => {
        if (day > 1) {
            status_info.leave_status === "Half" && setStatus({ ...status_info, leave_status: "0" })
        }
    }, [day, status_info])

    // reason onchange function
    const reasonChange = (e) => {
        setReason({ ...reason, description: e.target.value })
    }

    // reason validate
    const descriptionValidate = () => {
        if (!reason.description.trim()) {
            setReason({ ...reason, description_error: 'Leave Reason is a required field.' })
            // return false
        } else {
            setReason({ ...reason, description_error: '' })
        }
    }
    return (
        <>
            {data ? <i className="fa-solid fa-pen-to-square" onClick={handleShow} ></i>
                : permission && permission?.permissions?.create === 1 &&
                <button className='btn btn-gradient-primary btn-rounded btn-fw text-center' onClick={handleShow}>
                    <i className="fa-solid fa-plus" ></i>&nbsp;Add
                </button>
            }

            <Modal show={show} animation={true} size="md" aria-labelledby="example-modal-sizes-title-sm" className='department-modal' centered>
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
                                    <div className="row">
                                        {(permission && permission.name && permission.name?.toLowerCase() === 'admin') &&
                                            <div className="col-md-6 pr-md-2 pl-md-2">
                                                <div className="form-group">
                                                    <label htmlFor="1">Employee</label>
                                                    <select className="form-control " id="user" name='user' disabled={data} value={info
                                                        .user_id} onChange={(e) => {
                                                            setinfo({ ...info, user_id: e.target.value })
                                                        }
                                                        } onBlur={userValidation} >
                                                        <option value='0'>Select Employee </option>
                                                        {user.map((val) => {
                                                            return (
                                                                <option key={val._id} value={val._id}>{val.first_name.concat(' ', val.last_name)}</option>
                                                            )
                                                        })}
                                                    </select>
                                                    {info.user_id_error && <small id="emailHelp" className="form-text error">{info.user_id_error}</small>}
                                                    {/* {user.length === 0 && <small id="emailHelp" className="form-text error">Please insert at least one user.</small>} */}
                                                </div>
                                            </div>}
                                        <div className="col-md-6 pr-md-2 pl-md-2">
                                            <div className="form-group">
                                                <label htmlFor="1"> Leave Type</label>
                                                <select className="form-control text-capitalize " id="leaveType" name='leave_type_id' value={leave
                                                    .leave_type_id} onChange={InputEvent} onBlur={leaveTypeValidation} >
                                                    <option value='0'>Select Leave Type </option>
                                                    {leaveTypeDetail.map((val) => {
                                                        return (
                                                            <option key={val._id} value={val._id} className='text-capitalize'>{val.name}</option>
                                                        )
                                                    })}
                                                </select>
                                                {leave.leave_type_id_error && <small id="emailHelp" className="form-text error">{leave.leave_type_id_error}</small>}
                                            </div>
                                        </div>
                                        <div className="col-md-6 pr-md-2 pl-md-2">
                                            <div className="form-group position-relative">
                                                <label htmlFor="exampleInputJoining">From</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    value={from.from_date}
                                                    name='date'
                                                    disabled={!leave.leave_type_id || leave.leave_type_id === "0"}
                                                    min={leaveType && leaveType}
                                                    ref={fromDateRef}
                                                    onChange={fromDateChange}
                                                    autoComplete='off'
                                                    onClick={() => { fromDateRef.current.showPicker(); }}
                                                    onBlur={fromDateValidation}
                                                />
                                                <CalendarMonthIcon className='calendar-icon' onClick={() => { leave.leave_type_id && leave.leave_type_id !== "0" && fromDateRef.current.showPicker(); }} />
                                                {from.from_date_error && <small id="emailHelp" className="form-text error">{from.from_date_error}</small>}
                                            </div>
                                        </div>
                                        <div className="col-md-6 pr-md-2 pl-md-2">
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
                                                    onClick={() => { toDateRef.current.showPicker(); }}
                                                    onBlur={toDateValidation}
                                                    min={from.from_date || new Date()}
                                                />
                                                <CalendarMonthIcon className='calendar-icon' onClick={() => { from.from_date !== "" && toDateRef.current.showPicker(); }} />
                                                {to.to_date_error && <small id="emailHelp" className="form-text error">{to.to_date_error}</small>}
                                            </div>
                                        </div>
                                        <div className="col-md-6 pr-md-2 pl-md-2">
                                            <div className="form-group">
                                                <label htmlFor="1"> Number of days</label>
                                                <input type="text" className="form-control" id="1" value={day} disabled />
                                            </div>
                                        </div>
                                        <div className="col-md-6 pr-md-2 pl-md-2">
                                            <div className="form-group">
                                                <label htmlFor="1"> Leave status</label>
                                                <select className="form-control " id="leavestatus" name='leave_status' value={status_info.leave_status
                                                } onChange={(e) => { setStatus({ ...status_info, leave_status: e.target.value }) }} onBlur={leaveStatusValidation} >
                                                    <option value='0'>Select Leave Status </option>
                                                    <option value='Full'>Full</option>
                                                    <option value='Half' disabled={day > 1}>Half</option>
                                                </select>
                                                {status_info.leave_status_error && <small id="emailHelp" className="form-text error">{status_info.leave_status_error}</small>}
                                            </div>
                                        </div>
                                        <div className="col-md-6 pr-md-2 pl-md-2">
                                            <div className="form-group">
                                                <label htmlFor="1">Leave Reason</label>
                                                <Form.Control as="textarea" onChange={reasonChange} value={reason.description} onBlur={descriptionValidate} />
                                                {reason.description_error && <small id="emailHelp" className="form-text error">{reason.description_error}</small>}
                                            </div>
                                        </div>

                                        {(permission && permission.name && permission.name?.toLowerCase() === 'admin') &&
                                            <div className="col-md-6 pr-md-2 pl-md-2">
                                                <div className="form-group">
                                                    <label htmlFor="1">Status</label>
                                                    <select className="form-control " id="status" name='status' value={status_info.status} onChange={(e) => setStatus({ ...status_info, status: e.target.value })}>
                                                        {data && <option value="Pending"> Pending</option>}
                                                        {data && <option value='Read'>Read </option>}
                                                        <option value='Approved'>Approved</option>
                                                        <option value='Declined'>Declined</option>
                                                    </select>
                                                </div>
                                            </div>}
                                        {error.length !== 0 &&
                                            <div className="col-12">
                                                <ol>
                                                    {error.map((val) => {
                                                        return <li className='error' key={val} >{val}</li>
                                                    })}
                                                </ol>
                                            </div>}
                                        <div className="col-12">
                                            <div className='d-flex justify-content-center modal-button'>
                                                <button type="submit" className="btn btn-gradient-primary mr-2" onClick={HandleSubmit}>{data ? 'Update' : 'Save'}</button>
                                                <button className="btn btn-light" onClick={handleClose}>Cancel</button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                {isLoading && <Spinner />}
            </Modal>
        </>
    )
}

export default LeaveModal
