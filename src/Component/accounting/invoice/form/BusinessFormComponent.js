import React, { useState, useRef } from 'react'
import Modal from 'react-bootstrap/Modal';
import Spinner from '../../../common/Spinner';
import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";
import { toast } from 'react-hot-toast';
import { customAxios1 } from "../../../../service/CreateApi";
import { alphabetFormat, emailFormat, gstinRegex, numberFormat } from '../../../common/RegaulrExp';
import { country } from '../../../../static/country';
import ErrorComponent from '../../../common/ErrorComponent';

const BusinessFormComponent = ({ data, getBusinessDetail }) => {
    const imageRef = useRef();

    const [modalShow, setModalShow] = useState(false);
    const [business, setBusiness] = useState({
        profile_image: "",
        business_name: "",
        address: "",
        GSTIN: "",
        pan_number: "",
        country: "",
        state: "",
        city: "",
        postcode: "",
        email: "",
        phone: "",
    });
    const [isLoading, setisLoading] = useState(false);
    const [image, setImage] = useState("");

    const [businessNameError, setbusinessNameError] = useState('');
    const [GSTINError, setGSTINError] = useState('');
    const [emailError, setemailError] = useState('');
    const [phoneError, setphoneError] = useState('');
    const [stateError, setstateError] = useState('');
    const [cityError, setcityError] = useState('');
    const [postcodeError, setpostcodeError] = useState('');
    const [addressError, setaddressError] = useState('');

    const [error, setError] = useState([]);

    // *-------------------- modal show and hide ----------------------------
    // show modal 
    const showModal = () => {
        if (data) {
            setBusiness({
                business_name: data.business_name,
                email: data.email ? data.email : "",
                phone: data.phone ? data.phone : "",
                country: data.country ? data.country : "",
                state: data.state ? data.state : "",
                city: data.city ? data.city : "",
                address: data.address,
                postcode: data.postcode ? data.postcode : "",
                profile_image: process.env.REACT_APP_IMAGE_API + "/" + data.profile_image,
                GSTIN: data.GSTIN ? data.GSTIN : "",
                pan_number: data.pan_number ? data.pan_number : "",
            })
            setImage(data.profile_image);
        }
        setModalShow(true);
    }

    // hide modal function
    const onHideModal = (e) => {
        if (e) {
            e.preventDefault();
        }
        setModalShow(false);
        setBusiness({
            GSTIN: "",
            pan_number: "",
            business_name: "",
            email: "",
            phone: "",
            country: "",
            state: "",
            city: "",
            address: "",
            postcode: "",
            profile_image: ""
        });
        setbusinessNameError('');
        setemailError("");
        setphoneError("");
        setGSTINError("");
        setstateError("");
        setcityError("");
        setpostcodeError("");
        setaddressError("");
        setError([]);
    }

    // -------------  form function -------------------------

    // chnage function
    const handleChange = (e) => {
        const { name, value } = e.target;

        setBusiness({ ...business, [name]: value });
    }

    const imageChange = (e) => {
        if (e.target.files.length !== 0) {
            setImage(e.target.files[0]);
            setBusiness({ ...business, profile_image: URL.createObjectURL(e.target.files[0]) })
        }
    }

    // business name validation 
    const businessNameValidation = () => {
        if (!business.business_name.trim()) {
            setbusinessNameError("Business Name is a required field.");
        } else {
            setbusinessNameError("");
        }
    }

    //  address validation
    const addressValidation = () => {
        if (!business.address) {
            setaddressError("Address is a required field.")
        } else if (!business.address.trim()) {
            setaddressError("Please enter a valid address.")
        } else {
            setaddressError("");
        }
    }

    // email validation 
    const emailValidation = () => {
        if (business.email) {
            if (!emailFormat.test(business.email)) {
                setemailError("Email must be a valid email.");
            } else {
                setemailError("");
            }
        } else {
            setemailError("");
        }
    }

    // phone validation
    const phoneValidation = () => {
        if (business.phone) {
            if (!numberFormat.test(business.phone)) {
                setphoneError("Mobile number must be a number.");
            } else if (business.phone.length !== 10) {
                setphoneError("Your mobile number must be 10 characters.");
            } else {
                setphoneError("");
            }
        } else {
            setphoneError("");
        }
    }

    // state validation
    const stateValidation = () => {
        if (business.state) {
            if (!business.state.match(alphabetFormat)) {
                setstateError("State must be alphabetic.");
            } else {
                setstateError("");
            }
        } else {
            setstateError("");
        }
    }

    // city validation
    const cityValidate = () => {
        if (business.city) {
            if (!business.city.match(alphabetFormat)) {
                setcityError("City must be alphabetic.");
            } else {
                setcityError("")
            }
        } else {
            setcityError("")
        }
    }

    // postcode validation
    const postcodeValidation = () => {
        if (business.postcode) {
            if (!business.postcode.toString().match(numberFormat)) {
                setpostcodeError("Postcode must be a number.");
            } else if (business.postcode.toString().length !== 6) {
                setpostcodeError("Your postcode must be 6 characters.");
            } else {
                setpostcodeError("");
            }
        } else {
            setpostcodeError("");
        }
    }

    // GSTIN validation
    const GSTINValidation = () => {
        if (business.GSTIN) {
            if (business.GSTIN.trim().length !== 15) {
                setGSTINError("GST number should be exactly 15 characters.");
            } else if (!business.GSTIN.match(gstinRegex)) {
                setGSTINError("Invalid GSTIN");
            } else {
                setBusiness({ ...business, pan_number: business.GSTIN.slice(2, 12) });
                setGSTINError("");
            }
        } else {
            setGSTINError("");
            setBusiness({ ...business, pan_number: "" });
        }
    }

    // submit function
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError([]);
        businessNameValidation();
        addressValidation();
        stateValidation();
        cityValidate();
        postcodeValidation();
        phoneValidation();
        GSTINValidation();
        emailValidation();

        let { business_name, email, phone, country, state, city, address, postcode, GSTIN, pan_number } = business;

        if (!business_name || !address) {
            return false;
        } else if (businessNameError || emailError || phoneError || stateError || cityError || postcodeError || addressError || GSTINError) {
            return false;
        } else {
            setisLoading(true);
            let formdata = new FormData();
            formdata.append('profile_image', image);
            formdata.append('business_name', business_name.charAt(0).toUpperCase() + business_name.slice(1));
            formdata.append('email', email);
            formdata.append('phone', phone);
            formdata.append('country', country);
            formdata.append('state', state);
            formdata.append('city', city);
            formdata.append('postcode', postcode);
            formdata.append('address', address);
            formdata.append('GSTIN', GSTIN);
            formdata.append('pan_number', pan_number);
            let url = "";
            if (data) {
                url = customAxios1().put(`/invoice/business/${data._id}`, formdata);
            } else {
                url = customAxios1().post('/invoice/business', formdata);
            }

            url.then((result) => {
                if (result.data.success) {
                    setModalShow(false)
                    toast.success(result.data.message);
                    setBusiness({
                        GSTIN: "",
                        pan_number: "",
                        business_name: "",
                        email: "",
                        phone: "",
                        country: "",
                        state: "",
                        city: "",
                        address: "",
                        postcode: "",
                        profile_image: ""
                    });
                    setImage("");
                    getBusinessDetail(result.data.id);
                }
            }).catch((error) => {
                if (!error.response) {
                    toast.error(error.message);
                } else {
                    if (error.response.data.message) {
                        toast.error(error.response.data.message)
                    } else {
                        setError(error.response.data.error);
                    }
                }
            }).finally(() => {
                setisLoading(false);
            })
        }
    }

    return (
        <>
            {data ? <label className='edit-client-icon' onClick={showModal}><i className="fa-solid fa-pencil"></i> Edit</label> :
                <button className='btn add-client-button button-full-width mx-auto' type='button' onClick={showModal}><i className="fa-solid fa-circle-plus"></i> add new business</button>}
            <Modal
                show={modalShow}
                onHide={onHideModal}
                size="md"
                backdrop="static"
                keyboard={false}
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header closeButton className='small-modal'>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Business Details
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className=" grid-margin stretch-card inner-pages mb-lg-0">
                        <div className="card">
                            <div className="card-body">
                                <form className="forms-sample" >
                                    <div className="row">
                                        <div className="col-md-12 pr-md-2 pl-md-2">
                                            <div className='client-profile-div'>
                                                <label className='d-flex justify-content-center align-items-center'>
                                                    <input type="file" accept='image/png, image/jpg, image/jpeg' name="image" id="image" className='d-none' ref={imageRef} onChange={imageChange} />
                                                    <i className="fa-solid fa-camera"></i>
                                                    {business.profile_image ? <img src={business.profile_image} width="120px" height="120px" alt='client-logo' /> :
                                                        <div className='d-flex justify-content-center align-items-center flex-column'>
                                                            <i className="fa-solid fa-plus"></i>
                                                            <p className='mb-0 mt-1'>Add Logo</p>
                                                        </div>}
                                                </label>
                                            </div>
                                        </div>
                                        <div className="col-md-12 pr-md-2 pl-md-2">
                                            <div className="form-group">
                                                <label htmlFor="business_name">Business Name</label>
                                                <input type="text" className="form-control text-capitalize" id="business_name" placeholder="Enter Business Name" name="business_name" value={business.business_name} onChange={handleChange} maxLength={25} onBlur={businessNameValidation} />
                                                {businessNameError && <small id="business_name" className="form-text error">{businessNameError}</small>}
                                            </div>
                                        </div>
                                        <div className="col-md-12 pr-md-2 pl-md-2">
                                            <div className="form-group">
                                                <label htmlFor="address">Address</label>
                                                <input type="text" className="form-control" id="address" placeholder="Enter address" name="address" value={business.address} onChange={handleChange} onBlur={addressValidation} />
                                                {addressError && <small id="address" className="form-text error">{addressError}</small>}
                                            </div>
                                        </div>
                                        <div className="col-md-12 pr-md-2 pl-md-2">
                                            <h4 className="mb-3">Tax Information <small className="text-gray">(optional)</small></h4>
                                        </div>
                                        <div className="col-md-6 pr-md-2 pl-md-2">
                                            <div className="form-group">
                                                <label htmlFor="GSTIN">Business GSTIN</label>
                                                <input type="text" className="form-control" id="GSTIN" placeholder="Enter Business GSTIN" name="GSTIN" value={business.GSTIN} onChange={handleChange} maxLength={15} onBlur={GSTINValidation} />
                                                {GSTINError && <small id="address" className="form-text error text-capitalize">{GSTINError}</small>}
                                            </div>
                                        </div>
                                        <div className="col-md-6 pr-md-2 pl-md-2">
                                            <div className="form-group">
                                                <label htmlFor="pan_number">Business PAN Number</label>
                                                <input type="text" className="form-control" id="pan_number" placeholder="Enter Business PAN Number" name="pan_number" value={business.pan_number} readOnly />
                                            </div>
                                        </div>
                                        <div className="col-md-12 pr-md-2 pl-md-2">
                                            <h4 className="mb-3">Address <small className="text-gray">(optional)</small></h4>
                                        </div>
                                        <div className="col-md-6 pr-md-2 pl-md-2">
                                            <div className="form-group">
                                                <label htmlFor="state">State</label>
                                                <input type="text" className="form-control" id="state" placeholder="Enter state" name="state" value={business.state} onChange={handleChange} onBlur={stateValidation} />
                                                {stateError && <small id="state" className="form-text error">{stateError}</small>}
                                            </div>
                                        </div>
                                        <div className="col-md-6 pr-md-2 pl-md-2">
                                            <div className="form-group">
                                                <label htmlFor="city">City</label>
                                                <input type="text" className="form-control" id="city" placeholder="Enter city" name="city" value={business.city} onChange={handleChange} onBlur={cityValidate} />
                                                {cityError && <small id="city" className="form-text error">{cityError}</small>}
                                            </div>
                                        </div>
                                        <div className="col-md-6 pr-md-2 pl-md-2">
                                            <div className="form-group">
                                                <label htmlFor="postcode">Postcode</label>
                                                <input type="text" className="form-control" id="postcode" placeholder="Enter Postcode" name="postcode" value={business.postcode} maxLength={6} onChange={handleChange} onBlur={postcodeValidation} />
                                                {postcodeError && <small id="postcode" className="form-text error">{postcodeError}</small>}
                                            </div>
                                        </div>
                                        <div className="col-md-6 pr-md-2 pl-md-2">
                                            <div className="form-group">
                                                <label htmlFor="country">Country</label>
                                                <select className="form-control" id='country' name="country" value={business.country} onChange={handleChange}>
                                                    <option value="">Select country</option>
                                                    {country.map((elem, ind) => {
                                                        return <option key={ind} value={elem}>{elem}</option>
                                                    })}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-md-12 pr-md-2 pl-md-2">
                                            <h4 className="mb-3">Additional Details <small className="text-gray">(optional)</small></h4>
                                        </div>
                                        <div className="col-md-6 pr-md-2 pl-md-2">
                                            <div className="form-group">
                                                <label htmlFor="email">Email Address</label>
                                                <input type="email" className="form-control" id="email" placeholder="Enter email" name="email" onChange={handleChange} value={business.email} autoComplete='off' onBlur={emailValidation} />
                                                {emailError && <small id="email" className="form-text error">{emailError}</small>}
                                            </div>
                                        </div>
                                        <div className="col-md-6 pr-md-2 pl-md-2">
                                            <div className="form-group">
                                                <label htmlFor="phone">Mobile No.</label>
                                                <input type="tel" className="form-control" id="phone" maxLength="10" minLength="10" placeholder="Enter mobile number" name="phone" onChange={handleChange} value={business.phone} autoComplete='off' inputMode='numeric' onBlur={phoneValidation} />
                                                {phoneError && <small id="phone" className="form-text error">{phoneError}</small>}
                                            </div>
                                        </div>
                                        {error.length !== 0 &&
                                            <div className="col-12 pl-md-2 pr-md-2">
                                                <ErrorComponent errors={error} />
                                            </div>
                                        }
                                    </div>
                                    <div className='d-flex justify-content-center modal-button'>
                                        <button type="submit" className="btn btn-gradient-primary mr-2" onClick={handleSubmit}> Save</button>
                                        <button className="btn btn-light" onClick={onHideModal}>Cancel</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                {isLoading && <Spinner />}
            </Modal>
        </>
    )
}

export default BusinessFormComponent
