import Modal from 'react-bootstrap/Modal';
import React from 'react'
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import Spinner from '../common/Spinner';
import GlobalPageRedirect from '../auth_context/GlobalPageRedirect';
import { GetLocalStorage } from '../../service/StoreLocalStorage';

const LeaveTypeModal = (props) => {
    let { data, getLeaveType, permission } = props;
    const [show, setShow] = useState(false);
    const [loader, setloader] = useState(false);
    const [name, setName] = useState("")
    const [id, setId] = useState("")
    const [error, setError] = useState("")
    const [Backerror, setBackerror] = useState("")
    let { getCommonApi } = GlobalPageRedirect();

    // modal show function
    const handleShow = () => {
        if (data) {
            setName(data.name);
            setId(data._id);
        }
        setShow(true)
    }

    // modal close function
    const handleClose = (e) => {
        e.preventDefault();
        setShow(false)
        setName("");
        setError("")
        setId("")
    }

    // onchange function
    const InputEvent = (e) => {
        let value = e.target.value;

        setName(value)
    }

    // form validation function
    const HandleValidate = () => {
        if (!name) {
            setError('Please enter a leave type.')
        } else if (!name.trim() || !name.match(/^[A-Za-z ]+$/)) {
            setError('Please enter a valid leave type.');
        } else {
            setError("");
        }
    }

    // submit function
    const HandleSubmit = (e) => {
        e.preventDefault();
        setBackerror("")
        !error && HandleValidate();

        if (!name || error) {
            return false;
        } else {
            setloader(true);
            let token = GetLocalStorage('token');
            const request = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
            }
            let url = ""
            if (id) {
                url = axios.patch(`${process.env.REACT_APP_API_KEY}/leavetype/${id}`, { name: name.charAt(0).toUpperCase() + name.slice(1) }, request)
            } else {
                url = axios.post(`${process.env.REACT_APP_API_KEY}/leavetype/`, { name: name.charAt(0).toUpperCase() + name.slice(1) }, request)
            }

            url.then(data => {
                if (data.data.success) {
                    toast.success(data.data.message)
                    setShow(false)
                    getLeaveType()
                    setName("");
                    setId("");
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
                        setBackerror(error.response.data.error);
                    }
                }
            }).finally(() => setloader(false))
        }

    }

    // check leave type
    const checkLeaveType = async () => {
        !name && HandleValidate();
        if (name && !error) {
            setloader(true)
            let config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${GetLocalStorage('token')}`
                },
            }
            axios.post(`${process.env.REACT_APP_API_KEY}/leavetype/name`, { name, id }, config).then((response) => {
                if (response.data.success) {
                    setError("")
                }
            }).catch((error) => {
                if (!error.response) {
                    toast.error(error.message);
                } else {
                    if (error.response.status === 401) {
                        getCommonApi();
                    } else {
                        if (error.response.data.message) {
                            setError(error.response.data.message)
                        }
                    }
                }
            }).finally(() => setloader(false))
        }
    }

    return (
        <>
            {data ? <i className="fa-solid fa-pen-to-square" onClick={handleShow} ></i>
                :
                permission && (permission.name.toLowerCase() === "admin" || (permission.permissions.length !== 0 && permission.permissions.create === 1)) &&
                <button
                    className='btn btn-gradient-primary btn-rounded btn-fw text-center' onClick={handleShow}>
                    <i className="fa-solid fa-plus" ></i>&nbsp;Add
                </button>}
            <Modal show={show} animation={true} size="md" aria-labelledby="example-modal-sizes-title-sm" className='small-modal department-modal' centered>
                <Modal.Header className='small-modal'>
                    <Modal.Title>{data ? 'Edit Leave Type' : 'Add Leave Type'}
                    </Modal.Title>
                    <p className='close-modal' onClick={handleClose}><i className="fa-solid fa-xmark"></i></p>
                </Modal.Header>
                <Modal.Body>
                    <div className=" grid-margin stretch-card inner-pages mb-lg-0">
                        <div className="card">
                            <div className="card-body">
                                <form className="forms-sample">
                                    <div className="form-group">
                                        <label htmlFor="1" className='mt-3'> Leave Type</label>
                                        <input type="text" className="form-control text-capitalize" id="1" placeholder="Enter Leave Type" name='name' value={name} onChange={InputEvent} onKeyUp={HandleValidate} onBlur={checkLeaveType} />
                                        {error && <small id="emailHelp" className="form-text error">{error}</small>}
                                        {Backerror && <small id="emailHelp" className="form-text error">{Backerror}</small>}
                                    </div>
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

export default LeaveTypeModal
