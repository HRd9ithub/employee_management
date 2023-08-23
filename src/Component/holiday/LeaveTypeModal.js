import Modal from 'react-bootstrap/Modal';
import React from 'react'
import { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import Spinner from '../common/Spinner';
import GlobalPageRedirect from '../auth_context/GlobalPageRedirect';
import { GetLocalStorage } from '../../service/StoreLocalStorage';

const LeaveTypeModal = (props) => {
    let { data, getLeaveType, role, accessData, records } = props;
    const [show, setShow] = useState(false);
    const [loader, setloader] = useState(false);
    const [list, setList] = useState({
        name: '',
        error: '',
        id: ''
    });
    const [error, setError] = useState([])
    let { getCommonApi } = GlobalPageRedirect();

    // modal show function
    const handleShow = () => {
        if (data) {
            setList({
                name: data.name,
                id: data.id
            })
        }
        setShow(true)
    }

    // modal close function
    const handleClose = (e) => {
        e.preventDefault();
        setShow(false)
        setList({
            name: '',
            error: ''
        });
    }

    // onchange function
    const InputEvent = (e) => {
        let value = e.target.value;

        setList({ ...list, name: value })
    }

    // form validation function
    const HandleValidate = () => {
        if (!list.name) {
            setList({ ...list, error: 'Please enter a leave type.' })
        } else if (!list.name.trim() || !list.name.match(/^[A-Za-z ]+$/)) {
            setList({ ...list, error: 'Please enter a valid leave type.' })
        } else if (list.name.match(/^[A-Za-z ]+$/)) {
            let temp = records.findIndex((val) => {
                return val.name.trim().toLowerCase() === list.name.trim().toLowerCase()
            });
            if (temp === -1 || (data && data.name.toLowerCase() === list.name.toLowerCase())) {
                setList({ ...list, error: '' })
            } else {
                setList({ ...list, error: 'Leave type already exists. ' })
            }
        }
    }

    // submit function
    const HandleSubmit = (e) => {
        e.preventDefault();

        HandleValidate();
        setError([]);

        if (!list.name || list.error) {
            return false;
        } else {
            if (list.id) {
                setloader(true);
                let token = GetLocalStorage('token');
                const request = {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                }
                axios.post(`${process.env.REACT_APP_API_KEY}/leave_type/update`, { name: list.name.charAt(0).toUpperCase() + list.name.slice(1), id: list.id }, request)
                    .then(data => {
                        if (data.data.success) {
                            setloader(false);
                            toast.success('Successfully Edited a leave type.')
                            setShow(false)
                            getLeaveType()
                            setList({
                                name: '',
                                error: '',
                                id: ''
                            })
                        } else {
                            setloader(false);
                            toast.error(data.data.message.name[0])
                            // setList({ ...list, error: data.data.message.name[0] })
                        }
                    }).catch((error) => {
                        setloader(false);
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
                let token = GetLocalStorage('token');
                const request = {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    }
                }
                axios.post(`${process.env.REACT_APP_API_KEY}/leave_type/add`, { name: list.name.charAt(0).toUpperCase() + list.name.slice(1) }, request)
                    .then(data => {
                        if (data.data.success) {
                            setloader(false);
                            toast.success('Successfully added a new leave type.')
                            setShow(false)
                            getLeaveType();
                            setList({
                                name: '',
                                error: '',
                                id: ''
                            })
                        } else {
                            setloader(false);
                            toast.error(data.data.message.name[0])
                        }
                    }).catch((error) => {
                        setloader(false);
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

    return (
        <>
            {data ?<i className="fa-solid fa-pen-to-square" onClick={handleShow} ></i>
                :
                (role.toLowerCase() === 'admin' || (accessData.length !== 0 && accessData[0].create === "1")) &&
                    <button
                        className='btn btn-gradient-primary btn-rounded btn-fw text-center'  onClick={handleShow}>
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
                                        <input type="text" className="form-control text-capitalize" id="1" placeholder="Enter Leave Type" name='name' value={list.name} onChange={InputEvent} onKeyUp={HandleValidate} />
                                        {list.error && <small id="emailHelp" className="form-text error">{list.error}</small>}
                                    </div>
                                    <ol>
                                        {error.map((val) => {
                                            return <li className='error' key={val} > {val}</li>
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

export default LeaveTypeModal
