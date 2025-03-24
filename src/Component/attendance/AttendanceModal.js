import React, { memo, useRef } from 'react';
import Modal from 'react-bootstrap/Modal';
import { useState } from 'react';
import moment from 'moment';
import toast from 'react-hot-toast';
import { customAxios } from '../../service/CreateApi';
import Spinner from '../common/Spinner';
import { Form } from 'react-bootstrap';
import ErrorComponent from '../common/ErrorComponent';
import { SpellCheck } from '../ai/SpellCheck';
import { reWritePrompt } from '../../helper/prompt';

const AttendanceModal = ({ data = [], timestamp }) => {
    const [show, setShow] = useState(false);
    const [initialState, setInitialState] = useState({
        clockIn: "",
        clockOut: "",
        explanation: "",
        id: ""
    });
    const [isLoading, setisLoading] = useState(false);
    const { loading, aiResponse } = SpellCheck();

    // error state
    const [clockInError, setClockInError] = useState("");
    const [clockOutError, setClockOutError] = useState("");
    const [explanationError, setExplanationError] = useState("");
    const [error, setError] = useState([]);

    const clockInRef = useRef(null);
    const clockOutRef = useRef(null);

    // modal show function
    const handleShow = () => {
        setShow(true);
        if (data.length !== 0) {
            const latestData = data[data.length - 1];
            setInitialState({
                id: latestData._id || "",
                clockIn: latestData.clock_in ? moment(latestData.clock_in, "hh:mm:ss A").format("HH:mm:ss") : "",
                clockOut: latestData.clock_out ? moment(latestData.clock_out, "hh:mm:ss A").format("HH:mm:ss") : "",
            })
        }
    }

    // modal close function
    const handleClose = (e) => {
        e.preventDefault();
        setShow(false)
        setInitialState({
            clockIn: "",
            clockOut: "",
            explanation: "",
            id: ""
        });
        setClockInError("");
        setClockOutError("");
        setExplanationError("");
        setError([]);
    }

    // input field onchange function
    const handleOnChange = (event) => {
        const { name, value } = event.target;

        if (name === "id") {
            const latestData = data.find((d) => d._id === value);
            setInitialState({
                id: latestData._id || "",
                clockIn: latestData.clock_in ? moment(latestData.clock_in, "hh:mm:ss A").format("HH:mm:ss") : "",
                clockOut: latestData.clock_out ? moment(latestData.clock_out, "hh:mm:ss A").format("HH:mm:ss") : "",
            })
        } else {
            setInitialState({ ...initialState, [name]: value });
        }
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
        const { clockIn, clockOut, explanation, id } = initialState;

        explanationValidation();
        clockInValidation();
        clockOutValidation();

        if (!clockIn || !clockOut || clockInError || clockOutError || !explanation || explanationError) {
            return false;
        }

        setisLoading(true);
        customAxios().post('/attendance/regulation', {
            clockIn: clockIn && moment(clockIn, "hh:mm:ss").format("hh:mm:ss A"),
            clockOut: clockOut && moment(clockOut, "hh:mm:ss").format("hh:mm:ss A"),
            explanation, timestamp, id: id
        }).then(data => {
            if (data.data.success) {
                toast.success(data.data.message)
                setShow(false);
                setInitialState({
                    clockIn: "",
                    clockOut: "",
                    explanation: "",
                    id: ""
                });
                setClockInError("");
                setClockOutError("");
                setExplanationError("");
            }
        }).catch((error) => {
            if (!error.response) {
                toast.error(error.message)
            } else {
                if (error.response.data.message) {
                    toast.error(error.response.data.message)
                } else {
                    setError(error.response.data.error);
                }
            }
        }).finally(() => setisLoading(false))
    }

    const handleAIReWrite = () => {
        aiResponse(reWritePrompt(initialState.explanation)).then((correctedText) => {
            setInitialState({ ...initialState, explanation: correctedText })
        }).catch((error) => {
            toast.error(error.message);
        })
    }

    return (
        <>
            <i class="fa-solid fa-code-pull-request" onClick={handleShow} title='request' ></i>
            <Modal show={show} animation={true} size="md" aria-labelledby="example-modal-sizes-title-sm" className='department-modal' centered>
                <Modal.Header className='small-modal'>
                    <Modal.Title>Attendance Regulation - {timestamp && moment(timestamp).format("DD MMM YYYY")}</Modal.Title>
                    <p className='close-modal' onClick={handleClose}><i className="fa-solid fa-xmark"></i></p>
                </Modal.Header>
                <Modal.Body>
                    <div className="grid-margin stretch-card inner-pages mb-lg-0">
                        <div className="card">
                            <div className="card-body">
                                <form className="forms-sample">
                                    <div className="row">
                                        <div className="col-md-12 pr-md-2 pl-md-2">
                                            <div className="row">
                                                <div className="col-12 pr-md-2">
                                                    <div className="form-group">
                                                        <label >Attendance Adjustment</label>
                                                        <select name='id' className='form-control form-select' value={initialState.id} onChange={handleOnChange}>
                                                            {data?.map((t) => (
                                                                <option key={t._id} value={t._id}>{t.clock_in} &#9866; {t.clock_out}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="col-md-6 pr-md-2">
                                                    <div className="form-group">
                                                        <label htmlFor="clockIn">Clock In</label>
                                                        <input type="time" className="form-control" name='clockIn' step="2" value={initialState.clockIn} onChange={handleOnChange} onBlur={clockInValidation} ref={clockInRef} onClick={() => clockInRef.current.showPicker()} />
                                                        {clockInError && <small id="clockIn" className="form-text error">{clockInError}</small>}
                                                    </div>
                                                </div>
                                                <div className="col-md-6 pl-md-2">
                                                    <div className="form-group">
                                                        <label htmlFor="clockOut">Clock Out</label>
                                                        <input type="time" className="form-control" name='clockOut' step="2" value={initialState.clockOut} onChange={handleOnChange} onBlur={clockOutValidation} ref={clockOutRef} onClick={() => clockOutRef.current.showPicker()} />
                                                        {clockOutError && <small id="clockOut" className="form-text error">{clockOutError}</small>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-12 pr-md-2 pl-md-2">
                                            <div className="form-group">
                                                <label htmlFor="explanation">Explanation</label>
                                                <div className='position-relative'>
                                                    <Form.Control as="textarea" id='explanation' rows={4} cols={10} className="form-control" name="explanation" value={initialState.explanation} onChange={handleOnChange} onBlur={explanationValidation} />
                                                    {initialState?.explanation?.length > 3 && <button className='ai-button' type='button' onClick={handleAIReWrite} title='Improve it' disabled={loading}><i className="fa-solid fa-wand-magic-sparkles"></i></button>}
                                                </div>
                                                {explanationError && <small id="explanation" className="form-text error">{explanationError}</small>}
                                            </div>
                                        </div>
                                    </div>
                                    {error.length !== 0 &&
                                        <div className="row">
                                            <div className="col-12 pl-md-2 pr-md-2">
                                                <ErrorComponent errors={error} />
                                            </div>
                                        </div>}
                                    <div className="row">
                                        <div className='col-12 pl-md-2 pr-md-2 d-flex justify-content-center modal-button'>
                                            <button type="submit" className="btn btn-gradient-primary mr-2" onClick={handleRequest}>Request</button>
                                            <button className="btn btn-light" onClick={handleClose}>Cancel</button>
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

export default memo(AttendanceModal)
