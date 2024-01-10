import React, { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Spinner from '../../common/Spinner';
import { toast } from 'react-hot-toast';
import { customAxios } from '../../../service/CreateApi';
import ErrorComponent from '../../common/ErrorComponent';

function LeaveSettingModal({ data, getLeaveSetting, permission }) {
    const [show, setShow] = useState(false);
    const [page, setpage] = useState(false);
    const [leaveType, setleaveType] = useState([]);
    const [inputData, setInputData] = useState({
        leaveTypeId: "",
        totalLeave : ""
    });
    const [error, seterror] = useState([]);
    const [id, setId] = useState('')
    const [isLoading, setisLoading] = useState(false)
    const [leaveTypeError, setleaveTypeError] = useState("");
    const [totalLeaveError, settotalLeaveError] = useState("");

    useEffect(() => {
        const getLeaveType = async () => {
            setisLoading(true)
            try {
                const res = await customAxios().get('/leaveType');

                if (res.data.success) {
                    setleaveType(res.data.data);
                }
            } catch (error) {
                if (!error.response) {
                    toast.error(error.message);
                } else {
                    if (error.response.data.message) {
                        toast.error(error.response.data.message)
                    }
                }
            } finally {
                setisLoading(false)
            }
        };
        if (page) {
            getLeaveType();
        }
    }, [page])

    // modal show function
    const handleShow = () => {
        if (data) {
            setInputData({
                leaveTypeId: data.leaveTypeId,
                totalLeave : data.totalLeave
            })
            setId(data._id);
        }
        setShow(true)
        setpage(true);
    }
    
    // modal close function
    const handleClose = (e) => {
        e.preventDefault();
        setpage(false);
        setShow(false)
        setInputData({
            leaveTypeId: "",
            totalLeave : ""
        })
        seterror([]);
        setId('');
        setleaveTypeError("");
        settotalLeaveError("");
    }

    // onchange function
    const handleChange = (e) => {
        const { value, name } = e.target;
        setInputData({...inputData, [name] : value})
    }

    // form validation
    const handleTotalLeaveValiadation = () => {
        if (!inputData.totalLeave) {
            settotalLeaveError('Total leave is a required field.')
        } else {
            settotalLeaveError('')
        }
    }
    const handleLeaveTypeValiadation = () => {
        if (!inputData.leaveTypeId) {
            setleaveTypeError('Leave type is a required field.')
        } else {
            setleaveTypeError('')
        }
    }

    // submit function
    const handleSubmit = (e) => {
        e.preventDefault()
        
        seterror([]);
        handleLeaveTypeValiadation();
        handleTotalLeaveValiadation();

       const { leaveTypeId, totalLeave} = inputData;

        if (!leaveTypeId || !totalLeave || leaveTypeError || totalLeaveError) {
            return false
        }

        let url = "";
        if (id) {
            url = customAxios().put(`/leave-setting/${id}`, {  leaveTypeId, totalLeave })
        } else {
            url = customAxios().post('/leave-setting', {  leaveTypeId, totalLeave })
        }

        setisLoading(true);
        url.then(data => {
            if (data.data.success) {
                toast.success(data.data.message);
                setShow(false);
                getLeaveSetting();
                setpage(false);
                setisLoading(false); 
                setInputData({
                    leaveTypeId: "",
                    totalLeave : ""
                });
                setId('');
            }
        }).catch((error) => {
            setisLoading(false);
            if (!error.response) {
                toast.error(error.message);
            } else {
                if (error.response.data.message) {
                    toast.error(error.response.data.message)
                } else {
                    seterror(error.response.data.error);
                }
            }
        })
    }

    return (
        <>
            {data ? <i className="fa-solid fa-pen-to-square" onClick={handleShow} ></i> :
                permission && permission.permissions.create === 1 &&
                <button className='btn btn-gradient-primary btn-rounded btn-fw text-center' onClick={handleShow} ><i className="fa-solid fa-plus" ></i>&nbsp;Add</button>
            }
            {/* Department Name * */}
            <Modal show={show} animation={true} size="md" aria-labelledby="example-modal-sizes-title-sm" className='department-modal' centered>
                <Modal.Header className='small-modal'>
                    <Modal.Title>{data ? 'Edit Leave Setting' : 'Add Leave Setting'}
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
                                                <label htmlFor="leavetype">Leave Type</label>
                                                <select className="form-control" id="leavetype" name="leaveTypeId" value={inputData.leaveTypeId} onChange={handleChange} onBlur={handleLeaveTypeValiadation}>
                                                    <option value="">Select leave type</option>
                                                    {leaveType.map((val) => {
                                                        return (
                                                            val.name.toLowerCase() !== "admin" &&
                                                            <option key={val._id} value={val._id}>{val.name}</option>
                                                        );
                                                    })}
                                                </select>
                                                {leaveTypeError && <small id="leavetype" className="form-text error">{leaveTypeError}</small>}
                                            </div>
                                        </div>
                                        <div className="col-md-12 pr-md-2 pl-md-2">
                                            <div className="form-group">
                                                <label htmlFor="totalLeave" className='mt-1'>Total Leave</label>
                                                <input type="number" className="form-control" id="totalLeave" placeholder="Enter total leave" name='totalLeave' value={inputData.totalLeave} onChange={handleChange} onBlur={handleTotalLeaveValiadation} />
                                                {totalLeaveError && <small id="totalleave" className="form-text error">{totalLeaveError}</small>}
                                            </div>
                                        </div>
                                        {error.length !== 0 &&
                                            <div className="col-md-12 pr-md-2 pl-md-2">
                                                <ErrorComponent errors={error} />
                                            </div>
                                        }
                                    </div>
                                    <div className='d-flex justify-content-center modal-button'>
                                        <button type="submit" className="btn btn-gradient-primary mr-2" onClick={handleSubmit} >{data ? 'Update' : 'Save'}</button>
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

export default LeaveSettingModal