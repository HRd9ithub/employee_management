import React, { useEffect, useState } from 'react'
import { Form } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import Spinner from '../../../common/Spinner';
import { useLocation, useNavigate } from 'react-router-dom';
import { customAxios1 } from '../../../../service/CreateApi';
import ErrorComponent from '../../../common/ErrorComponent';

const UserDoumentForm = (props) => {
    let { userDetail, getEmployeeDetail, getuser, handleClose } = props;

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState([]);


    const [file, setFile] = useState({
        photo: "",
        photo_name: {},
        aadhar_card: "",
        aadhar_card_name: {},
        resume: "",
        resume_name: {},
        offer_letter: "",
        offer_letter_name: {},
        pan_card: "",
        pan_card_name: {},
        other: "",
        other_name: {},
    })

    function createImageObjectURL(file) {
        return URL.createObjectURL(file);
    }

    // onchange function
    const InputEvent = (e) => {
        if (e.target.files.length !== 0) {
            const imageURL = createImageObjectURL(e.target.files[0]);
            setFile({ ...file, [e.target.name]: e.target.files[0], [`${e.target.name}_name`]: { name: e.target.files[0].name, url: imageURL } })
        }

    }


    useEffect(() => {
        let resume_temp = {};
        let offer_letter_temp = {};
        let pan_card_temp = {};
        let other_temp = {};
        let aadhar_card_temp = {};
        let photo_temp = {};

        if (userDetail.user_document.length > 0) {
            if (userDetail.user_document[0].resume !== null && userDetail.user_document[0].resume) {
                resume_temp = { name: userDetail.user_document[0].resume, url: `${process.env.REACT_APP_IMAGE_API}/uploads/${userDetail.user_document[0].resume}` }
            }
            if (userDetail.user_document[0].offer_letter !== null && userDetail.user_document[0].offer_letter) {
                offer_letter_temp = { name: userDetail.user_document[0].offer_letter, url: `${process.env.REACT_APP_IMAGE_API}/uploads/${userDetail.user_document[0].offer_letter}` }
            }
            if (userDetail.user_document[0].pan_card !== null && userDetail.user_document[0].pan_card) {
                pan_card_temp = { name: userDetail.user_document[0].pan_card, url: `${process.env.REACT_APP_IMAGE_API}/uploads/${userDetail.user_document[0].pan_card}` }
            }
            if (userDetail.user_document[0].other !== null && userDetail.user_document[0].other) {
                other_temp = { name: userDetail.user_document[0].other, url: `${process.env.REACT_APP_IMAGE_API}/uploads/${userDetail.user_document[0].other}` }
            }
            if (userDetail.user_document[0].aadhar_card !== null && userDetail.user_document[0].aadhar_card) {
                aadhar_card_temp = { name: userDetail.user_document[0].aadhar_card, url: `${process.env.REACT_APP_IMAGE_API}/uploads/${userDetail.user_document[0].aadhar_card}` }
            }
            if (userDetail.user_document[0].photo !== null && userDetail.user_document[0].photo) {
                photo_temp = { name: userDetail.user_document[0].photo, url: `${process.env.REACT_APP_IMAGE_API}/uploads/${userDetail.user_document[0].photo}` }
            }
        }

        setFile({
            photo: "",
            photo_name: photo_temp,
            aadhar_card: "",
            aadhar_card_name: aadhar_card_temp,
            resume: "",
            resume_name: resume_temp,
            offer_letter: "",
            offer_letter_name: offer_letter_temp,
            pan_card: "",
            pan_card_name: pan_card_temp,
            other: "",
            other_name: other_temp
        })
    }, [userDetail])

    // submit function
    const HandleSubmit = async (e) => {
        e.preventDefault();

        let { resume, offer_letter, pan_card, photo, aadhar_card, other } = file

        if (!resume && !offer_letter && !pan_card && !photo && !aadhar_card && !other) {
            toast.error("Please add at least one new document.");
            return false;
        }

        var formData = new FormData();
        formData.append('photo', photo);
        formData.append('pan_card', pan_card);
        formData.append('resume', resume);
        formData.append('offer_letter', offer_letter);
        formData.append('aadhar_card', aadhar_card);
        formData.append('other', other);
        formData.append('user_id', userDetail._id);

        try {
            setIsLoading(true)
            const response = await customAxios1().post('/user_document', formData);
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
            } else {
                if (error.response.data.message) {
                    toast.error(error.response.data.message)
                } else {
                    setError(error.response.data.error);
                }
            }
        } finally { setIsLoading(false) }
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
                    <div className="col-md-6 pl-md-2 pr-md-2">
                        <div className='form-group'>
                            <label>Photo</label>
                            <div className='d-flex justify-content-between'>
                                <div className="custom-file">
                                    <Form.Control type="file" className="form-control visibility-hidden" id="photo" name='photo' lang="es" accept="image/png,image/jpeg,image/jpg,.pdf" onChange={InputEvent} />
                                    <label className="custom-file-label" htmlFor="photo">{`${file.photo_name.name ? file.photo_name.name : 'Upload file'}`}</label>
                                </div>
                                <button disabled={!file.photo_name.url} className='custom-file-btn'>
                                    <a className='btn-light btn' href={file.photo_name.url} target='_VIEW'>Preview</a>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 pl-md-2 pr-md-2">
                        <div className='form-group'>
                            <label>Aadhar Card</label>
                            <div className='d-flex justify-content-between'>
                                <div className="custom-file">
                                    <Form.Control type="file" className="form-control visibility-hidden" id="aadhar_card" name='aadhar_card' lang="es" accept="image/png,image/jpeg,image/jpg,.doc,.pdf" onChange={InputEvent} />
                                    <label className="custom-file-label" htmlFor="aadhar_card">{`${file.aadhar_card_name.name ? file.aadhar_card_name.name : 'Upload file'}`}</label>
                                </div>
                                <button disabled={!file.aadhar_card_name.url} className='custom-file-btn'>
                                    <a className='btn-light btn' href={file.aadhar_card_name.url} target='_VIEW'>Preview</a>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 pl-md-2 pr-md-2">
                        <div className='form-group'>
                            <label>Pan Card</label>
                            <div className='d-flex justify-content-between'>
                                <div className="custom-file">
                                    <Form.Control type="file" className="form-control visibility-hidden" id="pan_card" lang="es" name='pan_card' accept="image/png,image/jpeg,image/jpg,.doc,.pdf" onChange={InputEvent} />
                                    <label className="custom-file-label" htmlFor="pan_card">{`${file.pan_card_name.name ? file.pan_card_name.name : 'Upload file'}`}</label>
                                </div>
                                <button disabled={!file.pan_card_name.url} className='custom-file-btn'>
                                    <a className='btn-light btn' href={file.pan_card_name.url} target='_VIEW'>Preview</a>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 pl-md-2 pr-md-2">
                        <div className='form-group'>
                            <label>Resume File</label>
                            <div className='d-flex justify-content-between'>
                                <div className="custom-file ">
                                    <Form.Control type="file" className="form-control visibility-hidden" id="customFileLang" name='resume' lang="es" accept="image/png,image/jpeg,image/jpg,.doc,.pdf" onChange={InputEvent} />
                                    <label className="custom-file-label" htmlFor="customFileLang">{`${file.resume_name.name ? file.resume_name.name : 'Upload file'}`}</label>
                                </div>
                                <button disabled={!file.resume_name.url} className='custom-file-btn'>
                                    <a className='btn-light btn' href={file.resume_name.url} target='_VIEW'>Preview</a>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 pl-md-2 pr-md-2">
                        <div className='form-group'>
                            <label>Offer Letter</label>
                            <div className='d-flex justify-content-between'>
                                <div className="custom-file">
                                    <Form.Control type="file" className="form-control visibility-hidden" id="customFileLang2" name='offer_letter' lang="es" accept="image/png,image/jpeg,image/jpg,.doc,.pdf" onChange={InputEvent} />
                                    <label className="custom-file-label" htmlFor="customFileLang2">{`${file.offer_letter_name.name ? file.offer_letter_name.name : 'Upload file'}`}</label>
                                </div>
                                <button disabled={!file.offer_letter_name.url} className='custom-file-btn'>
                                    <a className='btn-light btn' href={file.offer_letter_name.url} target='_VIEW'>Preview</a>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-6 pl-md-2 pr-md-2">
                        <div className='form-group'>
                            <label>Other</label>
                            <div className='d-flex justify-content-between'>
                                <div className="custom-file">
                                    <Form.Control type="file" className="form-control visibility-hidden" id="customFileLang4" name='other' lang="es" accept="image/png,image/jpeg,image/jpg,.doc,.pdf" onChange={InputEvent} />
                                    <label className="custom-file-label" htmlFor="customFileLang4">{`${file.other_name.name ? file.other_name.name : 'Upload file'}`}</label>
                                </div>
                                <button disabled={!file.other_name.url} className='custom-file-btn'>
                                    <a className='btn-light btn' href={file.other_name.url} target='_VIEW'>Preview</a>
                                </button>
                            </div>
                        </div>
                    </div>
                    {error.length !== 0 &&
                        <div className="col-12 pl-md-2 pr-md-2">
                            <ErrorComponent errors={error} />
                        </div>
                    }
                    <div className="col-12 pl-md-2 pr-md-2">
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
