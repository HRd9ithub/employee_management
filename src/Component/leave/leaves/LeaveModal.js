import Modal from 'react-bootstrap/Modal';
import React, { useEffect, useState, useRef } from 'react'
import Form from 'react-bootstrap/Form';
import { toast } from 'react-hot-toast';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import moment from 'moment';
import Spinner from '../../common/Spinner';
import { customAxios } from '../../../service/CreateApi';
import { useMemo } from 'react';
import ErrorComponent from '../../common/ErrorComponent';
import { SpellCheck } from '../../ai/SpellCheck';
import { promptSend, reWritePrompt } from '../../../helper/prompt';

const LeaveModal = (props) => {
    let { data, setStartDate, setendtDate, setuser_id, permission, userName } = props;
    const [show, setShow] = useState(false);
    const [isLoading, setisLoading] = useState(false)
    const [leaveTypeDetail, setleaveTypeDetail] = useState([])
    const [page, setPage] = useState(false)
    const [id, setId] = useState('')
    const [error, setError] = useState([]);
    const statusField = ["Approved", "Declined"];
    const [prompt, setPrompt] = useState("");

    const { loading, aiResponse } = SpellCheck();

    const [inputData, setInputData] = useState({
        user_id: "",
        leave_type_id: "",
        leave_for: "Full",
        from_date: "",
        to_date: "",
        reason: "",
        status: "Approved"
    })

    const [userIdError, setUserIdError] = useState("");
    const [leaveTypeIdError, setleaveTypeIdError] = useState("");
    const [fromDateError, setfromDateError] = useState("");
    const [toDateError, settoDateError] = useState("");
    const [reasonError, setreasonError] = useState("");

    const fromDateRef = useRef();
    const toDateRef = useRef();

    /*------------------
        mouting funcation
    ------------------ */
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
        if (page) {
            getLeaveType()
        }
        // eslint-disable-next-line
    }, [page])


    /*------------------
        modal section
    ------------------ */
    const handleShow = () => {
        if (data) {
            setInputData({
                user_id: data.user_id,
                leave_type_id: data.leave_type_id,
                leave_for: data.leave_for,
                from_date: data.from_date,
                to_date: data.to_date,
                reason: data.reason,
                status: data.status
            })
            setId(data._id)
        }
        setPage(true)
        setShow(true)
    }

    const handleClose = (e) => {
        e.preventDefault();
        setShow(false);
        setInputData({
            user_id: "",
            leave_type_id: "",
            leave_for: "Full",
            from_date: "",
            to_date: "",
            reason: "",
            status: "Approved"
        });
        setUserIdError("");
        setleaveTypeIdError("");
        setfromDateError("");
        settoDateError("");
        setreasonError("");
        setError([])
        setPage(false);
        setPrompt("");
    }

    /*--------------------
        Form section  
    ---------------------*/

    // numbers of day genrate
    const duration = useMemo(() => {
        if (inputData.from_date && inputData.to_date && inputData.leave_for !== "First Half" && inputData.leave_for !== "Second Half") {
            const date = inputData.from_date
            return moment(inputData.to_date).diff(moment(date), 'days') + 1
        } else if (inputData.leave_for === "First Half" || inputData.leave_for === "Second Half") {
            return 0.5
        } else {
            return 0
        }
    }, [inputData])

    const handleChange = (event) => {
        const { name, value } = event.target;
        setInputData({ ...inputData, [name]: value })
    }

    //user validation
    const userValidation = () => {
        if (!inputData.user_id || inputData.user_id === '0') {
            setUserIdError("Employee is a required field.");
        } else {
            setUserIdError("");
        }
    }
    // leave type validation
    const leaveTypeValidation = () => {
        if (!inputData.leave_type_id || inputData.leave_type_id === '0') {
            setleaveTypeIdError("Leave type is a required field.")
        } else {
            setleaveTypeIdError("");
        }
    }
    // from date validation
    const fromDateValidation = () => {
        if (!inputData.from_date) {
            setfromDateError("From date is a required fied.");
        } else {
            setfromDateError("");
        }
    }
    // to date validation
    const toDateValidation = () => {
        if (!inputData.to_date) {
            settoDateError("To date is a required field.");
        } else {
            settoDateError("");
        }
    }
    // reason validate
    const reasonValidate = () => {
        if (!inputData.reason.trim()) {
            setreasonError("Reason is a required field.");
        } else {
            setreasonError("");
        }
    }


    // submit function
    const HandleSubmit = (e) => {
        e.preventDefault();
        // object destructuring
        const { user_id, leave_type_id, leave_for, from_date, to_date, reason, status } = inputData;

        if (leave_for !== "First Half" && leave_for !== "Second Half") {
            toDateValidation();
        }

        permission && permission.name?.toLowerCase() === 'admin' && userValidation()
        leaveTypeValidation();
        fromDateValidation();
        reasonValidate()
        setError([]);


        if (!leave_type_id || !leave_for || !from_date || (leave_for !== "First Half" && leave_for !== "Second Half" && !to_date) || !reason || (permission && permission.name?.toLowerCase() === 'admin' && !user_id)) {
            return false;
        }
        if (leaveTypeIdError || fromDateError || reasonError || (permission && permission.name?.toLowerCase() === 'admin' && userIdError)) {
            return false
        }
        setisLoading(true);


        let common = {
            leave_type_id,
            user_id,
            from_date: moment(from_date).format("YYYY-MM-DD"),
            to_date: leave_for === "Full" ? moment(to_date).format("YYYY-MM-DD") : moment(from_date).format("YYYY-MM-DD"),
            leave_for,
            reason,
            duration: duration,
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
                setShow(false);
                setId("");
                setStartDate(new Date(from_date));
                setendtDate(leave_for === "Full" ? new Date(to_date) : new Date(from_date));
                setuser_id(user_id);
                setInputData({
                    user_id: "",
                    leave_type_id: "",
                    leave_for: "Full",
                    from_date: "",
                    to_date: "",
                    reason: "",
                    status: "Approved"
                })
                // getLeave(startDate, endDate, user_id_drop);
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

    const handleAIReWrite = () => {
        aiResponse(reWritePrompt(inputData.reason)).then((correctedText) => {
            setInputData({ ...inputData, reason: correctedText })
        }).catch((error) => {
            toast.error(error.message);
        })
    }

    const handleAIGenerate = () => {
        if (!prompt) {
            toast.error("Prompt is required.");
            return;
        }
        setisLoading(true)
        aiResponse(promptSend(prompt)).then((correctedText) => {
            setInputData({ ...inputData, reason: correctedText });
            setPrompt("");
            setreasonError("");
        }).catch((error) => {
            toast.error(error.message);
        }).finally(() => {
            setisLoading(false)
        })
    }

    const handlePromptChange = (e) => {
        setPrompt(e.target.value);
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
                                            <div className="col-md-12 pr-md-2 pl-md-2">
                                                <div className="form-group">
                                                    <label htmlFor="user_id">Employee</label>
                                                    <select className="form-control " id="user_id" name='user_id' disabled={data} value={inputData.user_id} onChange={handleChange} onBlur={userValidation}>
                                                        <option value='0'>Select Employee </option>
                                                        {userName.map((val) => {
                                                            return (
                                                                val.role.toLowerCase() !== "admin" && <option key={val._id} value={val._id}>{val.name}</option>
                                                            )
                                                        })}
                                                    </select>
                                                    {userIdError && <small id="user_id" className="form-text error">{userIdError}</small>}
                                                </div>
                                            </div>}
                                        <div className="col-md-6 pr-md-2 pl-md-2">
                                            <div className="form-group">
                                                <label htmlFor="leave_type_id"> Leave Type</label>
                                                <select className="form-control text-capitalize " id="leave_type_id" name='leave_type_id' value={inputData.leave_type_id} onChange={handleChange} onBlur={leaveTypeValidation}>
                                                    <option value='0'>Select Leave Type </option>
                                                    {leaveTypeDetail.map((val) => {
                                                        return (
                                                            <option key={val._id} value={val._id} className='text-capitalize'>{val.name}</option>
                                                        )
                                                    })}
                                                </select>
                                                {leaveTypeIdError && <small id="leave_type_id" className="form-text error">{leaveTypeIdError}</small>}
                                            </div>
                                        </div>
                                        <div className="col-md-6 pr-md-2 pl-md-2">
                                            <div className="form-group">
                                                <label htmlFor="leave_for"> Leave status</label>
                                                <select className="form-control " id="leave_for" name='leave_for' value={inputData.leave_for} onChange={handleChange}>
                                                    <option value='Full'>Full</option>
                                                    <option value='First Half'>First Half</option>
                                                    <option value='Second Half'>Second Half</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-md-6 pr-md-2 pl-md-2">
                                            <div className="form-group position-relative">
                                                <label htmlFor="from_date">{inputData.leave_for === "Full" ? "From" : "Date"}</label>
                                                <input
                                                    type="date"
                                                    id='from_date'
                                                    className="form-control"
                                                    value={inputData.from_date}
                                                    name='from_date'
                                                    ref={fromDateRef}
                                                    onChange={handleChange}
                                                    autoComplete='off'
                                                    onClick={() => { fromDateRef.current.showPicker(); }}
                                                    onBlur={fromDateValidation}
                                                />
                                                <CalendarMonthIcon className='calendar-icon' onClick={() => { fromDateRef.current.showPicker(); }} />
                                                {fromDateError && <small id="from_date" className="form-text error">{inputData.leave_for === "First Half" || inputData.leave_for === "Second Half" ? "Date is a required field." : fromDateError}</small>}
                                            </div>
                                        </div>
                                        {inputData.leave_for === "Full" &&
                                            <div className="col-md-6 pr-md-2 pl-md-2">
                                                <div className="form-group position-relative">
                                                    <label htmlFor="to_date">To</label>
                                                    <input
                                                        id='to_date'
                                                        type="date"
                                                        className="form-control"
                                                        value={inputData.to_date || ''}
                                                        name='to_date'
                                                        disabled={inputData.from_date === ''}
                                                        ref={toDateRef}
                                                        onChange={handleChange}
                                                        autoComplete='off'
                                                        onClick={() => { toDateRef.current.showPicker(); }}
                                                        min={inputData.from_date || new Date()}
                                                        onBlur={toDateValidation}
                                                    />
                                                    <CalendarMonthIcon className='calendar-icon' onClick={() => { inputData.from_date !== "" && toDateRef.current.showPicker(); }} />
                                                    {toDateError && <small id="to_date" className="form-text error">{toDateError}</small>}
                                                </div>
                                            </div>}

                                        <div className={`pr-md-2 pl-md-2 ${inputData.leave_for === "First Half" || inputData.leave_for === "Second Half" ? "col-md-6" : "col-md-12"}`}>
                                            <div className="form-group">
                                                <label htmlFor="duration"> Number of days</label>
                                                <input type="text" className="form-control" id="duration" value={duration} disabled />
                                            </div>
                                        </div>
                                        <div className="col-md-12 pr-md-2 pl-md-2">
                                            <div className="form-group">
                                                <label htmlFor="reason">Leave Reason</label>
                                                <div className='position-relative'>
                                                    <Form.Control as="textarea" rows={6} name='reason' id='reason' onChange={handleChange} value={inputData.reason} onBlur={reasonValidate} />
                                                    {inputData.reason.length > 3 && <button className='ai-button' type='button' onClick={handleAIReWrite} title='Improve it' disabled={loading}><i className="fa-solid fa-wand-magic-sparkles"></i></button>}
                                                </div>
                                                {reasonError && <small id="reason" className="form-text error mb-1">{reasonError}</small>}
                                                <div className='position-relative'>
                                                    <Form.Control type='text' name='prompt' id='reason' placeholder='Write prompt' onChange={handlePromptChange} value={prompt} />
                                                    <button type='button' className='prompt-send' disabled={isLoading} onClick={handleAIGenerate}><i class="fa-solid fa-paper-plane"></i></button>
                                                </div>
                                            </div>
                                        </div>
                                        {(permission && permission.name && permission.name?.toLowerCase() === 'admin') &&
                                            <div className="col-md-12 pr-md-2 pl-md-2">
                                                <div className="form-group">
                                                    <label htmlFor="status">Status</label>
                                                    <select className="form-control " id="status" name='status' value={inputData.status} onChange={handleChange}>
                                                        {data && <option value="Pending"> Pending</option>}
                                                        {data && <option value='Read'>Read </option>}
                                                        {statusField.includes(data?.status) && <option value='Approved'>Approved</option>}
                                                        {statusField.includes(data?.status) && <option value='Declined'>Declined</option>}
                                                        {!statusField.includes(data?.status) && <>
                                                            <option value='Approved'>Approve</option>
                                                            <option value='Declined'>Decline</option>
                                                        </>}
                                                    </select>
                                                </div>
                                            </div>}
                                        {error.length !== 0 &&
                                            <div className="col-12 pr-md-2 pl-md-2">
                                                <ErrorComponent errors={error} />
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
