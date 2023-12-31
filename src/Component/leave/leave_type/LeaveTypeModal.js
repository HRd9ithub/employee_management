import Modal from 'react-bootstrap/Modal';
import React from 'react'
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import Spinner from '../../common/Spinner';
import { customAxios } from '../../../service/CreateApi';
import { alphSpaceFormat } from '../../common/RegaulrExp';

const LeaveTypeModal = (props) => {
    let { data, getLeaveType, permission } = props;
    const [show, setShow] = useState(false);
    const [isLoading, setisLoading] = useState(false);
    const [name, setName] = useState("")
    const [id, setId] = useState("")
    const [error, setError] = useState("")
    const [Backerror, setBackerror] = useState("")

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
        setId("");
        setBackerror("");
    }

    // onchange function
    const InputEvent = (e) => {
        let value = e.target.value;

        setName(value)
    }

    // form validation function
    const HandleValidate = () => {
        if (!name) {
            setError('Leave type is a required field.')
        } else if (!name.trim() || !name.match(alphSpaceFormat)) {
            setError('Leave type must be an alphabet and space only.');
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
            setisLoading(true);
            let url = ""
            if (id) {
                url = customAxios().patch(`/leavetype/${id}`, { name: name.charAt(0).toUpperCase() + name.slice(1) })
            } else {
                url = customAxios().post('/leavetype/', { name: name.charAt(0).toUpperCase() + name.slice(1) })
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
                } else {
                    if (error.response.data.message) {
                        toast.error(error.response.data.message)
                    } else {
                        setBackerror(error.response.data.error);
                    }
                }
            }).finally(() => setisLoading(false))
        }
    }



    return (
        <>
            {data ? <i className="fa-solid fa-pen-to-square" onClick={handleShow} ></i>
                :
                permission && permission.permissions.create === 1 &&
                <button
                    className='btn btn-gradient-primary btn-rounded btn-fw text-center' onClick={handleShow}>
                    <i className="fa-solid fa-plus" ></i>&nbsp;Add
                </button>}

            <Modal show={show} animation={true} size="md" aria-labelledby="example-modal-sizes-title-sm" className='department-modal' centered>
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
                                    <div className="row">
                                        <div className="col-md-12 pr-md-2 pl-md-2">
                                            <div className="form-group">
                                                <label htmlFor="1" className='mt-3'> Leave Type</label>
                                                <input type="text" className="form-control text-capitalize" id="1" placeholder="Enter Leave Type" name='name' value={name} onChange={InputEvent} onBlur={HandleValidate} />
                                                {error && <small id="emailHelp" className="form-text error">{error}</small>}
                                                {Backerror && <small id="emailHelp" className="form-text error">{Backerror}</small>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className='d-flex justify-content-center modal-button'>
                                        <button type="submit" className="btn btn-gradient-primary mr-2" onClick={HandleSubmit}>{data ? 'Update' : 'Save'}</button>
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

export default LeaveTypeModal
