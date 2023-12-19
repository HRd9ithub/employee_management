import React, { useState, useRef } from 'react'
import Modal from 'react-bootstrap/Modal';
import Spinner from '../../../common/Spinner';
import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";
import { toast } from 'react-hot-toast';
import { customAxios, customAxios1 } from "../../../../service/CreateApi";
import { alphabetFormat, emailFormat, numberFormat } from '../../../common/RegaulrExp';
import { country } from '../../../../static/country';

const ClientFormComponent = ({ data, getClientDetail }) => {
    const imageRef = useRef();

    const [modalShow, setModalShow] = useState(false);
    const [client, setclient] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        country: "",
        state: "",
        city: "",
        address: "",
        postcode: "",
        profile_image: ""
    });
    const [isLoading, setisLoading] = useState(false);
    const [image, setImage] = useState("");

    const [firstNameError, setfirstNameError] = useState('');
    const [lastNameError, setlastNameError] = useState('');
    const [emailError, setemailError] = useState('');
    const [phoneError, setphoneError] = useState('');
    const [countryError, setcountryError] = useState('');
    const [stateError, setstateError] = useState('');
    const [cityError, setcityError] = useState('');
    const [postcodeError, setpostcodeError] = useState('');
    const [addressError, setaddressError] = useState('');

    const [error, setError] = useState([]);

    // *-------------------- modal show and hide ----------------------------
    // show modal 
    const showModal = () => {
        if (data) {
            setclient({
                first_name: data.first_name,
                last_name: data.last_name,
                email: data.email,
                phone: data.phone,
                country: data.country,
                state: data.state,
                city: data.city,
                address: data.address,
                postcode: data.postcode,
                profile_image: process.env.REACT_APP_IMAGE_API + "/" + data.profile_image
            })
        }
        setModalShow(true);
    }

    // hide modal function
    const onHideModal = (e) => {
        if (e) {
            e.preventDefault();
        }
        setModalShow(false);
        setclient({
            first_name: "",
            last_name: "",
            email: "",
            phone: "",
            country: "",
            state: "",
            city: "",
            address: "",
            postcode: "",
            profile_image: ""
        });
        setfirstNameError('');
        setlastNameError("");
        setemailError("");
        setphoneError("");
        setError([]);
    }

    // -------------  form function -------------------------

    // chnage function
    const handleChange = (e) => {
        const { name, value } = e.target;

        setclient({ ...client, [name]: value })
    }

    const imageChange = (e) => {
        if (e.target.files.length !== 0) {
            setImage(e.target.files[0]);
            setclient({ ...client, profile_image: URL.createObjectURL(e.target.files[0]) })
        }
    }

    // first name validation 
    const firstNameValidation = () => {
        if (!client.first_name) {
            setfirstNameError("First Name is a required field.");
        } else if (!alphabetFormat.test(client.first_name)) {
            setfirstNameError("First Name must be alphabetic.");
        } else {
            setfirstNameError("");
        }
    }
    // last name validation 
    const lastNameValidation = () => {
        if (!client.last_name) {
            setlastNameError("Last Name is a required field.");
        } else if (!alphabetFormat.test(client.last_name)) {
            setlastNameError("Last Name must be alphabetic.");
        } else {
            setlastNameError("");
        }
    }
    // email validation 
    const emailValidation = () => {
        if (!client.email) {
            setemailError("Email is a required field.");
        } else if (!emailFormat.test(client.email)) {
            setemailError("Email must be a valid email.");
        } else {
            setemailError("");
        }
    }

    // email check in database
    const checkEmail = async () => {
        if (!client.email) {
            setemailError("Email is a required field.");
        } else if (!emailFormat.test(client.email)) {
            setemailError("Email must be a valid email.");
        } else {
            if (data && client.email === data.email) {
                setemailError("")
            } else {
                setisLoading(true)

                customAxios().post('/invoice/client/email', { email: client.email }).then((response) => {
                    if (response.data.success) {
                        setemailError("")
                    }
                }).catch((error) => {
                    if (!error.response) {
                        toast.error(error.message);
                    } else {
                        if (error.response.data.message) {
                            toast.error(error.response.data.message)
                        } else {
                            setemailError(error.response.data.error);
                        }
                    }
                }).finally(() => {
                    setisLoading(false)
                })
            }
        }
    }

    // phone validation
    const phoneValidation = () => {
        if (!client.phone) {
            setphoneError("Mobile number is a required field.");
        } else if (!numberFormat.test(client.phone)) {
            setphoneError("Mobile number must be a number.");
        } else if (client.phone.length !== 10) {
            setphoneError("Your mobile number must be 10 characters.");
        } else {
            setphoneError("");
        }
    }

    // country validation
    const countryValidation = () => {
        if (!client.country) {
            setcountryError("Country is a required field.");
        } else {
            setcountryError("")
        }
    }

    // state validation
    const stateValidation = () => {
        if (!client.state) {
            setstateError("State is a required field.");
        } else if (!client.state.match(alphabetFormat)) {
            setstateError("State must be alphabetic.");
        } else {
            setstateError("");
        }
    }

    // city validation
    const cityValidate = () => {
        if (!client.city) {
            setcityError("City is a required field.");
        } else if (!client.city.match(alphabetFormat)) {
            setcityError("City must be alphabetic.");
        } else { setcityError("") }
    }

    // postcode validation
    const postcodeValidation = () => {
        if (!client.postcode) {
            setpostcodeError("Postcode is a required field.");
        } else if (!client.postcode.toString().match(numberFormat)) {
            setpostcodeError("Postcode must be a number.");
        } else if (client.postcode.toString().length !== 6) {
            setpostcodeError("Your postcode must be 6 characters.");
        } else {
            setpostcodeError("");
        }
    }

    // address validation
    const addressValidation = () => {
        if (!client.address) {
            setaddressError("Address is a required field.")
        } else if (!client.address.trim()) {
            setaddressError("Please enter a valid address.")
        } else {
            setaddressError("");
        }
    }


    // submit function
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError([]);
        firstNameValidation();
        lastNameValidation();
        if (!emailError) {
            emailValidation();
        }
        phoneValidation();
        countryValidation();
        stateValidation();
        cityValidate();
        postcodeValidation();
        addressValidation();

        let { first_name, last_name, email, phone, country, state, city, address, postcode } = client;

        if (!first_name || !last_name || !email || !phone || !country || !state || !city || !address || !postcode) {
            return false;
        } else if (firstNameError || lastNameError || emailError || phoneError || countryError || stateError || cityError || postcodeError || addressError) {
            return false;
        } else {
            setisLoading(true);
            let formdata = new FormData();
            formdata.append('profile_image', image);
            formdata.append('first_name', first_name.charAt(0).toUpperCase() + first_name.slice(1));
            formdata.append('last_name', last_name.charAt(0).toUpperCase() + last_name.slice(1));
            formdata.append('email', email);
            formdata.append('phone', phone);
            formdata.append('country', country);
            formdata.append('state', state);
            formdata.append('city', city);
            formdata.append('postcode', postcode);
            formdata.append('address', address);
            let url = "";
            if (data) {
                url = customAxios1().put(`/invoice/client/${data._id}`, formdata);
            } else {
                url = customAxios1().post('/invoice/client', formdata);
            }

            url.then((result) => {
                if (result.data.success) {
                    setModalShow(false)
                    toast.success(result.data.message);
                    setclient({
                        first_name: "",
                        last_name: "",
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
                    getClientDetail(result.data.id);
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
                <button className='btn add-client-button button-full-width mx-auto' type='button' onClick={showModal}><i className="fa-solid fa-circle-plus"></i> add new client</button>}
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
                        Add New Client
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
                                                <label  >
                                                    {client.profile_image && <img src={client.profile_image} width="120px" height="120px" alt='client-logo' />}
                                                    <input type="file" accept='image/png, image/jpg, image/jpeg' name="image" id="image" className='d-none' ref={imageRef} onChange={imageChange} />
                                                    <i className="fa-solid fa-camera"></i>
                                                </label>
                                            </div>
                                        </div>
                                        <div className="col-md-6 pr-md-2 pl-md-2">
                                            <div className="form-group">
                                                <label htmlFor="first_name">First Name</label>
                                                <input type="text" className="form-control text-capitalize" id="first_name" placeholder="Enter First name" name="first_name" value={client.first_name} onChange={handleChange} onBlur={firstNameValidation} autoComplete='off' maxLength={25} />
                                                {firstNameError && <small id="first_name" className="form-text error">{firstNameError}</small>}
                                            </div>
                                        </div>
                                        <div className="col-md-6 pr-md-2 pl-md-2">
                                            <div className="form-group">
                                                <label htmlFor="last_name">Last Name</label>
                                                <input type="text" className="form-control text-capitalize" id="last_name" placeholder="Enter last name" name="last_name" value={client.last_name} onChange={handleChange} onBlur={lastNameValidation} autoComplete='off' maxLength={25} />
                                                {lastNameError && <small id="last_name" className="form-text error">{lastNameError}</small>}
                                            </div>
                                        </div>
                                        <div className="col-md-6 pr-md-2 pl-md-2">
                                            <div className="form-group">
                                                <label htmlFor="email">Email Address</label>
                                                <input type="email" className="form-control" id="email" placeholder="Enter email" name="email" onChange={handleChange} value={client.email} onBlur={checkEmail} autoComplete='off' />
                                                {emailError && <small id="email" className="form-text error">{emailError}</small>}
                                            </div>
                                        </div>
                                        <div className="col-md-6 pr-md-2 pl-md-2">
                                            <div className="form-group">
                                                <label htmlFor="phone">Mobile No.</label>
                                                <input type="tel" className="form-control" id="phone" maxLength="10" minLength="10" placeholder="Enter mobile number" name="phone" onChange={handleChange} value={client.phone} onBlur={phoneValidation} autoComplete='off' inputMode='numeric' />
                                                {phoneError && <small id="phone" className="form-text error">{phoneError}</small>}
                                            </div>
                                        </div>
                                        <div className="col-md-6 pr-md-2 pl-md-2">
                                            <div className="form-group">
                                                <label htmlFor="country">Country</label>
                                                <select className="form-control" id='country' name="country" value={client.country} onChange={handleChange} onBlur={countryValidation} >
                                                    <option value="">Select country</option>
                                                    {country.map((elem, ind) => {
                                                        return <option key={ind} value={elem}>{elem}</option>
                                                    })}
                                                </select>
                                                {countryError && <small id="country" className="form-text error">{countryError}</small>}
                                            </div>
                                        </div>
                                        <div className="col-md-6 pr-md-2 pl-md-2">
                                            <div className="form-group">
                                                <label htmlFor="state">State</label>
                                                <input type="text" className="form-control" id="state" placeholder="Enter state" name="state" value={client.state} onChange={handleChange} onBlur={stateValidation} />
                                                {stateError && <small id="state" className="form-text error">{stateError}</small>}
                                            </div>
                                        </div>
                                        <div className="col-md-6 pr-md-2 pl-md-2">
                                            <div className="form-group">
                                                <label htmlFor="city">City</label>
                                                <input type="text" className="form-control" id="city" placeholder="Enter city" name="city" value={client.city} onChange={handleChange} onBlur={cityValidate} />
                                                {cityError && <small id="city" className="form-text error">{cityError}</small>}
                                            </div>
                                        </div>
                                        <div className="col-md-6 pr-md-2 pl-md-2">
                                            <div className="form-group">
                                                <label htmlFor="postcode">Postcode</label>
                                                <input type="text" className="form-control" id="postcode" placeholder="Enter Postcode" name="postcode" value={client.postcode} maxLength={6} onChange={handleChange} onBlur={postcodeValidation} />
                                                {postcodeError && <small id="postcode" className="form-text error">{postcodeError}</small>}
                                            </div>
                                        </div>
                                        <div className="col-md-12 pr-md-2 pl-md-2">
                                            <div className="form-group">
                                                <label htmlFor="address">Address</label>
                                                <input type="text" className="form-control" id="address" placeholder="Enter address" name="address" value={client.address} onChange={handleChange} onBlur={addressValidation} />
                                                {addressError && <small id="address" className="form-text error">{addressError}</small>}
                                            </div>
                                        </div>
                                    </div>
                                    {error.length !== 0 &&
                                        <ol>
                                            {error?.map((val) => {
                                                return <li className='error' key={val}>{val}</li>
                                            })}
                                        </ol>}
                                    <div className='d-flex justify-content-center modal-button'>
                                        <button type="submit" className="btn btn-gradient-primary mr-2" onClick={handleSubmit} > Save</button>
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

export default ClientFormComponent
