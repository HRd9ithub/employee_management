import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Spinner from '.././common/Spinner';
import GlobalPageRedirect from '../auth_context/GlobalPageRedirect';
import { toast } from 'react-hot-toast';
import JoditEditor from 'jodit-react';
import { useEffect } from 'react';
import { customAxios } from '../../service/CreateApi';

function WorkReportModal({ data, permission, getReport }) {
    // common state
    const [show, setShow] = useState(false);
    const [id, setId] = useState('')
    const [isLoading, setisLoading] = useState(false)

    // store database value
    const [project, setProject] = useState([])
    const [user, setUser] = useState([])

    // initialistate state
    const [work, setWork] = useState({
        userId: "",
        projectId: "",
        description: "",
        hours: ""
    })

    // error state
    const [userError, setUserError] = useState("");
    const [projectError, setprojectError] = useState("");
    const [descriptionError, setdescriptionError] = useState("");
    const [hoursError, sethoursError] = useState("");
    const [error, setError] = useState([]);

    let { getCommonApi } = GlobalPageRedirect();

    // modal show function
    const handleShow = () => {
        if (data) {
            let { _id, userId, projectId, description, hours } = data;
            setId(_id);

            setWork({
                userId: userId,
                projectId: projectId,
                description: description,
                hours: hours
            });
        }
        setShow(true)
    }
    // modal hide  function
    const handleHide = (e) => {
        e && e.preventDefault();

        setShow(false);
        setUserError("")
        setprojectError("")
        setdescriptionError("")
        sethoursError("")
        setError([]);
        setWork({
            userId: "",
            projectId: "",
            description: "",
            hours: ""
        })
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
                if (error.response.status === 401) {
                    getCommonApi();
                } else {
                    if (error.response.data.message) {
                        toast.error(error.response.data.message)
                    }
                }
            }
        } finally {
            setisLoading(false)
        }
    }

    // get user name
    const get_username = async () => {
        setisLoading(true)
        try {
            const res = await customAxios().post('/user/username');

            if (res.data.success) {
                let data = res.data.data.filter((val) => val.role.toLowerCase() !== "admin")
                setUser(data);
            }
        } catch (error) {
            if (!error.response) {
                toast.error(error.message);
            } else {
                if (error.response.status === 401) {
                    getCommonApi();
                } else {
                    if (error.response.data.message) {
                        toast.error(error.response.data.message)
                    }
                }
            }
        } finally {
            setisLoading(false)
        }
    };

    // initialistate onchange function
    const handleChange = (e) => {
        let { name, value } = e.target;

        setWork({ ...work, [name]: value })
    }

    // descriptionChange
    const descriptionChange = (value) => {
        setWork({ ...work, "description": value });
        if (!value || value === "<p><br></p>") {
            setdescriptionError("Description is a required field.");
        } else {
            setdescriptionError("");
        }
    }

    // CUSTOM EDITOR CONFIG
    let editorConfig = {
        readonly: false,
        tabIndex: 1,

        askBeforePasteHTML: false,
        askBeforePasteFromWord: false,
        defaultActionOnPaste: 'insert_clear_html',

        placeholder: 'Write something awesome ...',
        beautyHTML: true,
        toolbarButtonSize: "large",
        buttons: [
            'source',
            '|', 'bold', 'italic',
            '|', 'ul', 'ol',
            '|', 'font', 'fontsize', 'brush', 'paragraph',
            '|', 'left', 'center', 'right', 'justify',
            '|', 'undo', 'redo',
            '|', 'hr', 'eraser', 'fullsize'
        ],
        removeButtons: ["image", "link"]
    }


    // submit form function
    const handleSubmit = (e) => {
        e.preventDefault();
        setError([])
        let { userId, projectId, description, hours } = work;

        permission && permission.name?.toLowerCase() === 'admin' && userIdValidation();
        projectValidation();
        hourValidation();
        if (!description || description === "<p><br></p>") {
            setdescriptionError("Description is a required field.");
        } else {
            setdescriptionError("");
        }

        if (userError || projectError || descriptionError || hoursError || (permission && permission.name?.toLowerCase() === 'admin' && !userId) || !projectId || !description || !hours) {
            return false;
        } else {
            let url = "";
            if (id) {
                url = customAxios().patch(`/report/${id}`, { userId, projectId, description, hours })
            } else {
                url = customAxios().post('/report/', { userId, projectId, description, hours })
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
                        projectId: "",
                        description: "",
                        hours: ""
                    })
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
    }

    // validation form  part

    // user id
    const userIdValidation = () => {
        if (!work.userId || work.userId === "0") {
            setUserError("Employee is a required field.");
        } else {
            setUserError("");
        }
    }
    // project id
    const projectValidation = () => {
        if (!work.projectId || work.projectId === "0") {
            setprojectError("Project is a required field.");
        } else {
            setprojectError("");
        }
    }
    // hours
    const hourValidation = () => {
        if (!work.hours) {
            sethoursError("Working hours is a required field.");
        } else if (!work.hours.toString().match(/^[0-9]+$/)) {
            sethoursError("Working hours must be a number.");
        } else if (work.hours.toString() > 24 || work.hours.toString() < 1) {
            sethoursError("Working hours range from 1 to 24 hours. ");
        } else {
            sethoursError("");
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
            <Modal show={show} animation={true} size="md" aria-labelledby="example-modal-sizes-title-sm" className='small-modal department-modal modal_Section' centered>
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
                                    {(permission && permission.name && permission.name?.toLowerCase() === 'admin') &&
                                        <div className="form-group">
                                            <label htmlFor="user" className='mt-3'>Employee</label>
                                            <select className="form-control " id="user" name='userId' disabled={data} value={work.userId} onChange={handleChange} onBlur={userIdValidation} >
                                                <option value='0'>Select Employee </option>
                                                {user.map((val) => {
                                                    return (
                                                        <option key={val._id} value={val._id}>{val.first_name.concat(' ', val.last_name)}</option>
                                                    )
                                                })}
                                            </select>
                                            {userError && <small id="emailHelp" className="form-text error">{userError}</small>}
                                        </div>}
                                    <div className="form-group">
                                        <label htmlFor="project" className='mt-3'>Projects</label>
                                        <select className="form-control " id="project" name='projectId' value={work.projectId} onChange={handleChange} onBlur={projectValidation}>
                                            <option value='0'>Select Project </option>
                                            {project.map((val) => {
                                                return <option key={val._id} value={val._id} >{val.name}</option>
                                            })}
                                        </select>
                                        {projectError && <small id="emailHelp" className="form-text error">{projectError}</small>}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="description" className='mt-3'>Description</label>
                                        <JoditEditor value={work.description} config={editorConfig}
                                            onBlur={descriptionChange}
                                        // onBlur={newContent => this.setContent(newContent)}
                                        />
                                        {descriptionError && <small id="emailHelp" className="form-text error">{descriptionError}</small>}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="hours" className='mt-3'>Working Hours</label>
                                        <input type="text" className="form-control" id="hours" placeholder="Enter Working Hours" name='hours' value={work.hours} onChange={handleChange} maxLength={2} onBlur={hourValidation} />
                                        {hoursError && <small id="emailHelp" className="form-text error">{hoursError}</small>}
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
                    {isLoading && <Spinner />}
                </Modal.Body>
            </Modal>
        </>
    );
}

export default WorkReportModal