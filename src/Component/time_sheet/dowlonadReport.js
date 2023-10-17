import React, { useEffect, useRef, useState } from 'react';
import Modal from "react-bootstrap/Modal";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import Spinner from '../common/Spinner';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AppProvider } from '../context/RouteContext';

const DowlonadReport = () => {
    const [show, setshow] = useState(false);

    let navigate = useNavigate();

    // initialistate 
    const [initialistate, setinitialistate] = useState({
        userId: "",
        month: moment(new Date()).format("YYYY-MM")
    })
    const [userError, setUserError] = useState("");
    const [dateError, setdateError] = useState("");


    let monthRef = useRef(null);

    let { get_username, userName, Loading, getReportPreview } = useContext(AppProvider);


    //  show modal 
    const handleShowModal = () => {
        setshow(true);
    }
    //  hide modal 
    const handleHideModal = (e) => {
        e && e.preventDefault();
        setshow(false);
        setinitialistate({
            userId: "",
            month: moment(new Date()).format("YYYY-MM")
        });
        setdateError("");
        setUserError("");
    }

    useEffect(() => {
        if (show) {
            get_username();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show])

    // onchange function
    const handleChange = event => {
        let { name, value } = event.target;
        setinitialistate({ ...initialistate, [name]: value })
    }

    // user validation 
    const handleuservalidation = () => {
        if (!initialistate.userId) {
            setUserError("Employee is a required field.");
        } else {
            setUserError("");
        }
    }
    // date validation
    const handleMonth = () => {
        if (!initialistate.month) {
            setdateError("Month is a required field.");
        } else {
            setdateError("");
        }
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        handleMonth();
        handleuservalidation();
        // object descstrutce
        let { month, userId } = initialistate;

        if (!userId || !month || userError || dateError) {
            return false;
        }

        getReportPreview(month, userId).then(() => {
            setshow(false);
            navigate("/report-preview");
            setinitialistate({
                userId: "",
                month: moment(new Date()).format("YYYY-MM")
            })
        })
    }

    return (
        <div>
            <button
                className='btn btn-gradient-primary btn-rounded btn-fw text-center' onClick={handleShowModal}>
                <i className="fa-solid fa-download"></i>&nbsp; Download
            </button >
            
            {/* // add and edit request */}
            <Modal
                show={show}
                animation={true}
                size="md"
                aria-labelledby="example-modal-sizes-title-sm"
                className="small-modal department-modal work-report-view-modal"
                centered
            >
                <Modal.Header className="small-modal">
                    <Modal.Title>
                        Preview Report
                    </Modal.Title>
                    <p className="close-modal" onClick={handleHideModal}>
                        <i className="fa-solid fa-xmark"></i>
                    </p>
                </Modal.Header>
                <Modal.Body>
                    <div className=" grid-margin stretch-card inner-pages mb-lg-0">
                        <div className="card">
                            <div className="card-body">
                                <form className="forms-sample" onSubmit={handleSubmit}>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label htmlFor="user" className='mt-3'>Employee</label>
                                                <select className="form-control " id="user" name='userId' onChange={handleChange} value={initialistate.userId} onBlur={handleuservalidation} >
                                                    <option value=''>Select Employee </option>
                                                    {userName.map((val) => {
                                                        return (
                                                            val.role.toLowerCase() !== "admin" && <option key={val._id} value={val._id}>{val.first_name.concat(' ', val.last_name)}</option>
                                                        )
                                                    })}
                                                </select>
                                                {userError && <small id="employee-field" className="form-text error">{userError}</small>}
                                            </div>
                                        </div>
                                        {/* ====================   select  Date ============*/}
                                        <div className="col-md-6">
                                            <div className="form-group position-relative">
                                                <label htmlFor="MONTH" className='mt-3'>Month</label>
                                                <div onClick={() => { monthRef.current.showPicker(); }}>
                                                    <input type="month"
                                                        className="form-control"
                                                        autoComplete='off'
                                                        ref={monthRef}
                                                        name='month'
                                                        value={initialistate.month}
                                                        onChange={handleChange}
                                                        max={moment(new Date()).format("YYYY-MM")}
                                                        onBlur={handleMonth}
                                                    />
                                                    <CalendarMonthIcon className='calendar-icon-work' />
                                                    {dateError && <small id="date-field" className="form-text error">{dateError}</small>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* {error.length !== 0 &&
                                        <ol>
                                            {error?.map((val) => {
                                                return <li className='error' key={val}>{val}</li>
                                            })}
                                        </ol>} */}
                                    <div className='d-flex justify-content-center modal-button'>
                                        <button type="submit" className="btn btn-gradient-primary mr-2" >Preview</button>
                                        <button className="btn btn-light" onClick={handleHideModal}>Cancel</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                {Loading && <Spinner />}
            </Modal>
        </div>
    )
}

export default DowlonadReport