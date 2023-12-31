import React from 'react'
import { useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-hot-toast';
import { useEffect } from 'react';
import Spinner from '../../../common/Spinner';
import { useLocation, useNavigate } from 'react-router-dom';
import { customAxios } from '../../../../service/CreateApi';
import { alphSpaceFormat, emailFormat, numberFormat } from '../../../common/RegaulrExp';
import ErrorComponent from '../../../common/ErrorComponent';

const EmergencyForm = (props) => {
    let { userDetail, getEmployeeDetail, handleClose, getuser } = props

    const [emergency, setEmergncy] = useState({
        name: "",
        email: "",
        address: "",
        phone: "",
        relationship: ""
    })
    const [nameError, setNameError] = useState("")
    const [emailError, setemailError] = useState("")
    const [addressError, setaddressError] = useState("")
    const [phoneError, setphoneError] = useState("")
    const [relationshipError, setrelationshipError] = useState("")
    const [isLoading, setisLoading] = useState(false);
    const [error, seterror] = useState([]);

    let { pathname } = useLocation();

    useEffect(() => {
        userDetail.emergency_contact.length > 0 &&
            setEmergncy(userDetail.emergency_contact[0])
    }, [userDetail])

    // # onchnage function 
    const InputEvent = (e) => {
        let { name, value } = e.target;

        setEmergncy({ ...emergency, [name]: value })
    }

    // # submit button
    const handleSubmit = async (e) => {
        e.preventDefault();
        nameValidation();
        emailValidation();
        phoneVlidation();
        addressValidtion();
        relationshipValidtion();
        seterror([]);

        let { name, email, address, phone, relationship } = emergency;

        if (!name || !email || !address || !phone || !relationship) {
            return false;
        } else if (nameError || emailError || addressError || phoneError || relationshipError) {
            return false;
        } else {
            try {
                setisLoading(true)
                const response = await customAxios().post('/emergency', { relationship: relationship.charAt(0).toUpperCase() + relationship.slice(1), address, phone, email, user_id: userDetail && userDetail._id, name: name.charAt(0).toUpperCase() + name.slice(1) });
                if (response.data.success) {
                    if (pathname.toLocaleLowerCase().includes('/profile')) {
                        getuser();
                        handleClose();
                    } else {
                        getEmployeeDetail();
                    }
                    toast.success(response.data.message)

                }
            } catch (error) {
                if (!error.response) {
                    toast.error(error.message)
                } else {
                    if (error.response.data.message) {
                        toast.error(error.response.data.message)
                    } else {
                        seterror(error.response.data.error);
                    }
                }
            } finally { setisLoading(false) }
        }
    }


    // # validation for name 
    const nameValidation = () => {
        if (!emergency.name) {
            setNameError("Name is a required field.");
        } else if (!alphSpaceFormat.test(emergency.name) || emergency.name.trim().length === 0) {
            setNameError("Name must be an alphabet and space only.");
        } else {
            setNameError("");
        }
    }

    // # validation for email
    const emailValidation = () => {
        if (!emergency.email) {
            setemailError("Email is a required field.");
        } else if (!emailFormat.test(emergency.email)) {
            setemailError("Email must be a valid email.");
        } else {
            setemailError("")
        }
    }

    // # validation phone number
    const phoneVlidation = () => {
        if (!emergency.phone) {
            setphoneError("Mobile number is a required field.");
        } else if (!numberFormat.test(emergency.phone.toString())) {
            setphoneError("Mobile number must be a number");
        } else if(emergency.phone.length !== 10){
            setphoneError("Your mobile number must be 10 characters.")
        }else {
            setphoneError("")
        }
    }

    // # validation for address
    const relationshipValidtion = () => {
        if (!emergency.relationship.trim()) {
            setrelationshipError("Relationship is a required field.");
        } else if (!alphSpaceFormat.test(emergency.relationship)) {
            setrelationshipError("Relationship must be alphabetic.");
        } else {
            setrelationshipError("")
        }
    }
    // # validation for address
    const addressValidtion = () => {
        if (!emergency.address) {
            setaddressError("Address is a required field.");
        } else if (!emergency.address.trim()) {
            setaddressError("Please enter a valid address.");
        } else {
            setaddressError("")
        }
    }

    const history = useNavigate();
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
            <form className="forms-sample mt-2">
                <div className='row'>
                    <div className='col-md-4 pl-md-2 pr-md-2'>
                        <div className="form-group">
                            <label htmlFor="2" className='mt-3'>Name</label>
                            <input type="text" className="form-control text-capitalize" id="2" placeholder="Enter name" name='name' onChange={InputEvent} value={emergency.name} autoComplete='off' onBlur={nameValidation} />
                            {nameError && <small id="emailHelp" className="form-text error">{nameError}</small>}
                        </div>
                    </div>
                    <div className='col-md-4 pl-md-2 pr-md-2'>
                        <div className="form-group">
                            <label htmlFor="2" className='mt-3'>Email</label>
                            <input type="text" className="form-control" id="2" placeholder="Enter email address" name='email' onChange={InputEvent} value={emergency.email} autoComplete='off' onBlur={emailValidation} />
                            {emailError && <small id="emailHelp" className="form-text error">{emailError}</small>}
                        </div>
                    </div>
                    <div className='col-md-4 pl-md-2 pr-md-2'>
                        <div className="form-group">
                            <label htmlFor="2" className='mt-3'>Mobile Number</label>
                            <input type="text" className="form-control" id="2" inputMode='numeric' maxLength={10} placeholder="Enter mobile number" name='phone' onChange={InputEvent} value={emergency.phone} autoComplete='off'  onBlur={phoneVlidation}/>
                            {phoneError && <small id="emailHelp" className="form-text error">{phoneError}</small>}
                        </div>
                    </div>
                    <div className='col-md-4 pl-md-2 pr-md-2'>
                        <div className="form-group">
                            <label htmlFor="2" className='mt-3'>Relationship</label>
                            <input type="text" className="form-control  text-capitalize" id="2" placeholder="Enter relationship" name='relationship' onChange={InputEvent} value={emergency.relationship} autoComplete='off' onBlur={relationshipValidtion}  />
                            {relationshipError && <small id="emailHelp" className="form-text error">{relationshipError}</small>}
                        </div>
                    </div>
                    <div className='col-md-8 pl-md-2 pr-md-2'>
                        <div className="form-group">
                            <label htmlFor="ADDREESS" className='mt-3'>Address</label>
                            <input type="text" className="form-control" id="ADDRESS" placeholder="Enter address" name='address' onChange={InputEvent} value={emergency.address} autoComplete='off' onBlur={addressValidtion} />
                            {addressError && <small id="emailHelp" className="form-text error">{addressError}</small>}
                        </div>
                    </div>
                </div>
                {error.length !== 0 &&
                    <div className="row">
                        <div className="col-12 pl-md-2 pr-md-2">
                            <ErrorComponent errors={error} />
                        </div>
                    </div>
                }
                <div className="row">
                    <div className="col-12 submit-section d-flex justify-content-between py-3 pl-md-2 pr-md-2">
                        <button className="btn btn-gradient-primary" type='submit' onClick={handleSubmit}>Save</button>
                        <button className="btn btn-light" onClick={BackBtn}>{pathname.toLocaleLowerCase().includes('/employees') ? "Back" : "Cancel"}</button>
                    </div>
                </div>
            </form>
            {isLoading && <Spinner />}
        </>
    )
}


EmergencyForm.propsTypes = {
    getEmployeeDetail: PropTypes.func,
    userDetail: PropTypes.object
}

export default EmergencyForm
