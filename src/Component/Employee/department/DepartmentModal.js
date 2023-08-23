import axios from 'axios';
import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { toast } from 'react-toastify';
import Spinner from '../../common/Spinner';
import GlobalPageRedirect from '../../auth_context/GlobalPageRedirect';
import { GetLocalStorage } from '../../../service/StoreLocalStorage';

function DepartmentModal({ data, getuser, accessData, user, records }) {
    const [show, setShow] = useState(false);
    const [name, setName] = useState('');
    const [error, seterror] = useState('');
    const [id, setId] = useState('')
    const [loader, setloader] = useState(false)
    let toggleButton = false
    const [Error, setError] = useState([]);

    let { getCommonApi } = GlobalPageRedirect();

    // modal show function
    const handleShow = () => {
        if (data) {
            setName(data.name)
            setId(data.id);
        }
        setShow(true)
    }

    // modal close function
    const handleClose = (e) => {
        e.preventDefault();
        setShow(false)
        setName('');
        seterror('');
        setError([])
        setId('')
    }

    // onchange function
    const handleChange = (e) => {
        let { value } = e.target;
        if (!name) {
            value = value.toUpperCase()
        }
        setName(value)
    }

    // form validation
    const handleValidate = () => {
        let msg = ''
        if (!name) {
            seterror('Department name is required.')
            msg = 'error'
        } else if (!name.trim()) {
            seterror('Please enter a valid department name.')
            msg = 'error'
        } else if (!name.match(/^[A-Za-z ]+$/)) {
            seterror('Please enter a valid department name.')
            msg = 'error'
        } else if (name.match(/^[A-Za-z ]+$/)) {
            let temp = records.findIndex((val) => {
                return val.name.trim().toLowerCase() === name.trim().toLowerCase()
            })

            if (temp === -1 || (data && data.name.trim().toLowerCase() === name.trim().toLowerCase())) {
                seterror('')
                msg = ''
            } else {
                seterror('The department name already exists. ')
                msg = 'error'
            }
        }

        return msg
    }

    // submit function
    const handleSubmit = (e) => {
        e.preventDefault()
        const errortoggle = handleValidate()
        setError([]);
        if (!errortoggle) {
            if (id) {
                setloader(true);
                let token = GetLocalStorage('token');
                const request = {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                }
                axios.post(`${process.env.REACT_APP_API_KEY}/department/update`, { id, name: name.charAt(0).toUpperCase() + name.slice(1) }, request)
                    .then(data => {
                        if (data.data.success) {
                            toast.success('Successfully edited a department.')
                            setShow(false)
                            setloader(false)
                            getuser()
                            setName('')
                            setId('');
                        } else {
                            toast.error(data.data.message.name[0]);
                            setloader(false)
                        }
                    }).catch((error) => {
                        setloader(false)
                        console.log("🚀 ~ file: DepartmentModal.js:74 ~ getPage ~ error:", error.response.data.message)
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
                let token = GetLocalStorage('token');
                setloader(true)
                const request = {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                }
                axios.post(`${process.env.REACT_APP_API_KEY}/department/add`, { name: name.charAt(0).toUpperCase() + name.slice(1) }, request)
                    .then(data => {
                        if (data.data.success) {
                            toast.success('Successfully added a new department.')
                            setShow(false)
                            setloader(false);
                            getuser()
                            setName('')
                            setId('');
                        } else {
                            setloader(false);
                            toast.error(data.data.message.name[0]);
                        }
                    }).catch((error) => {
                        console.log("🚀 ~ file: DepartmentModal.js:97 ~ getPage ~ error:", error)
                        setloader(false);
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
            {data ? <i className="fa-solid fa-pen-to-square" onClick={handleShow} ></i> :
                (user.toLowerCase() === 'admin' || (accessData.length !== 0 && accessData[0].create === "1")) &&
                < button
                    className='btn btn-gradient-primary btn-rounded btn-fw text-center ' onClick={handleShow} >
                    <i className="fa-solid fa-plus" ></i>&nbsp;Add
                </button >
            }
            {/* Department Name * */}
            <Modal show={show} animation={true} size="md" aria-labelledby="example-modal-sizes-title-sm" className='small-modal department-modal' centered>
                <Modal.Header className='small-modal'>
                    <Modal.Title>{data ? 'Edit Department' : 'Add Department'}
                    </Modal.Title>
                    <p className='close-modal' onClick={handleClose}><i className="fa-solid fa-xmark"></i></p>
                </Modal.Header>
                <Modal.Body>
                    <div className=" grid-margin stretch-card inner-pages mb-lg-0">
                        <div className="card">
                            <div className="card-body">
                                <form className="forms-sample">
                                    <div className="form-group">
                                        <label htmlFor="exampleInputfname" className='mt-3'> Department Name</label>
                                        <input type="text" className="form-control text-capitalize" id="exampleInputfname" placeholder="Enter Department name" name='name' value={name} onChange={handleChange} onKeyUp={handleValidate} />
                                        {error && <small id="emailHelp" className="form-text error">{error}</small>}
                                    </div>
                                    <ol>
                                        {Error.map((val) => {
                                            return <li className='error' key={val} >{val}</li>
                                        })}
                                    </ol>
                                    <div className='d-flex justify-content-end modal-button'>
                                        <button type="submit" className="btn btn-gradient-primary mr-2" onClick={handleSubmit}>{data ? 'Update' : 'Submit'}</button>
                                        <button className="btn btn-light" onClick={handleClose}>Cancel</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    {loader && <Spinner />}
                </Modal.Body>
            </Modal>
        </>
    );
}

export default DepartmentModal