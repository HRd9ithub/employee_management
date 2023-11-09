import Modal from 'react-bootstrap/Modal';
import React, { useRef } from 'react'
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import GlobalPageRedirect from '../../auth_context/GlobalPageRedirect';
import { customAxios } from '../../../service/CreateApi';
import Spinner from '../../common/Spinner';
import moment from 'moment';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const HolidayModal = (props) => {
    let { data, get_holiday_detail, permission } = props;
    let DateRef = useRef();
    const [show, setShow] = useState(false);
    const [isLoading, setisLoading] = useState(false);
    const [holiday, setholiday] = useState({
        name: "",
        date: ""
    })
    const [id, setId] = useState("")
    const [error, setError] = useState([]);
    const [nameError, setnameError] = useState("");
    const [dateError, setdateError] = useState("");
    let { getCommonApi } = GlobalPageRedirect();

    // modal show function
    const handleShow = () => {
        if (data) {
            setholiday({
                name: data.name,
                date: data.date
            });
            setId(data._id);
        }
        setShow(true)
    }

    // modal close function
    const handleClose = (e) => {
        e.preventDefault();
        setShow(false)
        setholiday({
            name: "",
            date: ""
        });
        setError([])
        setId("");
        setnameError("");
        setdateError("");
    }

    // onchange function
    const InputEvent = (e) => {
        let { value, name } = e.target;

        setholiday({ ...holiday, [name]: value })
    }

    // form validation function
    const nameValidate = () => {
        if (!holiday.name) {
            setnameError('Holiday name is a required field.')
        } else if (!holiday.name.trim() || !holiday.name.match(/^[A-Za-z ]+$/)) {
            setnameError('Holiday name must be an alphabet and space only.');
        } else {
            setnameError("");
        }
    }

    const handledateValidate = () => {
        if (!holiday.date) {
            setdateError('Date is a required field.');
        } else {
            setdateError("");
        }
    }

    // submit function
    const HandleSubmit = (e) => {
        e.preventDefault();
        setError([]);
        nameValidate();
        handledateValidate();

        let { name, date } = holiday;
        if (!name || !date || nameError || dateError) {
            return false;
        } else {
            setisLoading(true);
            let url = ""
            if (id) {
                url = customAxios().put(`/holiday/${id}`, {
                    name: name,
                    date,
                    day: moment(date).format("dddd")
                })
            } else {
                url = customAxios().post('/holiday/', {
                    name: name,
                    date,
                    day: moment(date).format("dddd")
                })
            }

            url.then(data => {
                if (data.data.success) {
                    toast.success(data.data.message)
                    setShow(false)
                    get_holiday_detail()
                    setId("");
                    setholiday({
                        name: "",
                        date: ""
                    })
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
                        setError(error.response.data.error);
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
                    <Modal.Title>{data ? 'Edit Holiday' : 'Add Holiday'}
                    </Modal.Title>
                    <p className='close-modal' onClick={handleClose}><i className="fa-solid fa-xmark"></i></p>
                </Modal.Header>
                <Modal.Body>
                    <div className=" grid-margin stretch-card inner-pages mb-lg-0">
                        <div className="card">
                            <div className="card-body">
                                <form className="forms-sample">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label htmlFor="name" className='mt-3'> Holiday Name</label>
                                                <input type="text" className="form-control" id="name" placeholder="Enter holiday name" name='name' value={holiday.name} onChange={InputEvent} onBlur={nameValidate} />
                                                {nameError && <small id="emailHelp" className="form-text error">{nameError}</small>}
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label htmlFor="name" className='mt-3'>Date</label>
                                                <div className="position-reactive">
                                                    <input type="date"
                                                        className="form-control"
                                                        name='date'
                                                        value={holiday.date}
                                                        ref={DateRef}
                                                        onChange={InputEvent}
                                                        autoComplete='off'
                                                        onClick={() => { DateRef.current.showPicker() }}
                                                        onBlur={handledateValidate}
                                                    />
                                                    <CalendarMonthIcon className='calendar-icon-holiday' onClick={() => { DateRef.current.showPicker(); }} />
                                                </div>
                                                {dateError && <div className='error'>{dateError}</div>}
                                            </div>
                                        </div>
                                    </div>
                                    {error.length !== 0 &&
                                        <ol>
                                            {error.map((val) => {
                                                return <li className='error' key={val}>{val}</li>
                                            })}
                                        </ol>}
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

export default HolidayModal
