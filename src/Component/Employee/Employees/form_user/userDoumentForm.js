import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Spinner from '../../../common/Spinner';
import { useLocation, useNavigate } from 'react-router-dom';
import GlobalPageRedirect from '../../../auth_context/GlobalPageRedirect';
import { GetLocalStorage } from '../../../../service/StoreLocalStorage';

const UserDoumentForm = (props) => {
    let { userDetail, getEmployeeDetail, getuser, handleClose } = props;

    const [loader, setLoader] = useState(false);
    const [error, setError] = useState([])

    const [file, setFile] = useState({
        resume: "",
        resume_name: "",
        offer_letter: "",
        offer_letter_name: "",
        joining_letter: "",
        joining_letter_name: "",
        other: "",
        other_name: ""
    })

    let {getCommonApi} = GlobalPageRedirect();

    // onchange function
    const InputEvent = (e) => {
        if (e.target.files.length !== 0) {
            var reader = new FileReader();

            reader.onloadend = function () {
                setFile({ ...file, [e.target.name]: reader.result, [`${e.target.name}_name`]: e.target.files[0].name })
            }
            reader.readAsDataURL(e.target.files[0]);
        }
    }

    let resume_temp = "";
    let offer_letter_temp = "";
    let joining_letter_temp = "";
    let other_temp = "";

    useEffect(() => {

        if (userDetail.resume !== null) {
            // eslint-disable-next-line
            resume_temp = userDetail.resume
        }
        if (userDetail.offer_letter !== null) {
            // eslint-disable-next-line
            offer_letter_temp = userDetail.offer_letter
        }
        if (userDetail.joining_letter !== null) {
            // eslint-disable-next-line
            joining_letter_temp = userDetail.joining_letter;
        }
        if (userDetail.other !== null) {
            // eslint-disable-next-line
            other_temp = userDetail.other;
        }

        setFile({
            resume: "",
            resume_name: resume_temp,
            offer_letter: "",
            offer_letter_name: offer_letter_temp,
            joining_letter: "",
            joining_letter_name: joining_letter_temp,
            other: "",
            other_name: other_temp
        })
    }, [userDetail])

    // submit function
    const HandleSubmit = async (e) => {
        e.preventDefault();

        let { resume,offer_letter, joining_letter,  other} = file

        if (!resume && !offer_letter && !joining_letter && !other) {
            toast.error("Please select atleast one file.");
            return false;
        } else {
            try {
                setLoader(true)
                const response = await axios.post(`${process.env.REACT_APP_API_KEY}/userProfile/documents`, { resume, other, joining_letter, offer_letter, user_id: userDetail.id }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${GetLocalStorage('token')}`
                    }
                });
                if (response.data.success) {
                    setLoader(false);
                    if (other_temp || offer_letter_temp || resume_temp || joining_letter_temp) {
                        toast.success("Saved Successfully")
                    } else {
                        toast.success("Added Successfully")
                    }
                    if (pathname.toLocaleLowerCase().includes('/profile')) {
                        getuser();
                        handleClose();
                    } else {
                        getEmployeeDetail()
                    }
                } else {
                    setLoader(false)
                    toast.error("Something went wrong, Please check your details and try again.")
                }
            } catch (error) {
                console.log("🚀 ~ file: AccountForm.js:111 ~ HandleSubmit ~ error:", error)
                setLoader(false)
                if (error.response.status === 401) {
                    getCommonApi();
                } else {
                    if (error.response.data.message) {
                        toast.error(error.response.data.message)
                    } else {
                        if (typeof error.response.data.error === "object") {
                            setError(error.response.data.error)
                        } else {
                            toast.error(error.response.data.error)
                        }
                    }
                }
            }
        }
    }

    let history = useNavigate();
    let { pathname } = useLocation();
    // back btn
    const BackBtn = (e) => {
        e.preventDefault();
        if (pathname.toLocaleLowerCase().includes('/employees')) {
            history("/employees")
        } else {
            handleClose();
        }
    }

    return (
        <>
            <form className="forms-sample mt-4">
                <div className='form-group'>
                    <label>Resume File</label>
                    <div className='d-flex justify-content-between'>
                        <div className="custom-file ">
                            <Form.Control type="file" className="form-control visibility-hidden" id="customFileLang" name='resume' lang="es" accept="image/png,image/jpeg,image/jpg,.doc, .docx,.pdf" onChange={InputEvent} />
                            <label className="custom-file-label" htmlFor="customFileLang">{`${file.resume_name ? file.resume_name : 'Upload file'}`}</label>
                        </div>
                        <button disabled={(!file.resume_name || file.resume)} className='custom-file-btn'>
                            <a className='btn-light btn' href={`${process.env.REACT_APP_IMAGE_API}/storage/${file.resume_name}`} target='_VIEW'>Preview</a>
                        </button>
                    </div>
                </div>
                <div className='form-group'>
                    <label>Offer Letter</label>
                    <div className='d-flex justify-content-between'>
                        <div className="custom-file">
                            <Form.Control type="file" className="form-control visibility-hidden" id="customFileLang2" name='offer_letter' lang="es" accept="image/png,image/jpeg,image/jpg,.doc, .docx,.pdf" onChange={InputEvent} />
                            <label className="custom-file-label" htmlFor="customFileLang2">{`${file.offer_letter_name ? file.offer_letter_name : 'Upload file'}`}</label>
                        </div>
                        <button disabled={!file.offer_letter_name || file.offer_letter} className='custom-file-btn'>
                            <a className='btn-light btn' href={`${process.env.REACT_APP_IMAGE_API}/storage/${file.offer_letter_name}`} target='_VIEW'>Preview</a>
                        </button>
                    </div>
                </div>

                <div className='form-group'>
                    <label>Joining Letter</label>
                    <div className='d-flex justify-content-between'>
                        <div className="custom-file">
                            <Form.Control type="file" className="form-control visibility-hidden" id="customFileLang3" lang="es" name='joining_letter' accept="image/png,image/jpeg,image/jpg,.doc, .docx,.pdf" onChange={InputEvent} />
                            <label className="custom-file-label" htmlFor="customFileLang3">{`${file.joining_letter_name ? file.joining_letter_name : 'Upload file'}`}</label>
                        </div>
                        <button disabled={!file.joining_letter_name || file.joining_letter} className='custom-file-btn'>
                            <a className='btn-light btn' href={`${process.env.REACT_APP_IMAGE_API}/storage/${file.joining_letter_name}`} target='_VIEW'>Preview</a>
                        </button>
                    </div>
                </div>
                <div className='form-group'>
                    <label>Other</label>
                    <div className='d-flex justify-content-between'>
                        <div className="custom-file">
                            <Form.Control type="file" className="form-control visibility-hidden" id="customFileLang4" name='other' lang="es" accept="image/png,image/jpeg,image/jpg,.doc, .docx,.pdf" onChange={InputEvent} />
                            <label className="custom-file-label" htmlFor="customFileLang4">{`${file.other_name ? file.other_name : 'Upload file'}`}</label>
                        </div>
                        <button disabled={!file.other_name || file.other} className='custom-file-btn'>
                            <a className='btn-light btn' href={`${process.env.REACT_APP_IMAGE_API}/storage/${file.other_name}`} target='_VIEW'>Preview</a>
                        </button>
                    </div>
                </div>
                {error.map((elem) => {
                    return <li className='error' key={error}>{elem}</li>
                })}
                <div className="submit-section d-flex justify-content-between py-3">
                    <button className="btn btn-light" onClick={BackBtn}>{pathname.toLocaleLowerCase().includes('/employees') ? "Back" : "Cancel"}</button>
                    <button className="btn btn-gradient-primary" onClick={HandleSubmit}>Save</button>
                </div>
            </form>
            {loader && <Spinner />}
        </>
    )
}

export default UserDoumentForm
