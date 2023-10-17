import React, { useEffect, useState } from 'react'
import { Form } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import Spinner from '../../../common/Spinner';
import { useLocation, useNavigate } from 'react-router-dom';
import GlobalPageRedirect from '../../../auth_context/GlobalPageRedirect';
import { customAxios1 } from '../../../../service/CreateApi';

const UserDoumentForm = (props) => {
    let { userDetail, getEmployeeDetail, getuser, handleClose } = props;

    const [isLoading, setisLoading] = useState(false);
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
                setFile({ ...file, [e.target.name]: e.target.files[0], [`${e.target.name}_name`]: e.target.files[0].name })
        }
    }

    let resume_temp = "";
    let offer_letter_temp = "";
    let joining_letter_temp = "";
    let other_temp = "";

    useEffect(() => {
    if(userDetail.user_document.length > 0){
        if (userDetail.user_document[0].resume !== null) {
            // eslint-disable-next-line
            resume_temp = userDetail.user_document[0].resume
        }
        if (userDetail.user_document[0].offer_letter !== null) {
            // eslint-disable-next-line
            offer_letter_temp = userDetail.user_document[0].offer_letter
        }
        if (userDetail.user_document[0].joining_letter !== null) {
            // eslint-disable-next-line
            joining_letter_temp = userDetail.user_document[0].joining_letter;
        }
        if (userDetail.user_document[0].other !== null) {
            // eslint-disable-next-line
            other_temp = userDetail.user_document[0].other;
        }
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
            var formdata = new FormData();
            formdata.append('resume', resume);
            formdata.append('offer_letter', offer_letter);
            formdata.append('joining_letter', joining_letter);
            formdata.append('other', other);
            formdata.append('user_id', userDetail._id);

            try {
                setisLoading(true)
                const response = await customAxios1().post('/user_document/',formdata);
                if (response.data.success) {
                    toast.success(response.data.message)
                    if (pathname.toLocaleLowerCase().includes('/profile')) {
                        getuser();
                        handleClose();
                    } else {
                        getEmployeeDetail()
                    }
                }
            } catch (error) {
                if (!error.response) {
                    toast.error(error.message)
                } else if (error.response.status === 401) {
                    getCommonApi();
                } else {
                    if (error.response.data.message) {
                        toast.error(error.response.data.message)
                    } else {
                        setError(error.response.data.error);
                    }
                }
            } finally { setisLoading(false) }
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
                <div className="row">
                    <div className="col-md-6">
                        <div className='form-group'>
                            <label>Resume File</label>
                            <div className='d-flex justify-content-between'>
                                <div className="custom-file ">
                                    <Form.Control type="file" className="form-control visibility-hidden" id="customFileLang" name='resume' lang="es" accept="image/png,image/jpeg,image/jpg,.doc,.pdf" onChange={InputEvent} />
                                    <label className="custom-file-label" htmlFor="customFileLang">{`${file.resume_name ? file.resume_name : 'Upload file'}`}</label>
                                </div>
                                <button disabled={(!file.resume_name || file.resume)} className='custom-file-btn'>
                                    <a className='btn-light btn' href={`${process.env.REACT_APP_IMAGE_API}/uploads/${file.resume_name}`} target='_VIEW'>Preview</a>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className='form-group'>
                            <label>Offer Letter</label>
                            <div className='d-flex justify-content-between'>
                                <div className="custom-file">
                                    <Form.Control type="file" className="form-control visibility-hidden" id="customFileLang2" name='offer_letter' lang="es" accept="image/png,image/jpeg,image/jpg,.doc,.pdf" onChange={InputEvent} />
                                    <label className="custom-file-label" htmlFor="customFileLang2">{`${file.offer_letter_name ? file.offer_letter_name : 'Upload file'}`}</label>
                                </div>
                                <button disabled={!file.offer_letter_name || file.offer_letter} className='custom-file-btn'>
                                    <a className='btn-light btn' href={`${process.env.REACT_APP_IMAGE_API}/uploads/${file.offer_letter_name}`} target='_VIEW'>Preview</a>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className='form-group'>
                            <label>Joining Letter</label>
                            <div className='d-flex justify-content-between'>
                                <div className="custom-file">
                                    <Form.Control type="file" className="form-control visibility-hidden" id="customFileLang3" lang="es" name='joining_letter' accept="image/png,image/jpeg,image/jpg,.doc,.pdf" onChange={InputEvent} />
                                    <label className="custom-file-label" htmlFor="customFileLang3">{`${file.joining_letter_name ? file.joining_letter_name : 'Upload file'}`}</label>
                                </div>
                                <button disabled={!file.joining_letter_name || file.joining_letter} className='custom-file-btn'>
                                    <a className='btn-light btn' href={`${process.env.REACT_APP_IMAGE_API}/uploads/${file.joining_letter_name}`} target='_VIEW'>Preview</a>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className='form-group'>
                            <label>Other</label>
                            <div className='d-flex justify-content-between'>
                                <div className="custom-file">
                                    <Form.Control type="file" className="form-control visibility-hidden" id="customFileLang4" name='other' lang="es" accept="image/png,image/jpeg,image/jpg,.doc,.pdf" onChange={InputEvent} />
                                    <label className="custom-file-label" htmlFor="customFileLang4">{`${file.other_name ? file.other_name : 'Upload file'}`}</label>
                                </div>
                                <button disabled={!file.other_name || file.other} className='custom-file-btn'>
                                    <a className='btn-light btn' href={`${process.env.REACT_APP_IMAGE_API}/uploads/${file.other_name}`} target='_VIEW'>Preview</a>
                                </button>
                            </div>
                        </div>
                    </div>
                    {error.map((elem) => {
                        return <div className="col-12" key={elem}><li className='error'>{elem}</li></div>
                    })}
                    <div className="col-12">
                        <div className="submit-section d-flex justify-content-between py-3">
                            <button className="btn btn-gradient-primary" type='submit' onClick={HandleSubmit}>Save</button>
                            <button className="btn btn-light" onClick={BackBtn}>{pathname.toLocaleLowerCase().includes('/employees') ? "Back" : "Cancel"}</button>
                        </div>
                    </div>
                </div>
            </form>
            {isLoading && <Spinner />}
        </>
    )
}

export default UserDoumentForm
