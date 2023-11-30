import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Spinner from '../../common/Spinner';
import { toast } from 'react-hot-toast';
import { useEffect } from 'react';
import { customAxios } from '../../../service/CreateApi';
import moment from 'moment';
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useMemo } from 'react';
import { useContext } from 'react';
import { AppProvider } from '../../context/RouteContext';

function WorkReportModal({ data, permission, getReport }) {
    let workDateRef = useRef(null);
    // common state
    const [show, setShow] = useState(false);
    const [id, setId] = useState('')
    const [isLoading, setisLoading] = useState(false)

    // store database value
    const [project, setProject] = useState([])

    // initialistate state
    const [work, setWork] = useState({
        userId: "",
        date: moment(new Date()).format("YYYY-MM-DD"),
    })

    const [workData, setworkData] = useState([{
        projectId: "",
        description: "",
        hours: "0"
    }])

    // error state
    const [userError, setUserError] = useState("");
    const [dateError, setdateError] = useState("");
    const [projectError, setprojectError] = useState([]);
    const [descriptionError, setdescriptionError] = useState([]);
    const [hoursError, sethoursError] = useState([]);
    const [error, setError] = useState([]);

    let { get_username, userName, Loading } = useContext(AppProvider);

    // modal show function
    const handleShow = () => {
        if (data) {
            let { _id, userId, date, totalHours, work } = data;
            setId(_id);

            setWork({
                userId,
                date,
                totalHours
            });
            setworkData(work);
        }
        setShow(true)
    }
    // modal hide  function
    const handleHide = (e) => {
        e && e.preventDefault();

        setShow(false);
        setUserError("")
        setprojectError([])
        setdescriptionError([])
        sethoursError([])
        setError([]);
        setWork({
            userId: "",
            date: moment(new Date()).format("YYYY-MM-DD"),
        })
        setworkData([{
            projectId: "",
            description: "",
            hours: "0"
        }])
    }

    // modal open starting call api
    useEffect(() => {
        if (show) {
            getProject();
            if ((permission && permission.name?.toLowerCase() === 'admin')) {
                get_username()
            }
        }
        // eslint-disable-next-line
    }, [show])

    // get data in project
    const getProject = async () => {
        try {
            setisLoading(true)
            const res = await customAxios().get('/project?key="project');
            if (res.data.success) {
                setProject(res.data.data)
            }
        } catch (error) {
            if (!error.response) {
                toast.error(error.message)
            } else {
                if (error.response.data.message) {
                    toast.error(error.response.data.message)
                }
            }
        } finally {
            setisLoading(false)
        }
    }

    // initialistate onchange function
    const handleChange = (e) => {
        let { name, value } = e.target;

        setWork({ ...work, [name]: value })
    }

    // * submit form function
    const handleSubmit = (e) => {
        e.preventDefault();
        setError([])
        let { userId, date } = work;
        let data = validate();

        permission && permission.name?.toLowerCase() === 'admin' && userIdValidation();
        workDateValidation();

        if (userError || projectError.length !== 0 || descriptionError.length !== 0 || hoursError.length !== 0 || dateError || (permission && permission.name?.toLowerCase() === 'admin' && !userId) || !date || totalHours === "0" || data) {
            return false;
        } else {
            let url = "";
            if (id) {
                url = customAxios().patch(`/report/${id}`, { userId, date, totalHours, work: workData })
            } else {
                url = customAxios().post('/report/', { userId, date, totalHours, work: workData })
            }
            setisLoading(true);
            url.then(data => {
                if (data.data.success) {
                    toast.success(data.data.message)
                    getReport(userId);
                    setShow(false)
                    setisLoading(false);
                    setId('');
                    setWork({
                        userId: "",
                        date: moment(new Date()).format("YYYY-MM-DD"),
                    })
                    setworkData([{
                        projectId: "",
                        description: "",
                        hours: "0"
                    }])
                }
            }).catch((error) => {
                setisLoading(false);
                if (!error.response) {
                    toast.error(error.message);
                } else {
                    if (error.response.data.message) {
                        toast.error(error.response.data.message)
                    } else {
                        setError(error.response.data.error);
                    }
                }
            })
        }

    }

    //  * validation form  part    
    const validate = () => {
        let pError = [];
        let hError = [];
        let dError = [];
        // eslint-disable-next-line array-callback-return
        workData.map((val, ind) => {
            if ((!val.projectId)) {
                pError.push({ name: "Project is a required field.", id: ind })
            }
            if ((!val.description)) {
                dError.push({ name: "Description is a required field.", id: ind })
            }
            if (!val.hours) {
                hError.push({ name: "Working hours is a required field.", id: ind })
            } else if (val.hours.toString() > 24 || val.hours.toString() < 1) {
                hError.push({ name: "Working hours range from 1 to 24 hours.", id: ind })
            }
        })
        setprojectError(pError);
        sethoursError(hError);
        setdescriptionError(dError);
        return (pError.length !== 0 || hError.length !== 0 || dError.length !== 0)
    }

    // date
    const workDateValidation = () => {
        if (!work.date) {
            setdateError("Work date is a required field.");
        } else {
            setdateError("");
        }
    }
    // user id
    const userIdValidation = () => {
        if (!work.userId || work.userId === "0") {
            setUserError("Employee is a required field.");
        } else {
            setUserError("");
        }
    }
    // project id
    const projectValidation = (ind) => {
        if (!workData[ind].projectId) {
            setprojectError([...projectError.filter((val) => {
                return val.id !== ind
            }), { name: "Project is a required field.", id: ind }]);
        } else {
            let temp = projectError.filter((elem) => {
                return elem.id !== ind
            })
            setprojectError(temp)
        }
    }
    // description
    const descriptionValidation = (ind) => {
        if (!workData[ind].description) {
            setdescriptionError([...descriptionError.filter((val) => {
                return val.id !== ind
            }), { name: "Description is a required field.", id: ind }]);
        } else {
            let temp = descriptionError.filter((elem) => {
                return elem.id !== ind
            })
            setdescriptionError(temp)
        }
    }

    // hours
    const hourValidation = (ind) => {
        if (!workData[ind].hours) {
            sethoursError([...hoursError.filter((val) => {
                return val.id !== ind
            }), { name: "Working hours is a required field.", id: ind }]);
        } else if (workData[ind].hours.toString() > 24 || workData[ind].hours.toString() < 1) {
            sethoursError([...hoursError.filter((val) => {
                return val.id !== ind
            }), { name: "Working hours range from 1 to 24 hours.", id: ind }]);
        } else {
            let temp = hoursError.filter((elem) => {
                return elem.id !== ind
            })
            sethoursError(temp)
        }
    }

    // * add row of form
    const addDuplicate = () => {
        let data = [...workData, {
            projectId: "",
            description: "",
            hours: "0"
        }]

        setworkData(data)
    }
    // * delete row
    const deleteRow = (id, ind) => {
        let deleteField = [...workData];
        deleteField.splice(ind, 1);
        setworkData(deleteField);
        setprojectError(projectError.filter((val) => val.id !== ind));
        sethoursError(hoursError.filter((val) => val.id !== ind));
        setdescriptionError(descriptionError.filter((val) => val.id !== ind));
    }

    // * work change
    const handleWorkChange = (e, ind) => {
        let { name, value } = e.target;

        let list = [...workData];
        list[ind][name] = value;

        setworkData(list)
    }

    // * total hours  generator
    const totalHours = useMemo(() => {
        const initialValue = 0;
        const sumWithInitial = workData.reduce((total, num) => Number(total) + Number(num.hours), initialValue);
        return sumWithInitial
    }, [workData])

    return (
        <>
            {data ? <i className="fa-solid fa-pen-to-square" onClick={handleShow} ></i> :
                permission && permission.permissions.create === 1 &&
                <button
                    className='btn btn-gradient-primary btn-rounded btn-fw text-center ' onClick={handleShow} >
                    <i className="fa-solid fa-plus" ></i>&nbsp;Add
                </button >
            }
            {/* Department Name * */}
            <Modal show={show} animation={true} size="md" aria-labelledby="example-modal-sizes-title-sm" className='department-modal modal_Section' centered>
                <Modal.Header className='small-modal'>
                    <Modal.Title>{data ? 'Edit Work Report' : 'Add Work Report'}
                    </Modal.Title>
                    <p className='close-modal' onClick={handleHide} ><i className="fa-solid fa-xmark"></i></p>
                </Modal.Header>
                <Modal.Body>
                    <div className=" grid-margin stretch-card inner-pages mb-lg-0">
                        <div className="card">
                            <div className="card-body">
                                <form className="forms-sample">
                                    <div className="row">
                                        {/* ====================   select  employee ============*/}
                                        {(permission && permission.name && permission.name?.toLowerCase() === 'admin') &&
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label htmlFor="user" className='mt-3'>Employee</label>
                                                    <select className="form-control " id="user" name='userId' disabled={data} value={work.userId} onChange={handleChange} onBlur={userIdValidation} >
                                                        <option value='0'>Select Employee </option>
                                                        {userName.map((val) => {
                                                            return (
                                                                val?.role?.toLowerCase() !== "admin" && <option key={val._id} value={val._id}>{val.name}</option>
                                                            )
                                                        })}
                                                    </select>
                                                    {userError && <small id="employee-field" className="form-text error">{userError}</small>}
                                                </div>
                                            </div>}
                                        {/* ====================   select  Date ============*/}
                                        <div className="col-md-6">
                                            <div className="form-group position-relative">
                                                <label htmlFor="work_date" className='mt-3'>Work Date</label>
                                                <div onClick={() => { workDateRef.current.showPicker(); }}>
                                                    <input type="date"
                                                        className="form-control"
                                                        autoComplete='off'
                                                        ref={workDateRef}
                                                        name='date'
                                                        onChange={handleChange}
                                                        value={work.date}
                                                        onBlur={workDateValidation}
                                                        max={moment(new Date()).format("YYYY-MM-DD")}
                                                        min={permission?.name?.toLowerCase() !== "admin" ? moment(new Date()).subtract(1, "day").format("YYYY-MM-DD") : ""}
                                                    />
                                                    <CalendarMonthIcon className='calendar-icon-work' />
                                                    {dateError && <small id="date-field" className="form-text error">{dateError}</small>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {workData.map((item, ind) => {
                                        return (
                                            <div className='education-wrapper mb-3' key={ind}>
                                                {ind > 0 && <div data-action="delete" className='delete text-right' >
                                                    <i className="fa-solid fa-trash-can " onClick={() => deleteRow(item._id, ind)}></i>
                                                </div>}
                                                <div className="row">
                                                    <div className="col-md-4">
                                                        {/* ====================   project select field  ============*/}
                                                        <div className="form-group">
                                                            <label htmlFor="project" className='mt-3'>Projects</label>
                                                            <select className="form-control " id="project" name='projectId' value={item.projectId} onChange={(e) => handleWorkChange(e, ind)} onBlur={() => projectValidation(ind)}>
                                                                <option value='0'>Select Project </option>
                                                                {project.map((val) => {
                                                                    return <option key={val._id} value={val._id} >{val.name}</option>
                                                                })}
                                                            </select>
                                                            {projectError.map((val) => {
                                                                return val.id === ind && <small id="project-field" className="form-text error" key={val.id}>{val.name}</small>
                                                            })}
                                                        </div>
                                                    </div>
                                                    <div className="col-md-2">
                                                        {/* ====================   hours field  ============*/}
                                                        <div className="form-group">
                                                            <label htmlFor="hours" className='mt-3'>Hours</label>
                                                            <input type="number" className="form-control" min={1} max={24} id="hours" inputMode='numeric' placeholder="Enter Working Hours" name='hours' value={item.hours} onChange={(e) => handleWorkChange(e, ind)} onBlur={() => hourValidation(ind)} autoComplete='off' />
                                                            {hoursError.map((val) => {
                                                                return val.id === ind && <small id="hours-field" className="form-text error" key={val.id}>{val.name}</small>
                                                            })}
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        {/* ====================   description field  ============*/}
                                                        <div className="form-group">
                                                            <label htmlFor="description" className='mt-3' >Description</label>
                                                            <textarea name="description" id="description" rows="1" className="form-control work-report-description" value={item.description} onChange={(e) => handleWorkChange(e, ind)} onBlur={() => descriptionValidation(ind)}></textarea>
                                                            {descriptionError.map((val) => {
                                                                return val.id === ind && <small id="description-field" className="form-text error" key={val.id}>{val.name}</small>
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                    {/* ==================== add field button ================= */}
                                    <div className="work-report-form">
                                        <NavLink onClick={addDuplicate} className="active"><i className="fa-solid fa-circle-plus"></i> Add More</NavLink>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="total-hours" className='mt-3'>Total Hours</label>
                                        <input type="text" className="form-control" id="total-ours" placeholder="Enter total Hours" name='totalHours' value={totalHours} disabled />
                                    </div>
                                    {error.length !== 0 &&
                                        <ol>
                                            {error.map((val) => {
                                                return <li key={val} className='error'>{val}</li>
                                            })}
                                        </ol>}
                                    <div className='d-flex justify-content-center modal-button'>
                                        <button type="submit" className="btn btn-gradient-primary mr-2" onClick={handleSubmit} >{data ? 'Update' : 'Save'}</button>
                                        <button className="btn btn-light" onClick={handleHide}>Cancel</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    {(isLoading || Loading) && <Spinner />}
                </Modal.Body>
            </Modal>
        </>
    );
}

export default WorkReportModal