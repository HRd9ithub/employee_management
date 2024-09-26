/* eslint-disable react-hooks/exhaustive-deps */
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
import JoditEditor from 'jodit-react';
import ErrorComponent from '../../common/ErrorComponent';
import { Tooltip } from '@mui/material';

function WorkReportModal({ data, permission, getReport, isRequest, setuser_id }) {
    let workDateRef = useRef(null);
    // common state
    const [show, setShow] = useState(false);
    const [id, setId] = useState('')
    const [isLoading, setisLoading] = useState(false)
    const [addExtraDetailToggle, setAddExtraDetailToggle] = useState(false)
    const [addWorkToggle, setAddWorkToggle] = useState(false)

    // store database value
    const [project, setProject] = useState([])

    // initialistate state
    const [work, setWork] = useState({
        userId: "",
        date: "",
    })

    const [workData, setworkData] = useState([])
    const [extraWorkData, setExtraWorkData] = useState([])

    // error state
    const [userError, setUserError] = useState("");
    const [dateError, setdateError] = useState("");
    const [projectError, setprojectError] = useState([]);
    const [descriptionError, setdescriptionError] = useState([]);
    const [hoursError, sethoursError] = useState([]);
    const [extraProjectError, setExtraProjectError] = useState([]);
    const [extraDescriptionError, setExtraDescriptionError] = useState([]);
    const [extraHoursError, setExtraHoursError] = useState([]);
    const [error, setError] = useState([]);
    const [title, setTitle] = useState("");

    let { get_username, userName, Loading } = useContext(AppProvider);

    const resetForm = () => {
        setId('');
        setWork({
            userId: "",
            date: "",
        })
        setworkData([])
        setExtraWorkData([]);
        setUserError("");
        setprojectError([]);
        setdescriptionError([]);
        sethoursError([]);
        setError([]);
        setdateError("");
        setExtraProjectError([]);
        setExtraDescriptionError([]);
        setExtraHoursError([]);
        setdateError("")
        setAddExtraDetailToggle(false);
        setAddWorkToggle(false);
    };

    // modal show function
    const handleShow = () => {
        if (data) {
            const { _id, userId, date, totalHours, work } = data;

            setId(_id);

            setWork({
                userId,
                date,
                totalHours
            });

            if (work?.length > 0) {
                setworkData(work);
                setAddWorkToggle(true);
            } else {
                setworkData([])
                setAddWorkToggle(false);
            }
            if (data.extraWork?.length > 0) {
                setExtraWorkData(data.extraWork);
                setAddExtraDetailToggle(true);
            } else {
                setAddExtraDetailToggle(false);
            }
        } else {
            setworkData([{
                projectId: "",
                description: "",
                hours: "0"
            }]);
            setAddWorkToggle(true);
        }
        if (isRequest) {
            setTitle(data ? "Edit Request" : "Add Request")
        }
        setShow(true)
    }
    // modal hide  function
    const handleHide = (e) => {
        e && e.preventDefault();

        setShow(false);
    }

    useEffect(() => {
        if (show) {
            getProject();
            if (permission && permission.name?.toLowerCase() === 'admin') {
                get_username();
            }
        } else {
            resetForm();
        }
    }, [show]);

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

    // user and date change function
    const handleChange = (e) => {
        let { name, value } = e.target;

        setWork({ ...work, [name]: value })
    }

    const hasErrors = () => {
        return userError ||
            projectError.length !== 0 ||
            descriptionError.length !== 0 ||
            hoursError.length !== 0 ||
            dateError ||
            (permission && permission.name?.toLowerCase() === 'admin' && !work.userId) ||
            !work.date ||
            totalHours === "0" ||
            extraProjectError.length !== 0 ||
            extraDescriptionError.length !== 0 ||
            extraHoursError.length !== 0;
    };

    const validate = () => {
        let pError = [];
        let hError = [];
        let dError = [];
        workData.forEach((val, ind) => {
            const projectErrors = validateProject(val.projectId, ind);
            const descriptionErrors = validateDescription(val.description, ind);
            const hoursErrors = validateHours(val.hours, ind);

            if (projectErrors) pError.push(projectErrors);
            if (descriptionErrors) dError.push(descriptionErrors);
            if (hoursErrors) hError.push(hoursErrors);
        });
        setprojectError(pError);
        sethoursError(hError);
        setdescriptionError(dError);
        return (pError.length !== 0 || hError.length !== 0 || dError.length !== 0);
    };

    const validateExtraWork = () => {
        let pError = [];
        let hError = [];
        let dError = [];
        extraWorkData.forEach((val, ind) => {
            const projectErrors = validateProject(val.projectId, ind);
            const descriptionErrors = validateDescription(val.description, ind);
            const hoursErrors = validateHours(val.hours, ind);

            if (projectErrors) pError.push(projectErrors);
            if (descriptionErrors) dError.push(descriptionErrors);
            if (hoursErrors) hError.push(hoursErrors);
        });
        setExtraProjectError(pError);
        setExtraHoursError(hError);
        setExtraDescriptionError(dError);
        return (pError.length !== 0 || hError.length !== 0 || dError.length !== 0);
    };

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

    const validateProject = (value, index) => {
        if (!value) {
            return { name: "Project is a required field.", id: index };
        }
        return null;
    };

    const validateDescription = (value, index) => {
        if (!value.trim() || !value.replaceAll("<p><br></p>", "")) {
            return { name: "Description is a required field.", id: index };
        }
        return null;
    };

    const validateHours = (value, index) => {
        if (!value) {
            return { name: "Hours is a required field.", id: index };
        } else if (parseFloat(value) > 24 || parseFloat(value) < 0) {
            return { name: "Hours range from 0 to 24 hours.", id: index };
        }
        return null;
    };

    // project id
    const projectValidation = (ind) => {
        const projectErrors = validateProject(workData[ind].projectId, ind);

        let projectErr = projectError.filter((val) => {
            return val.id !== ind
        });

        if (projectErrors) {
            projectErr.push(projectErrors)
        }
        setprojectError(projectErr);
    }

    // description
    const descriptionValidation = (ind) => {
        const descriptionErrors = validateDescription(workData[ind].description, ind);

        let descriptionErr = descriptionError.filter((val) => {
            return val.id !== ind
        });

        if (descriptionErrors) {
            descriptionErr.push(descriptionErrors)
        }
        setdescriptionError(descriptionErr);
    }

    // hours
    const hourValidation = (ind) => {
        const hoursErrors = validateHours(workData[ind].hours, ind);

        let hoursErr = hoursError.filter((val) => {
            return val.id !== ind
        });

        if (hoursErrors) {
            hoursErr.push(hoursErrors)
        }
        sethoursError(hoursErr);
    }
    // project id
    const extraProjectValidation = (ind) => {
        const projectErrors = validateProject(extraWorkData[ind].projectId, ind);

        let projectErr = extraProjectError.filter((val) => {
            return val.id !== ind
        });

        if (projectErrors) {
            projectErr.push(projectErrors)
        }
        setExtraProjectError(projectErr);
    }

    // description
    const extraDescriptionValidation = (ind, newContent) => {
        const descriptionErrors = validateDescription(extraWorkData[ind].description, ind);

        let descriptionErr = extraDescriptionError.filter((val) => {
            return val.id !== ind
        });

        if (descriptionErrors) {
            descriptionErr.push(descriptionErrors)
        }
        setExtraDescriptionError(descriptionErr);
    }

    // hours
    const extraHourValidation = (ind) => {
        const hoursErrors = validateHours(extraWorkData[ind].hours, ind);

        let hoursErr = extraHoursError.filter((val) => {
            return val.id !== ind
        });

        if (hoursErrors) {
            hoursErr.push(hoursErrors)
        }
        setExtraHoursError(hoursErr);
    }

    const addWork = () => {
        setworkData([...workData, {
            projectId: "",
            description: "",
            hours: "0"
        }]);
        setAddWorkToggle(true);
    };

    const addExtraWork = () => {
        setExtraWorkData([...extraWorkData, {
            projectId: "",
            description: "",
            hours: "0"
        }]);
        setAddExtraDetailToggle(true);
    };

    const deleteRow = (ind) => {
        setworkData(workData.filter((_, index) => index !== ind));
        setprojectError(projectError.filter((val) => val.id !== ind));
        sethoursError(hoursError.filter((val) => val.id !== ind));
        setdescriptionError(descriptionError.filter((val) => val.id !== ind));
        const hasOtherWorkItems = workData.some((_, index) => index !== ind);
        if (!hasOtherWorkItems) {
            setAddWorkToggle(false);
        }
    };

    const deleteExtraRow = (ind) => {
        setExtraWorkData(extraWorkData.filter((_, index) => index !== ind));
        setExtraProjectError(extraProjectError.filter((val) => val.id !== ind));
        setExtraHoursError(extraHoursError.filter((val) => val.id !== ind));
        setExtraDescriptionError(extraDescriptionError.filter((val) => val.id !== ind));
        const hasOtherExtraWorkItems = extraWorkData.some((_, index) => index !== ind);
        if (!hasOtherExtraWorkItems) {
            setAddExtraDetailToggle(false);
        }
    };

    const handleWorkChange = (e, ind) => {
        const { name, value } = e.target;
        setworkData(workData.map((item, index) =>
            index === ind ? { ...item, [name]: value } : item
        ));
    };

    const handleExtraWorkChange = (e, ind) => {
        const { name, value } = e.target;
        setExtraWorkData(extraWorkData.map((item, index) =>
            index === ind ? { ...item, [name]: value } : item
        ));
    };

    const handleContentChange = (content, ind) => {
        setworkData(workData.map((item, index) =>
            index === ind ? { ...item, description: content } : item
        ));
    };

    const handleExtraContentChange = (content, ind) => {
        setExtraWorkData(extraWorkData.map((item, index) =>
            index === ind ? { ...item, description: content } : item
        ));
    };


    // * total hours  generator
    const totalHours = useMemo(() => {
        const initialValue = 0;
        const sumWithInitial = parseFloat(workData.reduce((total, num) => Number(total) + Number(num.hours), initialValue).toFixed(2));
        return sumWithInitial
    }, [workData]);
    const extraTotalHours = useMemo(() => {
        const initialValue = 0;
        const extraHours = parseFloat(extraWorkData.reduce((total, num) => Number(total) + Number(num.hours), initialValue).toFixed(2));
        return extraHours
    }, [extraWorkData]);

    const config = useMemo(() => {
        return {
            readonly: false,
            placeholder: 'write your content ....'
        }
    }, []);

    // * submit form function
    const handleSubmit = (e) => {
        e.preventDefault();
        setError([])
        let isValidWork;
        let isValidExtraWork;

        permission && permission.name?.toLowerCase() === 'admin' && userIdValidation();
        workDateValidation();
        if (addExtraDetailToggle) {
            isValidExtraWork = validateExtraWork();
        }
        if (addWorkToggle) {
            isValidWork = validate();
        }

        if (hasErrors() || isValidWork || isValidExtraWork) {
            return false;
        } else if (!addWorkToggle && !addExtraDetailToggle) {
            setError(["Please add for work data or extra Work data, and try again."]);
            return false;
        } else {
            submitData();
        }
    }

    const submitData = () => {
        let url;
        const payload = {
            userId: work.userId,
            date: work.date,
            totalHours: addWorkToggle ? totalHours : 0,
            work: addWorkToggle ? workData : [],
            extraWork: addExtraDetailToggle ? extraWorkData : [],
            extraTotalHours: addExtraDetailToggle ? extraTotalHours : 0
        };

        if (!isRequest) {
            url = id
                ? customAxios().patch(`/report/${id}`, payload)
                : customAxios().post('/report/', payload);
        } else {
            url = customAxios().post("/report_request", { ...payload, title, wortReportId: id });
        }

        setisLoading(true);
        url.then(data => {
            if (data.data.success) {
                toast.success(data.data.message);
                if (!isRequest) {
                    getReport(work.userId, new Date(work.date), new Date(work.date));
                }
                setuser_id(work.userId);
                handleHide();
            }
        }).catch(handleApiError).finally(() => setisLoading(false));
    };

    const handleApiError = (error) => {
        if (!error.response) {
            toast.error(error.message);
        } else {
            if (error.response.data.message) {
                toast.error(error.response.data.message);
            } else {
                setError(error.response.data.error);
            }
        }
    };

    return (
        <>
            {data ? isRequest ?
                <Tooltip title="Edit Request" placement="top">
                    <i className="fa-solid fa-pen-to-square" onClick={handleShow} ></i>
                </Tooltip>
                : <i className="fa-solid fa-pen-to-square" onClick={handleShow} ></i> :
                permission && permission.permissions.create === 1 &&
                <button
                    className='btn btn-gradient-primary btn-rounded btn-fw text-center ' onClick={handleShow} >
                    <i className="fa-solid fa-plus" ></i>&nbsp;{isRequest ? "Add Request" : "Add"}
                </button >
            }
            {show &&
                <Modal show={show} animation={true} size="md" aria-labelledby="example-modal-sizes-title-sm" className='department-modal modal_Section' centered>
                    <Modal.Header className='small-modal'>
                        <Modal.Title>{data ? isRequest ? 'Edit Request' : "Edit Work Report" : isRequest ? 'Add Request' : "Add Work Report"}</Modal.Title>
                        <p className='close-modal' onClick={handleHide} ><i className="fa-solid fa-xmark"></i></p>
                    </Modal.Header>
                    <Modal.Body>
                        <div className=" grid-margin stretch-card inner-pages mb-lg-0">
                            <div className="card">
                                <div className="card-body set-padding">
                                    <form className="forms-sample">
                                        <div className="row">
                                            {/* ====================   select  employee ============*/}
                                            {(permission && permission.name && permission.name?.toLowerCase() === 'admin') &&
                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <label htmlFor="user" className='mt-3'>Employee</label>
                                                        <select className="form-control " id="user" name='userId' disabled={data} value={work.userId} onChange={handleChange} onBlur={userIdValidation} >
                                                            <option value=''>Select Employee </option>
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
                                                            disabled={data}
                                                            onChange={handleChange}
                                                            value={work.date}
                                                            onBlur={workDateValidation}
                                                            max={isRequest ? moment(new Date()).subtract(2, "day").format("YYYY-MM-DD") : moment(new Date()).format("YYYY-MM-DD")}
                                                            min={permission?.name?.toLowerCase() !== "admin" && !isRequest ? moment(new Date()).subtract(1, "day").format("YYYY-MM-DD") : ""}
                                                        />
                                                        <CalendarMonthIcon className='calendar-icon-work' />
                                                        {dateError && <small id="date-field" className="form-text error">{dateError}</small>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {addWorkToggle &&
                                            workData.map((item, ind) => {
                                                return (
                                                    <div className='education-wrapper mb-3' key={ind}>
                                                        <div data-action="delete" className='delete text-right' >
                                                            <i className="fa-solid fa-trash-can " onClick={() => deleteRow(ind)}></i>
                                                        </div>
                                                        <div className="row">
                                                            <div className="col-md-6">
                                                                {/* ====================   project select field  ============*/}
                                                                <div className="form-group">
                                                                    <label htmlFor="project" className='mt-3'>Projects</label>
                                                                    <select className="form-control " id="project" name='projectId' value={item.projectId} onChange={(e) => handleWorkChange(e, ind)} onBlur={() => projectValidation(ind)}>
                                                                        <option value=''>Select Project </option>
                                                                        {project.map((val) => {
                                                                            return <option key={val._id} value={val._id} >{val.name}</option>
                                                                        })}
                                                                    </select>
                                                                    {projectError.map((val) => {
                                                                        return val.id === ind && <small id="project-field" className="form-text error" key={val.id}>{val.name}</small>
                                                                    })}
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                {/* ====================   hours field  ============*/}
                                                                <div className="form-group">
                                                                    <label htmlFor="hours" className='mt-3'>Hours</label>
                                                                    <input type="number" className="form-control" min={0} max={24} id="hours" inputMode='numeric' placeholder="Enter Working Hours" name='hours' value={item.hours} onChange={(e) => handleWorkChange(e, ind)} onBlur={() => hourValidation(ind)} autoComplete='off' />
                                                                    {hoursError.map((val) => {
                                                                        return val.id === ind && <small id="hours-field" className="form-text error" key={val.id}>{val.name}</small>
                                                                    })}
                                                                </div>
                                                            </div>
                                                            <div className="col-md-12">
                                                                {/* ====================   description field  ============*/}
                                                                <div className="form-group">
                                                                    <label htmlFor="description" className='mt-3' >Description</label>
                                                                    <JoditEditor
                                                                        config={config}
                                                                        value={item.description}
                                                                        tabIndex={1} // tabIndex of textarea
                                                                        onChange={newContent => handleContentChange(newContent, ind)}
                                                                        onBlur={(newContent) => descriptionValidation(ind)}
                                                                    />
                                                                    {descriptionError.map((val) => {
                                                                        return val.id === ind && <small id="description-field" className="form-text error" key={val.id}>{val.name}</small>
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        }
                                        {/* ==================== add field button ================= */}
                                        <div className="work-report-form d-flex justify-content-between align-items-center">
                                            <NavLink onClick={addWork} className="active"><i className="fa-solid fa-circle-plus mr-1"></i> {!addWorkToggle ? "Add Daily Work" : 'Add more work'}</NavLink>

                                            {!addExtraDetailToggle &&
                                                <NavLink onClick={addExtraWork} className="active"><i className="fa-solid fa-circle-plus"></i> Add Extra Work Detail</NavLink>}
                                        </div>
                                        {addWorkToggle ?
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <label htmlFor="total-hours" className='mt-3'>Total Hours</label>
                                                        <input type="text" className="form-control" id="total-ours" placeholder="Enter total Hours" name='totalHours' value={totalHours} disabled />
                                                    </div>
                                                </div>
                                            </div> : ""
                                        }
                                        {addExtraDetailToggle && <>
                                            <div className='d-flex justify-content-between align-items-center'>
                                                <label style={{ color: "#0a4a92", fontWeight: 500, fontSize: "15px", borderBottom: "2px solid" }}>Extra Work Detail</label>
                                            </div>
                                            {extraWorkData.map((item, ind) => (
                                                <div className='education-wrapper mb-3' key={ind}>
                                                    <div data-action="delete" className='delete text-right' >
                                                        <i className="fa-solid fa-trash-can " onClick={() => deleteExtraRow(ind)}></i>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-md-6">
                                                            <div className="form-group">
                                                                <label htmlFor={`extraProject-${ind}`} className='mt-3'>Extra Project</label>
                                                                <select
                                                                    className="form-control"
                                                                    id={`extraProject-${ind}`}
                                                                    name='projectId'
                                                                    value={item.projectId}
                                                                    onChange={(e) => handleExtraWorkChange(e, ind)}
                                                                    onBlur={() => extraProjectValidation(ind)}
                                                                >
                                                                    <option value=''>Select Project</option>
                                                                    {project.map((val) => (
                                                                        <option key={val._id} value={val._id}>{val.name}</option>
                                                                    ))}
                                                                </select>
                                                                {extraProjectError.map((val) => (
                                                                    val.id === ind && <small id={`extraProject-field-${ind}`} className="form-text error" key={val.id}>{val.name}</small>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <div className="form-group">
                                                                <label htmlFor={`extraHours-${ind}`} className='mt-3'>Extra Hours</label>
                                                                <input
                                                                    type="number"
                                                                    className="form-control"
                                                                    min={0}
                                                                    max={24}
                                                                    id={`extraHours-${ind}`}
                                                                    inputMode='numeric'
                                                                    placeholder="Enter Extra Working Hours"
                                                                    name='hours'
                                                                    value={item.hours}
                                                                    onChange={(e) => handleExtraWorkChange(e, ind)}
                                                                    onBlur={() => extraHourValidation(ind)}
                                                                    autoComplete='off'
                                                                />
                                                                {extraHoursError.map((val) => (
                                                                    val.id === ind && <small id={`extraHours-field-${ind}`} className="form-text error" key={val.id}>{val.name}</small>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="col-md-12">
                                                            <div className="form-group">
                                                                <label htmlFor={`extraDescription-${ind}`} className='mt-3'>Extra Description</label>
                                                                <JoditEditor
                                                                    config={config}
                                                                    value={item.description}
                                                                    tabIndex={1}
                                                                    onChange={(newContent) => handleExtraContentChange(newContent, ind)}
                                                                    onBlur={() => extraDescriptionValidation(ind)}
                                                                />
                                                                {extraDescriptionError.map((val) => (
                                                                    val.id === ind && <small id={`extraDescription-field-${ind}`} className="form-text error" key={val.id}>{val.name}</small>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="work-report-form d-flex justify-content-between align-items-center">
                                                <NavLink onClick={addExtraWork} className="active"><i className="fa-solid fa-circle-plus"></i> Add More Work</NavLink>
                                            </div>
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <label htmlFor="total-hours" className='mt-3'>Extra Total Hours</label>
                                                        <input type="text" className="form-control" id="total-ours" placeholder="Enter total Hours" name='totalHours' value={extraTotalHours} disabled />
                                                    </div>
                                                </div>
                                            </div>
                                        </>}
                                        {error.length !== 0 &&
                                            <div className="row">
                                                <div className="col-md-12">
                                                    <ErrorComponent errors={error} />
                                                </div>
                                            </div>
                                        }
                                        <div className='d-flex justify-content-center modal-button'>
                                            <button type="submit" className="btn btn-gradient-primary mr-2" onClick={handleSubmit} >{isRequest ? "Send" : data ? 'Update' : 'Save'}</button>
                                            <button className="btn btn-light" onClick={handleHide}>Cancel</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                        {(isLoading || Loading) && <Spinner />}
                    </Modal.Body>
                </Modal>
            }
        </>
    );
}

export default WorkReportModal