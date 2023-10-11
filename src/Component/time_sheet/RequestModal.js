import React, { useState } from 'react';
import Modal from "react-bootstrap/Modal";
import { customAxios } from "../../service/CreateApi";
import Tooltip from '@mui/material/Tooltip';
import toast from 'react-hot-toast';
import GlobalPageRedirect from '../auth_context/GlobalPageRedirect';
import Spinner from '../common/Spinner';
import moment from 'moment';
import { useRef } from 'react';
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

const RequestModal = ({ data }) => {
    // request state
    const [title, settitle] = useState("");
    const [requestModal, setrequestModal] = useState(false);
    const [request, setrequest] = useState({
        date: "",
        description: ""
    });
    const [descriptionError, setdescriptionError] = useState("");
    const [dateError, setdateError] = useState("");
    const [error, seterror] = useState("");
    const [requestLoading, setrequestLoading] = useState(false);

    let { getCommonApi } = GlobalPageRedirect();
    let ref = useRef();

    // hide requset modal 
    const handleRequestmodal = (e) => {
        e && e.preventDefault();
        setrequestModal(false);
        setrequest({
            date: "",
            description: ""
        });
        setdescriptionError("");
        setdateError("")
    }

    // onchange request 
    const handleChange = e => {
        let name = e.target.name;
        let value = e.target.value;
        setrequest({ ...request, [name]: value });
    }

    // validation request 
    const handleDescriptionValidation = () => {
        if (!request.description.trim()) {
            setdescriptionError('Description is required field.');
        } else {
            setdescriptionError("")
        }
    }
    const dateValidation = () => {
        if (!request.date) {
            setdateError('Date is required field.');
        } else {
            setdateError("")
        }
    }

    const handleSendRequest = (e) => {
        e.preventDefault();
        seterror([]);
        handleDescriptionValidation();
        dateValidation();
        if (descriptionError || !request.date || !request.description || dateError) {
            return false;
        } else {
            setrequestLoading(true);
            customAxios().post("/report_request", { description: request.description, date: request.date, title }).then(data => {
                if (data.data.success) {
                    setrequestLoading(false);
                    setrequestModal(false);
                    setrequest({
                        date: "",
                        description: ""
                    });
                    setdescriptionError("");
                    setdateError("")
                    toast.success(data.data.message)
                }
            }).catch((error) => {
                setrequestLoading(false);
                if (!error.response) {
                    toast.error(error.message);
                } else {
                    if (error.response.status === 401) {
                        getCommonApi();
                    } else {
                        if (error.response.data.message) {
                            toast.error(error.response.data.message)
                        }else{
                            seterror(error.response.data.error)
                        }
                    }
                }
            })
        }
    }

    return (
        <div>
            {!data ?
                <button
                    className='btn btn-gradient-primary btn-rounded btn-fw text-center ' onClick={() => {
                        setrequestModal(true);
                        settitle("Add Request");
                        setrequest({...request, date:moment(new Date()).subtract(1,"day").format("YYYY-MM-DD")})
                    }} >
                    <i className="fa-solid fa-plus" ></i>&nbsp;Add Request
                </button > :
                <Tooltip title="Edit Request" placement="top">
                    <i className="fa-solid fa-pen-to-square" onClick={() => {
                        setrequestModal(true)
                        settitle("Edit Request");
                        setrequest({...request, date: data})
                    }} ></i>
                </Tooltip>}

            {/* // add and edit request */}
            <Modal
                show={requestModal}
                animation={true}
                size="md"
                aria-labelledby="example-modal-sizes-title-sm"
                className="small-modal department-modal work-report-view-modal"
                centered
            >
                <Modal.Header className="small-modal">
                    <Modal.Title>
                        {title}
                    </Modal.Title>
                    <p className="close-modal" onClick={handleRequestmodal}>
                        <i className="fa-solid fa-xmark"></i>
                    </p>
                </Modal.Header>
                <Modal.Body>
                    <div className=" grid-margin stretch-card inner-pages mb-lg-0">
                        <div className="card">
                            <div className="card-body">
                                <form className="forms-sample">
                                    <div className="row">
                                        {/* ====================   select  Date ============*/}
                                        <div className="col-md-6">
                                            <div className="form-group position-relative">
                                                <label htmlFor="work_date" className='mt-3'>Work Date</label>
                                                <div onClick={() => { !data && ref.current.showPicker(); }}>
                                                    <input type="date"
                                                        className="form-control"
                                                        autoComplete='off'
                                                        ref={ref}
                                                        name='date'
                                                        onChange={handleChange}
                                                        value={request.date}
                                                        onBlur={dateValidation}
                                                        max={moment(new Date()).subtract(1,"day").format("YYYY-MM-DD")}
                                                        disabled={data}
                                                    />
                                                    <CalendarMonthIcon className='calendar-icon-work' />
                                                    {dateError && <small id="date-field" className="form-text error">{dateError}</small>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            {/* ====================   description   ============*/}
                                            <div className="form-group">
                                                <label htmlFor="request" className='mt-3'>Description</label>
                                                <textarea name="description" id="request" cols="30" rows="2" className="form-control" autoComplete="off" value={request.description} onChange={handleChange} onBlur={handleDescriptionValidation}></textarea>
                                                {descriptionError && <small className="from-text error" id="request" >{descriptionError}</small>}
                                            </div>
                                        </div>
                                    </div>
                                    {error.length !== 0 &&
                                        <ol>
                                            {error?.map((val) => {
                                                return <li className='error' key={val}>{val}</li>
                                            })}
                                        </ol>}
                                    <div className='d-flex justify-content-center modal-button'>
                                        <button type="submit" className="btn btn-gradient-primary mr-2" onClick={handleSendRequest} ><i className="fa-solid fa-paper-plane"></i> &nbsp;&nbsp;{title}</button>
                                        <button className="btn btn-light" onClick={handleRequestmodal}>Cancel</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                {requestLoading && <Spinner />}
            </Modal>
        </div>
    )
}

export default RequestModal