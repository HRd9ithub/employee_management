import React, { useContext, useEffect, useMemo, useState } from 'react';
import Modal from "react-bootstrap/Modal";
import Select from 'react-select';
import { AppProvider } from '../../context/RouteContext';
import Spinner from '../../common/Spinner';
import { GetLocalStorage } from '../../../service/StoreLocalStorage';
import { customAxios } from '../../../service/CreateApi';
import {toast} from 'react-hot-toast';
import GlobalPageRedirect from '../../auth_context/GlobalPageRedirect';
import { Dropdown } from 'react-bootstrap';
import { urlFormat } from '../../common/RegaulrExp';

const AddPasswordForm = (props) => {
    let { data, getPasswordRecord } = props;

    // initialistate 
    const [show, setShow] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [password, setPassword] = useState({
        title: "",
        url: "",
        user_name: "",
        password: "",
        note: ""
    })
    const [accessEmployee, setAccessEmployee] = useState(null);

    // errror state
    const [titleError, setTitleError] = useState("");
    const [urlError, setUrlError] = useState("");
    const [userNameError, setuserNameError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [noteError, setnoteError] = useState("");
    const [error, setError] = useState([]);

    // Global state
    let { get_username, userName, Loading } = useContext(AppProvider);
    let { getCommonApi } = GlobalPageRedirect();

    // *show modal
    const showModal = () => {
        if (data) {
            let { title, url, user_name, password, access, _id, note } = data;
            setPassword({
                title,
                password,
                user_name,
                url,
                id: _id,
                note
            });
            if (data.hasOwnProperty("access")) {
                let result = access.map((elem) => {
                    return { value: elem._id, label: elem.first_name.concat(" ", elem.last_name) }
                })
                setAccessEmployee(result);
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
            note: ""
        });
        setAccessEmployee(null);
        setTitleError("");
        setUrlError("");
        setuserNameError("");
        setPasswordError("");
        setnoteError("");
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
            if (val.role.toLowerCase() !== "admin") {
                result.push({ value: val._id, label: val.name })
            }
        })
        return result
    }, [userName])

    // form onchange function
    const handleChange = (event) => {
        let { value, name } = event.target;

        setPassword({ ...password, [name]: value });
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
        } else if (!urlFormat.test(password.url)) {
            setUrlError("URL must be a valid URL.")
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
            setuserNameError("User name is a required field.")
        } else {
            setuserNameError("");
        }
    }

    // note 
    const noteValidation = () => {
        if (!password.note.trim()) {
            setnoteError("Note is a required field.")
        } else {
            setnoteError("");
        }
    }

    // ? ========================== Form submit funcation ===========================

    const handleSubmit = (event) => {
        event.preventDefault();

        titleValidation();
        urlValidation();
        usernameValidation();
        passwordValidation();
        noteValidation();

        if (!password.title || !password.url || !password.note || !password.user_name || !password.password || titleError || urlError || userNameError || passwordError || noteError) {
            return false;
        }

        let user = accessEmployee?.map((val) => {
            return val.value
        })

        setError("");
        let url = "";
        if (data) {
            url = customAxios().put(`/password/${password.id}`, {
                title: password.title,
                url: password.url,
                user_name: password.user_name,
                password: password.password,
                access_employee: user,
                note: password.note
            })
        } else {
            url = customAxios().post('/password', {
                title: password.title,
                url: password.url,
                user_name: password.user_name,
                password: password.password,
                access_employee: user,
                note: password.note
            })
        }
        setIsLoading(true);
        url.then(data => {
            if (data.data.success) {
                toast.success(data.data.message);
                getPasswordRecord();
                setShow(false);
                setPassword({
                    title: "",
                    url: "",
                    user_name: "",
                    password: "",
                    id: "",
                    note: ""
                });
                setAccessEmployee(null);
                setTitleError("");
                setUrlError("");
                setuserNameError("");
                setnoteError("");
                setPasswordError("");
                setError([]);
                setIsLoading(false);
            }
        }).catch((error) => {
            setIsLoading(false);
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
                                        <div className="form-group col-md-6">
                                            <label htmlFor="title" className='mt-3'>Title</label>
                                            <input type="text" autoComplete='off' className="form-control" id="title" placeholder="Enter Title" name='title' value={password.title} onChange={handleChange} onBlur={titleValidation} />
                                            {titleError && <small id="title" className="form-text error">{titleError}</small>}
                                        </div>
                                        <div className="form-group col-md-6">
                                            <label htmlFor="url" className='mt-3'>URL</label>
                                            <input type="text" autoComplete='off' className="form-control" id="url" placeholder="Enter url" name='url' value={password.url} onChange={handleChange} onBlur={urlValidation} />
                                            {urlError && <small id="url" className="form-text error">{urlError}</small>}
                                        </div>
                                        <div className="form-group col-md-6">
                                            <label htmlFor="user_name" className='mt-3'>User Name</label>
                                            <input type="text" autoComplete='off' className="form-control" id="user_name" placeholder="Enter user name" name='user_name' value={password.user_name} onChange={handleChange} onBlur={usernameValidation} />
                                            {userNameError && <small id="user_name" className="form-text error">{userNameError}</small>}
                                        </div>
                                        <div className="form-group col-md-6">
                                            <label htmlFor="password" className='mt-3'>Password</label>
                                            <input type="text" autoComplete='off' className="form-control" id="password" placeholder="Enter password" name='password' value={password.password} onChange={handleChange} onBlur={passwordValidation} />
                                            {passwordError && <small id="password" className="form-text error">{passwordError}</small>}
                                        </div>
                                        <div className="form-group col-12">
                                            <label htmlFor="title" className='mt-3'>Employee</label>
                                            <Select className=''
                                                options={employeeData}
                                                isMulti
                                                placeholder="select employee"
                                                value={accessEmployee}
                                                onChange={setAccessEmployee}
                                            />
                                        </div>
                                        <div className="form-group col-12">
                                            <label htmlFor="note" className='mt-3'>Note</label>
                                            <textarea type="text" autoComplete='off' rows={2} cols={10} className="form-control" id="note" name='note' value={password.note} onChange={handleChange} onBlur={noteValidation} />
                                            {noteError && <small id="note" className="form-text error">{noteError}</small>}
                                        </div>
                                    </div>
                                    {error.length !== 0 &&
                                        <ol>
                                            {error?.map((val) => {
                                                return <li className='error' key={val}>{val}</li>
                                            })}
                                        </ol>}
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