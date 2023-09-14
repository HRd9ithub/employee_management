import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Spinner from '../../common/Spinner';
import GlobalPageRedirect from '../../auth_context/GlobalPageRedirect';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { GetLocalStorage } from '../../../service/StoreLocalStorage';

function DepartmentModal({ data, getuser, permission, records }) {
    const [show, setShow] = useState(false);
    const [name, setName] = useState('');
    const [error, seterror] = useState('');
    const [id, setId] = useState('')
    const [loader, setloader] = useState(false)
    const [Error, setError] = useState([]);

    let { getCommonApi } = GlobalPageRedirect();

    // modal show function
    const handleShow = () => {
        if (data) {
            setName(data.name)
            setId(data._id);
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
        if (!name) {
            seterror('Department name is required.')
        } else if (!name.trim()) {
            seterror('Please enter a valid department name.')
        } else if (!name.match(/^[A-Za-z ]+$/)) {
            seterror('Please enter a valid department name.')
        } else {
            seterror('')
        }
    }

    // submit function
    const handleSubmit = (e) => {
        e.preventDefault()
        if(!error){
            handleValidate()
        }
        setError([]);
        let config = {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${GetLocalStorage('token')}`
            },
        }
        let url = "";
        if (id) {
            url = axios.patch(`${process.env.REACT_APP_API_KEY}/department/${id}`, { name: name.charAt(0).toUpperCase() + name.slice(1) },config)
        } else {
            url = axios.post(`${process.env.REACT_APP_API_KEY}/department/`, { name: name.charAt(0).toUpperCase() + name.slice(1) },config)
        }
        if (name && !error) {
                setloader(true);
                url.then(data => {
                        if (data.data.success) {
                            toast.success(data.data.message)
                            setShow(false)
                            setloader(false);
                            getuser()
                            setName('')
                            setId('');
                        }
                    }).catch((error) => {
                        console.log("🚀 ~ file: DepartmentModal.js:97 ~ getPage ~ error:", error)
                        setloader(false);
                        if (!error.response) {
                            toast.error(error.message);
                        } else {
                            if (error.response.status === 401) {
                                getCommonApi();
                            } else {
                                if (error.response.data.message) {
                                    toast.error(error.response.data.message)
                                } else {
                                    setError(error.response.data.error);
                                }
                            }
                        }
                    })
        }
    }

    // check department
    const checkDepartment = async () => {
        !name && handleValidate();
        if (name && !error) {
            setloader(true)
            let config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${GetLocalStorage('token')}`
                },
            }
            axios.post(`${process.env.REACT_APP_API_KEY}/department/name`, { name,id },config).then((response) => {
                if (response.data.success) {
                    seterror("")
                }
            }).catch((error) => {
                console.log(error)
                if (!error.response) {
                    toast.error(error.message);
                } else {
                    if (error.response.status === 401) {
                        getCommonApi();
                    } else {
                        if (error.response.data.message) {
                            seterror(error.response.data.message)
                        }
                    }
                }
            }).finally(() => setloader(false))
        }
    }

    return (
        <>
            {data ? <i className="fa-solid fa-pen-to-square" onClick={handleShow} ></i> :
                permission && (permission.name.toLowerCase() === "admin" || (permission.permissions.length !== 0 && permission.permissions.create === 1)) &&
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
                                        <input type="text" className="form-control text-capitalize" id="exampleInputfname" placeholder="Enter Department name" name='name' value={name} onChange={handleChange} onKeyUp={handleValidate} onBlur={checkDepartment} />
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