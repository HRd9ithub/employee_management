import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Spinner from '../../common/Spinner';
import GlobalPageRedirect from '../../auth_context/GlobalPageRedirect';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { GetLocalStorage } from '../../../service/StoreLocalStorage';

function ProjectModal({ data, getProject, permission, records }) {
    const [show, setShow] = useState(false);
    const [name, setName] = useState('');
    const [error, seterror] = useState('');
    const [id, setId] = useState('')
    const [loader, setloader] = useState(false)
    const [Error, setError] = useState("");

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
        setError("")
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
            seterror('Project name is a required field.')
        } else if (!name.trim()) {
            seterror('Project name is a required field.')
        } else if (!name.match(/^[A-Za-z ]+$/)) {
            seterror('Project name must be an alphabet and space only.')
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
        setError("");
        let config = {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${GetLocalStorage('token')}`
            },
        }
        let url = "";
        if (id) {
            url = axios.patch(`${process.env.REACT_APP_API_KEY}/project/${id}`, { name: name.charAt(0).toUpperCase() + name.slice(1) },config)
        } else {
            url = axios.post(`${process.env.REACT_APP_API_KEY}/project/`, { name: name.charAt(0).toUpperCase() + name.slice(1) },config)
        }
        if (name && !error) {
                setloader(true);
                url.then(data => {
                        if (data.data.success) {
                            toast.success(data.data.message)
                            setShow(false)
                            setloader(false);
                            getProject()
                            setName('')
                            setId('');
                        }
                    }).catch((error) => {
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
                    <Modal.Title>{data ? 'Edit Project' : 'Add Project'}
                    </Modal.Title>
                    <p className='close-modal' onClick={handleClose}><i className="fa-solid fa-xmark"></i></p>
                </Modal.Header>
                <Modal.Body>
                    <div className=" grid-margin stretch-card inner-pages mb-lg-0">
                        <div className="card">
                            <div className="card-body">
                                <form className="forms-sample">
                                    <div className="form-group">
                                        <label htmlFor="exampleInputfname" className='mt-3'>Project Name</label>
                                        <input type="text" className="form-control text-capitalize" id="exampleInputfname" placeholder="Enter Project Name" name='name' value={name} onChange={handleChange} onBlur={handleValidate} />
                                        {(Error || error) &&  <small id="emailHelp" className="form-text error">{error || Error}</small>}
                                    </div>
                                    <div className='d-flex justify-content-center modal-button'>
                                        <button type="submit" className="btn btn-gradient-primary mr-2" onClick={handleSubmit}>{data ? 'Update' : 'Save'}</button>
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

export default ProjectModal