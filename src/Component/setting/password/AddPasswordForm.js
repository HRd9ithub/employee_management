import React, { useContext, useEffect, useMemo, useState } from 'react';
import Modal from "react-bootstrap/Modal";
import Select from 'react-select';
import { AppProvider } from '../../context/RouteContext';
import Spinner from '../../common/Spinner';
import { GetLocalStorage } from '../../../service/StoreLocalStorage';
import { customAxios1 } from '../../../service/CreateApi';
import { toast } from 'react-hot-toast';
import { Dropdown, Form } from 'react-bootstrap';
import ErrorComponent from '../../common/ErrorComponent';
import { SpellCheck } from '../../ai/SpellCheck';
import { reWritePrompt } from '../../../helper/prompt';

const AddPasswordForm = (props) => {
    let { data, getPasswordRecord } = props;
    const [show, setShow] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [password, setPassword] = useState({
        title: "",
        url: "",
        user_name: "",
        password: "",
        note: "",
        file: ""
    })
    const [accessEmployee, setAccessEmployee] = useState(null);
    const [file, setFile] = useState({
        name: "",
        URL: ""
    })

    // error state
    const [titleError, setTitleError] = useState("");
    const [urlError, setUrlError] = useState("");
    const [userNameError, setUserNameError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [error, setError] = useState([]);

    // Global state
    let { get_username, userName, Loading } = useContext(AppProvider);
    const { loading, aiResponse } = SpellCheck();

    // *show modal
    const showModal = () => {
        if (data) {
            let { title, url, user_name, password, access, _id, note, file: fileData } = data;
            setPassword({
                title,
                password,
                user_name,
                url,
                id: _id,
                note: note ? note : ""
            });
            if (data.hasOwnProperty("access")) {
                let result = access.filter((u) => u._id !== data.createdBy).map((elem) => {
                    return { value: elem._id, label: elem.first_name.concat(" ", elem.last_name) }
                })
                setAccessEmployee(result);
            }
            if (fileData?.name) {
                setFile({
                    name: fileData.name,
                    URL: `${process.env.REACT_APP_IMAGE_API}/uploads/password/${fileData.pathName}`
                })
            }
        }
        setShow(true);
    }

    // *hide modal
    const hideModal = (event) => {
        event && event.preventDefault();

        setShow(false);
        setPassword({
            title: "",
            url: "",
            user_name: "",
            password: "",
            id: "",
            note: "",
            file: ""
        });
        setFile({
            name: "",
            URL: ""
        });
        setAccessEmployee(null);
        setTitleError("");
        setUrlError("");
        setUserNameError("");
        setPasswordError("");
        setError([]);
    }

    //  get userName for api
    useEffect(() => {
        if (show && GetLocalStorage("token")) {
            get_username();
        }
        // eslint-disable-next-line
    }, [show]);

    // option format change
    const employeeData = useMemo(() => {
        let result = [];
        userName.forEach((val) => {
            if (val.role.toLowerCase() !== "admin" && val._id !== GetLocalStorage("user_id") && val._id !== data?.createdBy) {
                result.push({ value: val._id, label: val.name })
            }
        })
        return result
    }, [userName, data])

    // form onchange function
    const handleChange = (event) => {
        let { value, name } = event.target;

        setPassword({ ...password, [name]: value });
    }


    function createImageObjectURL(file) {
        return URL.createObjectURL(file);
    }

    // onchange function
    const handleChangeFile = (e) => {
        if (e.target.files.length !== 0) {
            const fileData = e.target.files[0];
            const imageURL = createImageObjectURL(fileData);
            setFile({ ...file, name: fileData.name, URL: imageURL });
            setPassword({ ...password, file: fileData })
        }

    }

    // ? ===================== Validation Part for form ==================== 
    // title 
    const titleValidation = () => {
        if (!password.title.trim()) {
            setTitleError("Title is a required field.")
        } else {
            setTitleError("");
        }
    }
    // url 
    const urlValidation = () => {
        // eslint-disable-next-line
        if (!password.url.trim()) {
            setUrlError("URL is a required field.")
        } else {
            setUrlError("");
        }
    }
    // password 
    const passwordValidation = () => {
        if (!password.password.trim()) {
            setPasswordError("Password is a required field.")
        } else {
            setPasswordError("");
        }
    }
    // username 
    const usernameValidation = () => {
        if (!password.user_name.trim()) {
            setUserNameError("User name is a required field.")
        } else {
            setUserNameError("");
        }
    }

    // ? ========================== Form submit ===========================

    const handleSubmit = (event) => {
        event.preventDefault();

        titleValidation();
        urlValidation();
        usernameValidation();
        passwordValidation();

        if (!password.title || !password.url || !password.user_name || !password.password || titleError || urlError || userNameError || passwordError) {
            return false;
        }

        let user = accessEmployee?.map((val) => {
            return val.value
        })

        setError("");
        var formdata = new FormData();
        formdata.append('title', password.title);
        formdata.append('url', password.url);
        formdata.append('user_name', password.user_name);
        formdata.append('password', password.password);
        formdata.append('access_employee', user);
        formdata.append('note', password.note.trim());
        formdata.append('file', password.file);

        let url = "";
        if (data) {
            url = customAxios1().put(`/password/${password.id}`, formdata)
        } else {
            url = customAxios1().post('/password', formdata)
        }
        setIsLoading(true);
        url.then(data => {
            if (data.data.success) {
                toast.success(data.data.message);
                getPasswordRecord();
                hideModal();
                setIsLoading(false);
            }
        }).catch((error) => {
            setIsLoading(false);
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

    const handleAIReWrite = () => {
        aiResponse(reWritePrompt(password.note)).then((correctedText) => {
            setPassword({ ...password, note: correctedText })
        }).catch((error) => {
            toast.error(error.message);
        })
    }

    return (
        <>
            {data ? <Dropdown.Item className="dropdown-item" onClick={showModal}><i className="fa-solid fa-pen-to-square"></i><label>Edit</label></Dropdown.Item> :
                <button className="btn btn-gradient-primary btn-rounded btn-fw text-center" onClick={showModal}  ><i className="fa-solid fa-plus"></i>&nbsp;Add</button>}

            {/* modal  */}
            <Modal show={show} animation={true} size="md" aria-labelledby="example-modal-sizes-title-sm" className='department-modal password-modal' centered>
                <Modal.Header className='small-modal'>
                    <Modal.Title>{data ? 'Edit Password' : 'Add Password'}
                    </Modal.Title>
                    <p className='close-modal' onClick={hideModal}><i className="fa-solid fa-xmark"></i></p>
                </Modal.Header>
                <Modal.Body>
                    <div className=" grid-margin stretch-card inner-pages mb-lg-0">
                        <div className="card">
                            <div className="card-body">
                                <form className="forms-sample">
                                    <div className="row">
                                        <div className="col-md-6 pr-md-2 pl-md-2">
                                            <div className="form-group mb-2">
                                                <label htmlFor="title" className='mt-3'>Title</label>
                                                <input type="text" autoComplete='off' className="form-control" id="title" placeholder="Enter Title" name='title' value={password.title} onChange={handleChange} onBlur={titleValidation} />
                                                {titleError && <small id="title" className="form-text error">{titleError}</small>}
                                            </div>
                                        </div>
                                        <div className="col-md-6 pr-md-2 pl-md-2">
                                            <div className="form-group mb-2">
                                                <label htmlFor="url" className='mt-3'>URL</label>
                                                <input type="text" autoComplete='off' className="form-control" id="url" placeholder="Enter url" name='url' value={password.url} onChange={handleChange} onBlur={urlValidation} />
                                                {urlError && <small id="url" className="form-text error">{urlError}</small>}
                                            </div>
                                        </div>
                                        <div className="col-md-6 pr-md-2 pl-md-2">
                                            <div className="form-group mb-2">
                                                <label htmlFor="user_name" className='mt-3'>User Name</label>
                                                <input type="text" autoComplete='off' className="form-control" id="user_name" placeholder="Enter user name" name='user_name' value={password.user_name} onChange={handleChange} onBlur={usernameValidation} />
                                                {userNameError && <small id="user_name" className="form-text error">{userNameError}</small>}
                                            </div>
                                        </div>
                                        <div className="col-md-6 pr-md-2 pl-md-2">
                                            <div className="form-group mb-2">
                                                <label htmlFor="password" className='mt-3'>Password</label>
                                                <input type="text" autoComplete='off' className="form-control" id="password" placeholder="Enter password" name='password' value={password.password} onChange={handleChange} onBlur={passwordValidation} />
                                                {passwordError && <small id="password" className="form-text error">{passwordError}</small>}
                                            </div>
                                        </div>
                                        <div className="col-md-12 pr-md-2 pl-md-2">
                                            <div className="form-group mb-2">
                                                <label htmlFor="title" className='mt-3'>Employee</label>
                                                <Select className='employee-multiple-select'
                                                    options={employeeData}
                                                    isMulti
                                                    placeholder="select employee"
                                                    value={accessEmployee}
                                                    onChange={setAccessEmployee}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-12 pr-md-2 pl-md-2">
                                            <div className="form-group">
                                                <label htmlFor="note" className='mt-3'>Note</label>
                                                <div className='position-relative'>
                                                    <Form.Control as="textarea" rows={6} className="form-control" id="note" name='note' value={password.note} onChange={handleChange} />
                                                    {password?.note?.length > 3 && <button className='ai-button' type='button' onClick={handleAIReWrite} title='Improve it' disabled={loading} style={{ zIndex: 0 }} ><i className="fa-solid fa-wand-magic-sparkles"></i></button>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-12 pr-md-2 pl-md-2">
                                            <div className='form-group'>
                                                <label>File</label>
                                                <div className='d-flex justify-content-between' style={{ gap: "10px" }} >
                                                    <div className="custom-file" style={{ zIndex: 0 }}>
                                                        <Form.Control type="file" className="form-control visibility-hidden" id="document" name='file' onChange={handleChangeFile} />
                                                        <label className="custom-file-label" htmlFor="document">{file.name ? file.name : "Upload file"}</label>
                                                    </div>
                                                    {file.URL && <a className='btn-light btn' href={file.URL} target='_VIEW'>Preview</a>}
                                                </div>
                                                {/* {imageError && <small id="emailHelp" className="form-text error">{imageError}</small>} */}
                                            </div>
                                        </div>
                                        {error.length !== 0 &&
                                            <div className="col-12 pl-md-2 pr-md-2">
                                                <ErrorComponent errors={error} />
                                            </div>
                                        }
                                    </div>
                                    <div className='d-flex justify-content-center modal-button'>
                                        <button type="submit" className="btn btn-gradient-primary mr-2" onClick={handleSubmit}>{data ? 'Update' : 'Save'}</button>
                                        <button className="btn btn-light" onClick={hideModal} >Cancel</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                {(Loading || isLoading) && <Spinner />}
            </Modal>
        </>
    )
}

export default AddPasswordForm