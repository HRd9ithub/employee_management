import React, { useRef } from 'react';
import Modal from 'react-bootstrap/Modal';
import { useState } from 'react';
import moment from 'moment';
import toast from 'react-hot-toast';
import { customAxios } from '../../service/CreateApi';
import Spinner from '../common/Spinner';
import GlobalPageRedirect from '../auth_context/GlobalPageRedirect';
import { Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const AttendanceModal = ({ data,permission }) => {
    const [show, setShow] = useState(false);
    const [initialState, setInitialState] = useState({
        clockIn: "",
        clockOut: "",
        explanation: ""
    });
    const [isLoading, setisLoading] = useState(false);

    // error state
    const [clockInError, setClockInError] = useState("");
    const [clockOutError, setClockOutError] = useState("");
    const [explanationError, setExplanationError] = useState("");
    const [error, setError] = useState([]);

    const clockInRef = useRef(null);
    const clockOutRef = useRef(null);

    const {getCommonApi} = GlobalPageRedirect();

    const navigate = useNavigate();

    // modal show function
    const handleShow = () => {
        setShow(true);
    }

    // modal close function
    const handleClose = (e) => {
        e.preventDefault();
        setShow(false)
        setInitialState({
            clockIn: "",
            clockOut: "",
            explanation: ""
        });
        setClockInError("");
        setClockOutError("");
        setExplanationError("");
        setError([]);
    }

    // input field onchange function
    const handleOnChange = (event) => {
        const { name, value } = event.target;

        setInitialState({ ...initialState, [name]: value });
    }

    // clock in field validation
    const clockInValidation = () => {
        if (!initialState.clockIn) {
            setClockInError("Clock In is a required field.");
        } else {
            setClockInError("");
        }
    }

    // clock out field validation
    const clockOutValidation = () => {
        if (!initialState.clockOut) {
            setClockOutError("Clock Out is a required field.");
        } else {
            setClockOutError("");
        }
    }

    // explanation field validation
    const explanationValidation = () => {
        if (!initialState.explanation) {
            setExplanationError("Explanation is a required field.");
        } else {
            setExplanationError("");
        }
    }

    // submit function
    const handleRequest = (event) => {
        event.preventDefault();
        setError([]);

        // destructuring Object
        const { clockIn, clockOut, explanation } = initialState;
        const { _id, userId, timestamp } = data;

        explanationValidation();
        clockInValidation();
        clockOutValidation();

        if (!clockIn || !clockOut || clockInError || clockOutError || !explanation || explanationError) {
           return false;
        }

        setisLoading(true);
        customAxios().post('/attendance/regulation', {
            clockIn : clockIn && moment(clockIn, "hh:mm").format("hh:mm A"),
            clockOut : clockOut && moment(clockOut, "hh:mm").format("hh:mm A"), 
            explanation, userId, timestamp, id: _id
        }).then(data => {
            if (data.data.success) {
                toast.success(data.data.message)
                setShow(false);
                setInitialState({
                    clockIn: "",
                    clockOut: "",
                    explanation: ""
                });
                setClockInError("");
                setClockOutError("");
                setExplanationError("");
            }
        }).catch((error) => {
            if (!error.response) {
                toast.error(error.message);
            } else if (error.response.status === 401) {
                getCommonApi();
            } else {
                if (error.response.data.message) {
                    toast.error(error.response.data.message)
                } else {
                    setError(error.response.data.error);
                }
            }
        }).finally(() => setisLoading(false))
    }

    return (
        <>
            <i className="fa-solid fa-ellipsis-vertical" style={{ cursor: "pointer" }} data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></i>
            <div className="dropdown-menu password-action--dropdown">
                {permission && permission.name.toLowerCase() !== "admin" && data && <>
                <Dropdown.Item className="dropdown-item" onClick={handleShow}><label>Regularize</label></Dropdown.Item>
                </>}
                {/* <div className="dropdown-divider"></div> */}
                {permission && permission.name.toLowerCase() === "admin" &&<>
                {/* <div className="dropdown-divider"></div> */}
                <Dropdown.Item className="dropdown-item" onClick={() => navigate(`/attendance/${data._id}`)}><label>Requests</label></Dropdown.Item> </>}
            </div>


            {/* <i className="fa-solid fa-user-clock" title="Regularize" onClick={handleShow}></i> */}

            <Modal show={show} animation={true} size="md" aria-labelledby="example-modal-sizes-title-sm" className='department-modal' centered>
                <Modal.Header className='small-modal'>
                    <Modal.Title>Attendance Regulation - {data && moment(data.timestamp).format("DD MMM YYYY")}</Modal.Title>
                    <p className='close-modal' onClick={handleClose}><i className="fa-solid fa-xmark"></i></p>
                </Modal.Header>
                <Modal.Body>
                    <div className="grid-margin stretch-card inner-pages mb-lg-0">
                        <div className="card">
                            <div className="card-body">
                                <form className="forms-sample">
                                    <div className="row">
                                            <div className="col-md-12">
                                                <label className="mb-2">Attendance Adjustment</label>
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label htmlFor="clockIn">Clock In</label>
                                                            <input type="time" className="form-control" name='clockIn' value={initialState.clockIn} onChange={handleOnChange} onBlur={clockInValidation} ref={clockInRef} onClick={() => clockInRef.current.showPicker()} />
                                                            {clockInError && <small id="clockIn" className="form-text error">{clockInError}</small>}
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label htmlFor="clockOut">Clock Out</label>
                                                            <input type="time" className="form-control" name='clockOut' value={initialState.clockOut} onChange={handleOnChange} onBlur={clockOutValidation} ref={clockOutRef} onClick={() => clockOutRef.current.showPicker()} />
                                                            {clockOutError && <small id="clockOut" className="form-text error">{clockOutError}</small>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        <div className="col-md-12">
                                            <div className="form-group">
                                                <label htmlFor="explanation">Explanation</label>
                                                <textarea id='explanation' rows={2} cols={10} className="form-control" name="explanation" value={initialState.explanation} onChange={handleOnChange} onBlur={explanationValidation} />
                                                {explanationError && <small id="explanation" className="form-text error">{explanationError}</small>}
                                            </div>
                                        </div>
                                    </div>
                                    {error.length !== 0 &&
                                        <ol>
                                            {error.map((val) => {
                                                return <li className='error' key={val}>{val}</li>
                                            })}
                                        </ol>}
                                    <div className='d-flex justify-content-center modal-button'>
                                        <button type="submit" className="btn btn-gradient-primary mr-2" onClick={handleRequest}>Request</button>
                                        <button className="btn btn-light" onClick={handleClose}>Cancel</button>
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

export default AttendanceModal
