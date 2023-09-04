import axios from 'axios'
import React from 'react'
import { useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { useEffect } from 'react';
import Spinner from '../../../common/Spinner';
import { useLocation, useNavigate } from 'react-router-dom';
import GlobalPageRedirect from '../../../auth_context/GlobalPageRedirect';
import { GetLocalStorage } from '../../../../service/StoreLocalStorage';

const EmergencyForm = (props) => {
    let { userDetail, getEmployeeDetail,handleClose ,getuser} = props

    const [emergency, setEmergncy] = useState({
        name: "",
        email: "",
        address: "",
        phone: "",
        Relationship:""
    })
    const [nameError, setNameError] = useState("")
    const [emailError, setemailError] = useState("")
    const [addressError, setaddressError] = useState("")
    const [phoneError, setphoneError] = useState("")
    const [RelationshipError, setRelationshipError] = useState("")
    const [loader, setLoader] = useState(false);
    const [error, seterror] = useState([]);

    let {pathname} = useLocation();

    useEffect(() => {
        let {e_name,e_address,e_mobile_no,e_email,e_relationship} = userDetail;
        if(e_name){
             setEmergncy({
                name:e_name,
                email:e_email,
                address:e_address,
                phone:e_mobile_no,
                Relationship:e_relationship
             })
        }
    },[userDetail])

    let {getCommonApi} = GlobalPageRedirect();

    // # onchnage function 
    const InputEvent = (e) => {
        let { name, value } = e.target;

        setEmergncy({ ...emergency, [name]: value })
    }

    // # submit button
    const handleSubmit = async(e) => {
        e.preventDefault();
        nameValidation();
        emailValidation();
        phoneVlidation();
        addressValidtion();
        RelationshipValidtion();
        seterror([]);

        let { name, email, address, phone,Relationship } = emergency;

        if (!name || !email || !address || !phone || !Relationship) {
            return false;
        } else if (nameError || emailError || addressError || phoneError || RelationshipError) {
            return false;
        } else {
            try {
                setLoader(true)
                const response = await axios.post(`${process.env.REACT_APP_API_KEY}/userProfile/emergrncyContact`, {relationship: Relationship.charAt(0).toUpperCase() + Relationship.slice(1),address,mobile_no: phone,email ,user_id: userDetail && userDetail.id, name: name.charAt(0).toUpperCase() + name.slice(1) }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${GetLocalStorage('token')}`
                    }
                });
                if (response.data.success) {
                    setLoader(false);
                    if (pathname.toLocaleLowerCase().includes('/profile')) {
                        getuser();
                        handleClose();
                    }else{
                        getEmployeeDetail();
                    }
                    if(userDetail.e_name){
                        toast.success("Saved successfully")
                    }else{
                        toast.success("Added successfully")
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
                }else if (error.response.data.message) {
                    toast.error(error.response.data.message)
                } else {
                    if (typeof error.response.data.error === "string") {
                        toast.error(error.response.data.error)
                    } else {
                        seterror(error.response.data.error);
                    }
                }
            }
        }
    }


    // # validation for name 
    const nameValidation = () => {
        if (!emergency.name) {
            setNameError("Please enter name.");
        } else if (!emergency.name.match(/^[A-Za-z ]+$/) || emergency.name.trim().length === 0) {
            setNameError("Please enter valid name.");
        } else {
            setNameError("");
        }
    }

    // # validation for email
    const emailValidation = () => {
        // eslint-disable-next-line
        var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!emergency.email) {
            setemailError("Please enter email address.");
        } else if (!emergency.email.match(mailformat)) {
            setemailError("Please enter a valid email address");
        } else {
            setemailError("")
        }
    }

    // # validation phone number
    const phoneVlidation = () => {
        if (!emergency.phone) {
            setphoneError("Please enter a mobile number.");
        } else if (emergency.phone.length !== 10 || !emergency.phone.match(/^[0-9]+$/)) {
            setphoneError("Please enter a valid mobile number.");
        } else {
            setphoneError("")
        }
    }

    // # validation for address
    const RelationshipValidtion = () => {
        if (!emergency.Relationship) {
            setRelationshipError("Please enter a relation ship.");
        } else if (!emergency.Relationship.match(/^[A-Za-z]+$/)) {
            setRelationshipError("Please enter a valid relation ship.");
        } else {
            setRelationshipError("")
        }
    }
    // # validation for address
    const addressValidtion = () => {
        if (!emergency.address) {
            setaddressError("Please enter a address.");
        } else if (!emergency.address.trim()) {
            setaddressError("Please enter a valid address.");
        } else {
            setaddressError("")
        }
    }

    let history = useNavigate();
     // back btn
     const BackBtn = (e) => {
        e.preventDefault();
        if(pathname.toLocaleLowerCase().includes('/employees')){
            history("/employees")
        }else{
            handleClose();
        }
    }

    return (
        <>
            <form className="forms-sample mt-2">
                <div className='row'>
                    <div className='col-md-6'>
                        <div className="form-group">
                            <label htmlFor="2" className='mt-3'>Name</label>
                            <input type="text" className="form-control text-capitalize" id="2" placeholder="Enter name" name='name' onChange={InputEvent} value={emergency.name} autoComplete='off' onKeyUp={nameValidation} />
                            {nameError && <small id="emailHelp" className="form-text error">{nameError}</small>}
                        </div>
                    </div>
                    <div className='col-md-6'>
                        <div className="form-group">
                            <label htmlFor="2" className='mt-3'>Email</label>
                            <input type="text" className="form-control" id="2" placeholder="Enter email address" name='email' onChange={InputEvent} value={emergency.email} autoComplete='off' onKeyUp={emailValidation} />
                            {emailError && <small id="emailHelp" className="form-text error">{emailError}</small>}
                        </div>
                    </div>
                </div>
                <div className='row'>
                    <div className='col-md-6'>
                        <div className="form-group">
                            <label htmlFor="2" className='mt-3'>Mobile Number</label>
                            <input type="text" className="form-control" id="2" maxLength={10} placeholder="Enter mobile number" name='phone' onChange={InputEvent} value={emergency.phone} autoComplete='off' onKeyUp={phoneVlidation} />
                            {phoneError && <small id="emailHelp" className="form-text error">{phoneError}</small>}
                        </div>
                    </div>
                    <div className='col-md-6'>
                        <div className="form-group">
                            <label htmlFor="2" className='mt-3'>Relationship</label>
                            <input type="text" className="form-control  text-capitalize" id="2" placeholder="Enter Relationship" name='Relationship' onChange={InputEvent} value={emergency.Relationship} autoComplete='off' onKeyUp={RelationshipValidtion} />
                            {RelationshipError && <small id="emailHelp" className="form-text error">{RelationshipError}</small>}
                        </div>
                    </div>
                    <div className='col-md-12'>
                        <div className="form-group">
                            <label htmlFor="ADDREESS" className='mt-3'>Address</label>
                            <input type="text" className="form-control" id="ADDRESS" placeholder="Enter address" name='address' onChange={InputEvent} value={emergency.address} autoComplete='off' onKeyUp={addressValidtion} />
                            {addressError && <small id="emailHelp" className="form-text error">{addressError}</small>}
                        </div>
                    </div>
                </div>
                <ol>
                    {error.map((val) => {
                        return <li className='error' key={val}>{val}</li>
                    })}
                </ol>
                <div className="submit-section d-flex justify-content-between py-3">
                    <button className="btn btn-light" onClick={BackBtn}>{pathname.toLocaleLowerCase().includes('/employees') ?"Back" :"Cancel"}</button>
                    <button className="btn btn-gradient-primary"    onClick={handleSubmit}>Save</button>
                </div>
            </form>
            {loader && <Spinner/>}
        </>
    )
}


EmergencyForm.propsTypes = {
    getEmployeeDetail : PropTypes.func,
    userDetail: PropTypes.object
}

export default EmergencyForm
