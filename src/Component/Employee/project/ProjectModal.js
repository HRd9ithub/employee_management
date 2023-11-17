import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Spinner from '../../common/Spinner';
import GlobalPageRedirect from '../../auth_context/GlobalPageRedirect';
import { toast } from 'react-hot-toast';
import { customAxios } from '../../../service/CreateApi';

function ProjectModal({ data, getProject, permission, records }) {
    const [show, setShow] = useState(false);
    const [name, setName] = useState('');
    const [error, seterror] = useState('');
    const [id, setId] = useState('')
    const [isLoading, setisLoading] = useState(false)
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
        setName(value)
    }

    // form validation
    const handleValidate = () => {
        if (!name.trim()) {
            seterror('Project name is a required field.')
        } else {
            seterror('')
        }
    }

    // submit function
    const handleSubmit = (e) => {
        e.preventDefault()
        if (!error) {
            handleValidate()
        }
        setError("");
        if (!name || error) {
           return false
        }
        let url = "";
        if (id) {
            url = customAxios().patch(`/project/${id}`, { name: name.charAt(0).toUpperCase() + name.slice(1) })
        } else {
            url = customAxios().post('/project/', { name: name.charAt(0).toUpperCase() + name.slice(1) })
        }

        setisLoading(true);
        url.then(data => {
            if (data.data.success) {
                toast.success(data.data.message)
                setShow(false)
                setisLoading(false);
                getProject();
                setName('');
                setId('');
            }
        }).catch((error) => {
            setisLoading(false);
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

    return (
        <>
            {data ? <i className="fa-solid fa-pen-to-square" onClick={handleShow} ></i> :
                permission && permission.permissions.create === 1 &&
                < button
                    className='btn btn-gradient-primary btn-rounded btn-fw text-center ' onClick={handleShow} >
                    <i className="fa-solid fa-plus" ></i>&nbsp;Add
                </button >
            }
            {/* Department Name * */}
            <Modal show={show} animation={true} size="md" aria-labelledby="example-modal-sizes-title-sm" className='department-modal' centered>
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
                                        <input type="text" className="form-control" id="exampleInputfname" placeholder="Enter Project Name" name='name' value={name} onChange={handleChange} onBlur={handleValidate} />
                                        {(Error || error) && <small id="emailHelp" className="form-text error">{error || Error}</small>}
                                    </div>
                                    <div className='d-flex justify-content-center modal-button'>
                                        <button type="submit" className="btn btn-gradient-primary mr-2" onClick={handleSubmit}>{data ? 'Update' : 'Save'}</button>
                                        <button className="btn btn-light" onClick={handleClose}>Cancel</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    {isLoading && <Spinner />}
                </Modal.Body>
            </Modal>
        </>
    );
}

export default ProjectModal