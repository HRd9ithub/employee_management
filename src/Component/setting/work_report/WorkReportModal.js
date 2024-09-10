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

    // store database value
    const [project, setProject] = useState([])

    // initialistate state
    const [work, setWork] = useState({
        userId: "",
        date: "",
    })

    const [workData, setworkData] = useState([{
        projectId: "",
        description: "",
        hours: "0"
    }])
    const [extraWorkData, setExtraWorkData] = useState({
        projectId: "",
        description: "",
        hours: "0"
    })

    // error state
    const [userError, setUserError] = useState("");
    const [dateError, setdateError] = useState("");
    const [projectError, setprojectError] = useState([]);
    const [descriptionError, setdescriptionError] = useState([]);
    const [hoursError, sethoursError] = useState([]);
    const [extraProjectError, setExtraProjectError] = useState("");
    const [extraDescriptionError, setExtraDescriptionError] = useState("");
    const [extraHoursError, setExtraHoursError] = useState("");
    const [error, setError] = useState([]);
    const [title, setTitle] = useState("");

    let { get_username, userName, Loading } = useContext(AppProvider);

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
            setworkData(work);
            if (data.extraWork) {
                setAddExtraDetailToggle(true);
                setExtraWorkData({ ...data.extraWork, projectId: data.extraWork?.projectId || "" })
            }
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
        setUserError("")
        setprojectError([])
        setdescriptionError([])
        sethoursError([])
        setError([]);
        setdateError("")
        setWork({
            userId: "",
            date: "",
        })
        setworkData([{
            projectId: "",
            description: "",
            hours: "0"
        }])
        setExtraWorkData({
            projectId: "",
            description: "",
            hours: "0"
        });
        setExtraDescriptionError("");
        setExtraHoursError("");
        setExtraProjectError("");
        setAddExtraDetailToggle(false);
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
        if(addExtraDetailToggle){
            extraDescriptionValidation();
            extraHourValidation();
            extraProjectValidation();
        }

        if (userError || projectError.length !== 0 || descriptionError.length !== 0 || hoursError.length !== 0 || dateError || (permission && permission.name?.toLowerCase() === 'admin' && !userId) || !date || totalHours === "0" || data) {
            return false;
        } else if (addExtraDetailToggle && (!extraWorkData.projectId || !extraWorkData.hours || !extraWorkData.description || extraHoursError || extraProjectError || extraDescriptionError)) {
            return false;
        } else {
            let url = "";
            if (!isRequest) {
                if (id) {
                    url = customAxios().patch(`/report/${id}`, { userId, date, totalHours, work: workData, extraWork: addExtraDetailToggle ? extraWorkData : null })
                } else {
                    url = customAxios().post('/report/', { userId, date, totalHours, work: workData, extraWork: addExtraDetailToggle ? extraWorkData : null })
                }
            } else {
                url = customAxios().post("/report_request", { userId, date, totalHours, work: workData, title, wortReportId: id, extraWork: addExtraDetailToggle ? extraWorkData : null })
            }
            setisLoading(true);
            url.then(data => {
                if (data.data.success) {
                    toast.success(data.data.message);
                    if(!isRequest){
                        getReport(userId, new Date(date), new Date(date));
                    }
                    setuser_id(userId)
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
                    }]);
                    setAddExtraDetailToggle(false);
                    setExtraWorkData({
                        projectId: "",
                        description: "",
                        hours: "0"
                    })
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
            } else if (val.hours.toString() > 24 || val.hours.toString() < 0) {
                hError.push({ name: "Working hours range from 0 to 24 hours.", id: ind })
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
    const descriptionValidation = (ind, newContent) => {
        if (!workData[ind].description || workData[ind].description === "<p><br></p>") {
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
        } else if (workData[ind].hours.toString() > 24 || workData[ind].hours.toString() < 0) {
            sethoursError([...hoursError.filter((val) => {
                return val.id !== ind
            }), { name: "Working hours range from 0 to 24 hours.", id: ind }]);
        } else {
            let temp = hoursError.filter((elem) => {
                return elem.id !== ind
            })
            sethoursError(temp)
        }
    }
    // project id
    const extraProjectValidation = () => {
        if (!extraWorkData.projectId) {
            setExtraProjectError("Project is a required field.");
        } else {
            setExtraProjectError("");
        }
    }

    // description
    const extraDescriptionValidation = (ind, newContent) => {
        if (!extraWorkData.description || extraWorkData.description === "<p><br></p>") {
            setExtraDescriptionError("Description is a required field.");
        } else {
            setExtraDescriptionError("");
        }
    }

    // hours
    const extraHourValidation = (ind) => {
        if (!extraWorkData.hours) {
            setExtraHoursError("Hours is a required field.");
        } else if (extraWorkData.hours.toString() > 24 || extraWorkData.hours.toString() < 0) {
            setExtraHoursError("Hours range from 0 to 24 hours.");
        } else {
            setExtraHoursError("");
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
    // description
    const handleContentChange = (content, ind) => {
        let list = [...workData];
        list[ind].description = content;
        setworkData(list);
    }

    // * total hours  generator
    const totalHours = useMemo(() => {
        const initialValue = 0;
        const sumWithInitial = workData.reduce((total, num) => Number(total) + Number(num.hours), initialValue);
        return sumWithInitial
    }, [workData]);

    const config = useMemo(() => {
        return {
            readonly: false,
            placeholder: 'write your content ....'
        }
    }, []);

    const handleExtraWorkDataChange = (event) => {
        const { name, value } = event.target;
        setExtraWorkData({ ...extraWorkData, [name]: value });
    }

    const handleDeleteExtraDetail = () => {
        setAddExtraDetailToggle(false);
        setExtraWorkData({
            projectId: "",
            description: "",
            hours: "0"
        })
        setExtraDescriptionError("");
        setExtraHoursError("");
        setExtraProjectError("");
    }

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
                                    {workData.map((item, ind) => {
                                        return (
                                            <div className='education-wrapper mb-3' key={ind}>
                                                {ind > 0 && <div data-action="delete" className='delete text-right' >
                                                    <i className="fa-solid fa-trash-can " onClick={() => deleteRow(item._id, ind)}></i>
                                                </div>}
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
                                    })}
                                    {/* ==================== add field button ================= */}
                                    <div className="work-report-form d-flex justify-content-between align-items-center">
                                        <NavLink onClick={addDuplicate} className="active"><i className="fa-solid fa-circle-plus"></i> Add More</NavLink>
                                        {!addExtraDetailToggle &&
                                            <NavLink onClick={() => setAddExtraDetailToggle(true)} className="active"><i className="fa-solid fa-circle-plus"></i> Add Extra Work Detail</NavLink>}
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label htmlFor="total-hours" className='mt-3'>Total Hours</label>
                                                <input type="text" className="form-control" id="total-ours" placeholder="Enter total Hours" name='totalHours' value={totalHours} disabled />
                                            </div>
                                        </div>
                                    </div>
                                    {addExtraDetailToggle && <>
                                        <div className='d-flex justify-content-between align-items-center'>
                                            <label style={{ color: "#0a4a92", fontWeight: 500, fontSize: "15px", borderBottom: "2px solid" }}>Extra Work Detail</label>
                                            <div data-action="delete" className='delete' style={{ cursor: "pointer" }}>
                                                <i className="fa-solid fa-trash-can " onClick={handleDeleteExtraDetail}></i>
                                            </div>
                                        </div>
                                        <div className='education-wrapper mb-3'>
                                            <div className="row">
                                                <div className="col-md-6">
                                                    {/* ====================   project select field  ============*/}
                                                    <div className="form-group">
                                                        <label htmlFor="extraProject" className='mt-3'>Projects</label>
                                                        <select className="form-control " id="extraProject" name='projectId' value={extraWorkData.projectId} onChange={handleExtraWorkDataChange} onBlur={extraProjectValidation}>
                                                            <option value=''>Select Project</option>
                                                            {project.map((val) => {
                                                                return <option key={val._id} value={val._id} >{val.name}</option>
                                                            })}
                                                        </select>
                                                        {extraProjectError && <small id="project-field" className="form-text error">{extraProjectError}</small>}
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    {/* ====================   hours field  ============*/}
                                                    <div className="form-group">
                                                        <label htmlFor="extraHours" className='mt-3'>Extra Hours</label>
                                                        <input type="number" className="form-control" min={0} max={24} id="extraHours" inputMode='numeric' placeholder="Enter Extra Working Hours" name='hours' autoComplete='off' value={extraWorkData.hours} onChange={handleExtraWorkDataChange} onBlur={extraHourValidation} />
                                                        {extraHourValidation && <small id="project-field" className="form-text error">{extraHourValidation}</small>}
                                                    </div>
                                                </div>
                                                <div className="col-md-12">
                                                    {/* ====================   description field  ============*/}
                                                    <div className="form-group">
                                                        <label htmlFor="extraDescription" className='mt-3' >Description</label>
                                                        <JoditEditor
                                                            config={config}
                                                            value={extraWorkData.description}
                                                            tabIndex={1}
                                                            onChange={newContent => setExtraWorkData({ ...extraWorkData, description: newContent })}
                                                            onBlur={extraDescriptionValidation}
                                                        />
                                                        {extraDescriptionError && <small id="project-field" className="form-text error">{extraDescriptionError}</small>}
                                                    </div>
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
        </>
    );
}

export default WorkReportModal