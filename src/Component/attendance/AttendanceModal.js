import React, { useRef } from 'react';
import Modal from 'react-bootstrap/Modal';
import { useState } from 'react';
import moment from 'moment';

const AttendanceModal = ({data}) => {
    const [show, setShow] = useState(false);
    const [selectedOption ,setselectedOption ] = useState("attendance");
    const [initialState,setInitialState] = useState({
        clockIn : "",
        clockOut : "",
        explanation : ""
    })

    // error state
    const [clockInError,setClockInError] = useState("");
    const [clockOutError,setClockOutError] = useState("");
    const [explanationError,setExplanationError] = useState("");
    
    const clockInRef = useRef(null);
    const clockOutRef = useRef(null);

    // modal show function
    const handleShow = () => {
        setShow(true);
    }

    // modal close function
    const handleClose = (e) => {
        e.preventDefault();
        setShow(false)
        setInitialState({
            clockIn : "",
            clockOut : "",
            explanation : ""
        });
        setClockInError("");
        setClockOutError("");
        setExplanationError("");
    }

    // radio button onchange 
    const onValueChange = (e) => {
        setselectedOption(e.target.value);
        setInitialState({
            clockIn : "",
            clockOut : "",
            explanation : ""
        });
        setClockInError("");
        setClockOutError("");
        setExplanationError("");
    }

    // input field onchange function
    const handleOnChange = (event) => {
        const { name, value } = event.target;

        setInitialState({...initialState,[name] : value});
    }

    // clock in field validation
    const clockInValidation =() =>{ 
        if(!initialState.clockIn){
            setClockInError("Clock In is a required field.");
        }else{
            setClockInError("");
        }
    }

    // clock out field validation
    const clockOutValidation =() =>{ 
        if(!initialState.clockOut){
            setClockOutError("Clock Out is a required field.");
        }else{
            setClockOutError("");
        }
    }

    // explanation field validation
    const explanationValidation =() =>{ 
        if(!initialState.explanation){
            setExplanationError("Explanation is a required field.");
        }else{
            setExplanationError("");
        }
    }

    // submit function
    const handleRequest = (event) => {
        event.preventDefault();

        // destructuring Object
        const { clockIn, clockOut, explanation } = initialState;
        const { _id, userId, timestamp} = data;
        
        explanationValidation();

        if(selectedOption === "attendance"){
            clockInValidation();
            clockOutValidation();

            if(!clockIn || !clockOut || clockInError || clockOutError){
                return false;
            }
        }

        if(!explanation || explanationError){
            return false;
        }

        // create new attendance
        console.warn(initialState)
    }



    return (
        <>
            {/* <i className="fa-solid fa-ellipsis-vertical" style={{ cursor: "pointer" }} data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></i>
            <div className="dropdown-menu password-action--dropdown">
                <Dropdown.Item className="dropdown-item" ><i className="fa-solid fa-eye"></i><label>Regularize</label></Dropdown.Item>
                <div className="dropdown-divider"></div>
                <div className="dropdown-divider"></div>
                <Dropdown.Item className="dropdown-item"><i className="fa-solid fa-trash-can"></i><label>WFH Request</label></Dropdown.Item>
            </div> */}

            
            <i className="fa-solid fa-user-clock" title="Regularize" onClick={handleShow}></i>

            <Modal show={show} animation={true} size="md" aria-labelledby="example-modal-sizes-title-sm" className='department-modal' centered>
                <Modal.Header className='small-modal'>
                    <Modal.Title>Attendance Regulation - {moment(data.timestamp).format("DD MMM YYYY")}</Modal.Title>
                    <p className='close-modal' onClick={handleClose}><i className="fa-solid fa-xmark"></i></p>
                </Modal.Header>
                <Modal.Body>
                    <div className="grid-margin stretch-card inner-pages mb-lg-0">
                        <div className="card">
                            <div className="card-body">
                                <form className="forms-sample">
                                    <div className="row">
                                        <div className="col-md-12">
                                            <div className="form-group">
                                                <div className="form-check">
                                                    <input className="form-check-input regulation-radio" type="radio" name="exampleRadios" id="regulation-radio" value="attendance" onChange={onValueChange} checked={selectedOption === "attendance"} />
                                                    <label className="form-check-label" htmlFor="regulation-radio">
                                                        Add & update time entries to adjust attendance.
                                                    </label>
                                                </div>
                                                <div className="form-check">
                                                    <input className="form-check-input regulation-radio" type="radio" name="exampleRadios" id="regulation-radio1" value="policy" onChange={onValueChange} checked={selectedOption === "policy"}/>
                                                    <label className="form-check-label" htmlFor="regulation-radio1">
                                                        Raise regularization request to exempt this day from tracking policy penalization.
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                        {selectedOption === "attendance" && 
                                        <div className="col-md-12">
                                            <label className="mb-2">Attendance Adjustment</label>
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <label htmlFor="clockIn">Clock In</label>
                                                        <input type="time" className="form-control" name='clockIn' value={initialState.clockIn} onChange={handleOnChange} onBlur={clockInValidation} ref={clockInRef} onClick={() => clockInRef.current.showPicker()}/>
                                                        {clockInError && <small id="clockIn" className="form-text error">{clockInError}</small>}
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <label htmlFor="clockOut">Clock Out</label>
                                                        <input type="time" className="form-control" name='clockOut' value={initialState.clockOut} onChange={handleOnChange} onBlur={clockOutValidation} ref={clockOutRef} onClick={() => clockOutRef.current.showPicker()}/>
                                                        {clockOutError && <small id="clockOut" className="form-text error">{clockOutError}</small>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>}
                                        <div className="col-md-12">
                                            <div className="form-group">
                                                <label htmlFor="explanation">Explanation</label>
                                                <textarea id='explanation' rows={2} cols={10} className="form-control" name="explanation" value={initialState.explanation} onChange={handleOnChange} onBlur={explanationValidation}/>
                                                {explanationError && <small id="explanation" className="form-text error">{explanationError}</small>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className='d-flex justify-content-center modal-button'>
                                        <button type="submit" className="btn btn-gradient-primary mr-2" onClick={handleRequest}>Request</button>
                                        <button className="btn btn-light" onClick={handleClose}>Cancel</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    )
}

export default AttendanceModal
