import Modal from 'react-bootstrap/Modal';
import React, { useRef } from 'react'
import { useState } from 'react';
import { Dropdown } from 'react-bootstrap';

const HolidayModal = (props) => {
    const [show, setShow] = useState(false);

    // modal show function
    const handleShow = () => {
        setShow(true)
    }

    // modal close function
    const handleClose = (e) => {
        e.preventDefault();
        setShow(false)
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
                    <Modal.Title>Attendance Regulation - 23 Nov, 2023</Modal.Title>
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
                                                <div class="form-check">
                                                    <input class="form-check-input" type="radio" name="exampleRadios" id="exampleRadios1" value="option1" checked/>
                                                    <label class="form-check-label" for="exampleRadios1">
                                                        Add & update time entries to adjust attendance.
                                                    </label>
                                                </div>
                                                <div class="form-check">
                                                    <input class="form-check-input" type="radio" name="exampleRadios" id="exampleRadios2" value="option2"/>
                                                    <label class="form-check-label" for="exampleRadios2">
                                                        Raise regularization request to exempt this day from tracking policy penalization.
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-12">
                                            <label htmlFor="name" className="mb-2">Attendance Adjustment</label>
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <label htmlFor="name">Clock In</label>
                                                        <input type="time" className="form-control" name='date'/>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <label htmlFor="name">Clock Out</label>
                                                        <input type="time" className="form-control" name='date'/>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-12">
                                            <div className="form-group">
                                                <label htmlFor="name">Explanation</label>
                                                <textarea type="text" autoComplete='off' rows={2} cols={10} className="form-control" placeholder="Write Here..."/>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='d-flex justify-content-center modal-button'>
                                        <button type="submit" className="btn btn-gradient-primary mr-2">Request</button>
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

export default HolidayModal
