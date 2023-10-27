import React, { useContext, useEffect, useMemo, useState } from 'react';
import Modal from "react-bootstrap/Modal";
import Select from 'react-select';
import { AppProvider } from '../../context/RouteContext';
import Spinner from '../../common/Spinner';
import { GetLocalStorage } from '../../../service/StoreLocalStorage';
import { encryptPassword } from '../../../service/passwordEncrypt';
import { customAxios } from '../../../service/CreateApi';
import toast from 'react-hot-toast';
import GlobalPageRedirect from '../../auth_context/GlobalPageRedirect';
// import { toast } from "react-hot-toast";

const AddPasswordForm = (props) => {
    let { data } = props;

    // initialistate 
    const [show, setShow] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [password, setPassword] = useState({
        title: "",
        url: "",
        email: "",
        password: ""
    })
    const [accessEmployee, setAccessEmployee] = useState(null);

    // errror state
    const [titleError, setTitleError] = useState("");
    const [urlError, setUrlError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [error, setError] = useState([]);

    // Global state
    let { get_username, userName, Loading } = useContext(AppProvider);
    let { getCommonApi } = GlobalPageRedirect();

    // *show modal
    const showModal = () => {
        setShow(true);
    }

    // *hide modal
    const hideModal = (event) => {
        event && event.preventDefault();

        setShow(false);
        setPassword({
            title: "",
            url: "",
            email: "",
            password: ""
        });
        setAccessEmployee(null);
        setTitleError("");
        setUrlError("");
        setEmailError("");
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
            if (val.role.toLowerCase() !== "admin") {
                result.push({ value: val._id, label: val.first_name.concat(" ", val.last_name) })
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
        if (!password.url.trim()) {
            setUrlError("Url is a required field.")
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
    // email 
    const emailValidation = () => {
        if (!password.email.trim()) {
            setEmailError("Email is a required field.")
        } else {
            setEmailError("");
        }
    }

    // ? ========================== Form submit funcation ===========================

    const handleSubmit = (event) => {
        event.preventDefault();

        titleValidation();
        urlValidation();
        emailValidation();
        passwordValidation();

        if (!password.title || !password.url || !password.email || !password.password || titleError || urlError || emailError || passwordError) {
            return false;
        }

        let epassword = encryptPassword(password.password);
        let user = accessEmployee?.map((val) => {
            return val.value
        })

        setError("");
        let url = "";
        // if (id) {
        //     url = customAxios().patch(`/project/${id}`, { name: name.charAt(0).toUpperCase() + name.slice(1) })
        // } else {
        url = customAxios().post('/password', {
            title: password.title,
            url: password.url,
            email: password.email,
            password: epassword,
            access_employee: user
        })
        // }
        setIsLoading(true);
        url.then(data => {
            if (data.data.success) {
                toast.success(data.data.message)
                setShow(false);
                setPassword({
                    title: "",
                    url: "",
                    email: "",
                    password: ""
                });
                setAccessEmployee(null);
                setTitleError("");
                setUrlError("");
                setEmailError("");
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
            <button className="btn btn-gradient-primary btn-rounded btn-fw text-center" onClick={showModal}  ><i className="fa-solid fa-plus"></i>&nbsp;Add</button>

            {/* modal  */}
            <Modal show={show} animation={true} size="md" aria-labelledby="example-modal-sizes-title-sm" className='small-modal department-modal password-modal' centered>
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
                                            <input type="text" className="form-control" id="title" placeholder="Enter Title" name='title' value={password.title} onChange={handleChange} onBlur={titleValidation} />
                                            {titleError && <small id="title" className="form-text error">{titleError}</small>}
                                        </div>
                                        <div className="form-group col-md-6">
                                            <label htmlFor="url" className='mt-3'>URL</label>
                                            <input type="text" className="form-control" id="url" placeholder="Enter url" name='url' value={password.url} onChange={handleChange} onBlur={urlValidation} />
                                            {urlError && <small id="url" className="form-text error">{urlError}</small>}
                                        </div>
                                        <div className="form-group col-md-6">
                                            <label htmlFor="email" className='mt-3'>Email</label>
                                            <input type="text" className="form-control" id="email" placeholder="Enter email" name='email' value={password.email} onChange={handleChange} onBlur={emailValidation} />
                                            {emailError && <small id="email" className="form-text error">{emailError}</small>}
                                        </div>
                                        <div className="form-group col-md-6">
                                            <label htmlFor="password" className='mt-3'>Password</label>
                                            <input type="text" className="form-control" id="password" placeholder="Enter password" name='password' value={password.password} onChange={handleChange} onBlur={passwordValidation} />
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