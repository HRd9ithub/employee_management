import React, { useEffect, useLayoutEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { country } from "../../../../static/County.js";
import { toast } from "react-hot-toast";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { useContext } from "react";
import { AppProvider } from "../../../context/RouteContext.js";
import { useRef } from 'react';
import Spinner from "../../../common/Spinner.js";
import {  useMatch, useNavigate } from "react-router-dom";
import GlobalPageRedirect from "../../../auth_context/GlobalPageRedirect.js";
import { GetLocalStorage } from "../../../../service/StoreLocalStorage.js";
import moment from "moment";
import { customAxios } from "../../../../service/CreateApi.js";

function PersonalDetailForm({ userDetail, getEmployeeDetail, handleClose, getuser, value }) {

    const [employee, setEmployee] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        address: "",
        country: "",
        state: "",
        city: "",
        postcode: "",
        age: 0,
        gender: "",
        blood_group: "",
        date_of_birth: "",
        joining_date: "",
        role_id: "",
        designation_id: "",
        status: "Active",
        leaveing_date: "",
        maried_status: "",
        report_by: ""
    });
    const [userRole, setUserRole] = useState([]);
    const [Designations, setDesignations] = useState([]);

    const [isLoading, setisLoading] = useState(false);
    const [reportToerror, setreporttoError] = useState('');

    const [firstNameError, setfirstNameError] = useState('');
    const [lastNameError, setlastNameError] = useState('');
    const [emailError, setemailError] = useState('');
    const [phoneError, setphoneError] = useState('');
    // const [departmentError, setdepartmentError] = useState('');
    const [designationError, setdesignationError] = useState('');
    const [roleError, setroleError] = useState('');
    const [joningDateError, setjoningDateError] = useState('');
    const [addressError, setaddressError] = useState('');
    const [cityError, setcityError] = useState('');
    const [stateError, setstateError] = useState('');
    const [postcodeError, setpostcodeError] = useState('');
    const [dateofbirthError, setdateofbirthError] = useState('');
    const [genderError, setgenderError] = useState('');
    const [bloodgroupError, setbloodgroupError] = useState('');
    const [error, setError] = useState([]);
    const [countryError, setcountryError] = useState("");
    const [marritialError, setmeritialerror] = useState("");


    let { getUserData ,get_username,loading,userName} = useContext(AppProvider);

    let { getCommonApi } = GlobalPageRedirect();

    let history = useNavigate();
    // get path name
    const match = useMatch("/employees/edit/" + userDetail._id)

    const birthDateRef = useRef(null);
    const joinDateRef = useRef(null);
    const leaveDateRef = useRef(null);

    // get department,designation,user role
    useLayoutEffect(() => {
        const get_role = async () => {
            setisLoading(true)
            try {
                const res = await customAxios().get('/role');
                if (res.data.success) {
                    setUserRole(res.data.data);
                }
            } catch (error) {
                if (!error.response) {
                    toast.error(error.message)
                } else if (error.response.status === 401) {
                    getCommonApi();
                } else {
                    if (error.response.data.message) {
                        toast.error(error.response.data.message)
                    }
                }
            } finally { setisLoading(false) }
        };
        const get_Designations = async () => {
            setisLoading(true)
            try {
                const res = await customAxios().get('/designation');

                if (res.data.success) {
                    setDesignations(res.data.data);
                }
            } catch (error) {
                if (!error.response) {
                    toast.error(error.message)
                } else if (error.response.status === 401) {
                    getCommonApi();
                } else {
                    if (error.response.data.message) {
                        toast.error(error.response.data.message)
                    }
                }
            } finally { setisLoading(false) }
        };
     
        if (!value) {
            get_username();
            get_role();
            get_Designations();
        }
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        if (userDetail) {
            let dataFilter = Object.fromEntries(Object.entries(userDetail).filter(([_, v]) => v != null))
            setEmployee(dataFilter);
        }
    }, [userDetail])

    // onchange function
    const InputEvent = (event) => {
        let { name, value } = event.target;

        setEmployee({ ...employee, [name]: value });
    };

    // validate and onchange date of birth
    const handleagechange = (date) => {
        var today = new Date();
        var birthDate = new Date(date);
        var age_now = today.getFullYear() - birthDate.getFullYear();
        setEmployee({ ...employee, age: age_now, date_of_birth: date });
    };


    // validate in button click
    // eslint-disable-next-line
    // var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    var mailformat = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    const handleSubmit = async (e) => {
        e.preventDefault();
        let { first_name, last_name, email, phone, leaveing_date, report_by, joining_date, _id, age, maried_status, employee_id, role_id, designation_id, status, address, state, city, postcode, gender, blood_group, date_of_birth, country } = employee;
        firstNameValidation();
        lastNameValidation();
        if (!emailError) {
            emailValidation();
        }
        phoneValidation();
        // departmentValidation();
        designationValidation();
        roleValidation();
        handleJoinDatevalidation();
        reportValidation()

        if (value !== "Personal") {
            cityValidate();
            addressValidation();
            postcodeValidation();
            genderValidation();
        }
        if (value !== "Profile") {
            stateValidation();
            handleDateOfBorthValidation();
            bloodgroupValidation();
            countryValidation();
            marritalvalidation();
        }
        setError([]);

        if (value !== "Profile") {
            if (!country || !maried_status || !state || !blood_group || !date_of_birth) {
                return false
            }
            if (countryError || marritialError || stateError || bloodgroupError || dateofbirthError) {
                return false
            }
        }

        if (value !== "Personal") {
            if (!address || !city || !postcode || !gender || !first_name || !last_name || !email || !phone) {
                return false
            }
            if (addressError || cityError || postcodeError || genderError || firstNameError || lastNameError || emailError || phoneError) {
                return false
            }
        }

        if (value !== "Profile" && value !== "Personal") {
            if (!first_name || !last_name || !email || !phone || !joining_date || !role_id || !designation_id || !report_by) {
                return false
            }
            if (firstNameError || lastNameError || emailError || phoneError || joningDateError || reportToerror || roleError || designationError) {
                return false;
            }
        }

        setisLoading(true)
        try {
            const response = await customAxios().put(`/user/${_id}`, {
                first_name: first_name.charAt(0).toUpperCase() + first_name.slice(1),
                last_name: last_name.charAt(0).toUpperCase() + last_name.slice(1),
                email,
                phone: phone,
                employee_id,
                address,
                country,
                maried_status,
                state,
                city,
                postcode,
                age,
                gender,
                blood_group,
                date_of_birth,
                joining_date: joining_date,
                role_id,
                designation_id,
                status,
                leaveing_date,
                report_by
            });
            if (response.data.success) {
                if (userDetail._id === GetLocalStorage('user_id') && (match || value === "Profile")) {
                    getUserData()
                }
                if (match) {
                    getEmployeeDetail()
                    toast.success("Data updated Successfully");
                } else {
                    toast.success("Profile details updated successfully.");
                    handleClose()
                    getuser()
                }
                setisLoading(false)
            }
        } catch (error) {
            setisLoading(false)
            if (!error.response) {
                toast.error(error.message);
            } else if (error.response.status === 401) {
                getCommonApi();
            } else {
                if (error.response.data.message) {
                    toast.error(error.response.data.message)
                } else {
                    if (typeof error.response.data.error === "object") {
                        setError(error.response.data.error)
                    }
                }
            }
        }
    };


    // first name validation 
    const firstNameValidation = () => {
        if (!employee.first_name) {
            setfirstNameError("First Name is a required field.");
        } else if (!employee.first_name.match(/^[A-Za-z]+$/)) {
            setfirstNameError("First Name must be alphabetic.");
        } else {
            setfirstNameError("");
        }
    }
    // last name validation 
    const lastNameValidation = () => {
        if (!employee.last_name) {
            setlastNameError("Last Name is a required field.");
        } else if (!employee.last_name.match(/^[A-Za-z]+$/)) {
            setlastNameError("Last Name must be alphabetic.");
        } else {
            setlastNameError("");
        }
    }
    // email validation 
    const emailValidation = () => {
        if (!employee.email) {
            setemailError("Email is a required field.");
        } else if (!employee.email.match(mailformat)) {
            setemailError("Email must be a valid email.");
        } else {
            setemailError("");
        }
    }

    // email check in database
    const checkEmail = async () => {
        if (!employee.email) {
            setemailError("Email is a required field.");
        } else if (!employee.email.match(mailformat)) {
            setemailError("Email must be a valid email.");
        } else {
            if (userDetail.email === employee.email) {
                setemailError("")
            } else {
                setisLoading(true)
                customAxios().post('/user/email', { email: employee.email }).then((response) => {
                    if (response.data.success) {
                        setemailError("")
                    }
                }).catch((error) => {
                    if (!error.response) {
                        toast.error(error.message);
                    } else if (error.response.status === 401) {
                        getCommonApi();
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
        if (!employee.phone) {
            setphoneError("Mobile number is a required field.");
        } else if (!employee.phone.toString().match(/^[0-9]+$/)) {
            setphoneError("Mobile number must be a number");
        } else if (employee.phone.toString().length !== 10) {
            setphoneError("Your mobile number must be 10 characters.");
        } else {
            setphoneError("");
        }
    }

    // DESIGNATION validation
    const designationValidation = () => {
        if (Designations.length !== 0) {
            if (!employee.designation_id || employee.designation_id === "designation") {
                setdesignationError("Designation is a required field.");
            } else {
                setdesignationError("")
            }
        }
    }

    // report to validation
    const reportValidation = () => {
        if (!employee.report_by || employee.report_by === "report") {
            setreporttoError("Report to is a required field.");
        } else {
            setreporttoError("")
        }
    }

    // role validation
    const roleValidation = () => {
        if (!employee.role_id || employee.role_id === "role") {
            setroleError("User role is a required field.");
        } else {
            setroleError("")
        }
    }
    // country validation
    const countryValidation = () => {
        if (!employee.country || employee.country === "country") {
            setcountryError("Country is a required field.");
        } else {
            setcountryError("")
        }
    }

    // joinig date validation
    const handleJoinDatevalidation = () => {
        if (!employee.joining_date) {
            setjoningDateError("Joining date is a required field.");
        } else {
            setjoningDateError("");
        }
    }

    // address validation
    const addressValidation = () => {
        if (!employee.address) {
            setaddressError("Address is a required field.")
        } else if (!employee.address.trim()) {
            setaddressError("Please enter a valid address.")
        } else {
            setaddressError("");
        }
    }


    // city validation
    const cityValidate = () => {
        if (!employee.city) {
            setcityError("City is a required field.");
        } else if (!employee.city.match(/^[A-Za-z]+$/)) {
            setcityError("City must be alphabetic.");
        } else { setcityError("") }
    }

    // state validation
    const stateValidation = () => {
        if (!employee.state) {
            setstateError("State is a required field.");
        } else if (!employee.state.match(/^[A-Za-z]+$/)) {
            setstateError("State must be alphabetic.");
        } else {
            setstateError("");
        }
    }

    // postcode validation
    const postcodeValidation = () => {
        if (!employee.postcode) {
            setpostcodeError("Postcode is a required field.");
        } else if (!employee.postcode.toString().match(/^[0-9]+$/)) {
            setpostcodeError("Postcode must be a number.");
        } else if (employee.postcode.toString().length !== 6) {
            setpostcodeError("Your postcode must be 6 characters.");
        } else {
            setpostcodeError("");
        }
    }

    // dateof birth validation
    const handleDateOfBorthValidation = () => {
        if (!employee.date_of_birth) {
            setdateofbirthError("Date of birth is a required field.");
        } else if (employee.age < 18) {
            setdateofbirthError("Please select a valid date of birth.");
        }
        else {
            setdateofbirthError("");
        }
    };

    // gender validation 
    const genderValidation = () => {
        if (!employee.gender || employee.gender === "Select Gender") {
            setgenderError("Gender is a required field.");
        } else {
            setgenderError("");
        }
    }
    // MARRITAL validation 
    const marritalvalidation = () => {
        if (!employee.maried_status || employee.maried_status === "0") {
            setmeritialerror("Maritial status is a required field.");
        } else {
            setmeritialerror("");
        }
    }

    // blood group validation
    const bloodgroupValidation = () => {
        if (!employee.blood_group) {
            setbloodgroupError("Blood group is a required field.")
        } else if (!employee.blood_group.match(/^(A|B|AB|O)[-+]$/)) {
            setbloodgroupError("Please enter a valid blood group.")
        } else {
            setbloodgroupError("");
        }
    }

    // back btn
    const BackBtn = (e) => {
        e.preventDefault();
        if (match) {
            history("/employees")
        } else {
            handleClose();
        }
    }

    return (
        <>
            <form className="forms-sample">
                {(match || value === "Profile") &&
                    <div className="employee-id shadow rounded mb-4">
                        <h5 >Employee Id : -  {employee.employee_id}</h5>
                    </div>}


                <div className="row">
                    {(match || value === "Profile") && <>
                        <div className="col-md-4 col-xl-3">
                            <div className="form-group">
                                <label htmlFor="exampleInputfname">First Name</label>
                                <input type="text" className="form-control text-capitalize" id="exampleInputfname" placeholder="Enter First name" name="first_name" value={employee.first_name || ""} onChange={InputEvent} onBlur={firstNameValidation} />
                                {firstNameError && <small id="emailHelp" className="form-text error">{firstNameError}</small>}
                            </div>
                        </div>
                        <div className="col-md-4 col-xl-3">
                            <div className="form-group">
                                <label htmlFor="exampleInputlname">Last Name</label>
                                <input type="text" className="form-control text-capitalize" id="exampleInputlname" placeholder="Enter last name" name="last_name" value={employee.last_name || ""} onChange={InputEvent} onBlur={lastNameValidation} />
                                {lastNameError && <small id="emailHelp" className="form-text error">{lastNameError}</small>}
                            </div>
                        </div>
                        <div className="col-md-4 col-xl-3">
                            <div className="form-group">
                                <label htmlFor="exampleInputEmail1">Email Address</label>
                                <input type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter email" name="email" value={employee.email || ""} onChange={InputEvent} onBlur={checkEmail} />
                                {emailError && <small id="emailHelp" className="form-text error">{emailError}</small>}
                            </div>
                        </div>
                        <div className="col-md-4 col-xl-3">
                            <div className="form-group">
                                <label htmlFor="exampleInputphone">Mobile No.</label>
                                <input type="tel" className="form-control" id="exampleInputphone" maxLength="10" minLength="10" placeholder="Enter mobile number" name="phone" value={employee.phone || ""} onChange={InputEvent} onBlur={phoneValidation} inputMode="numeric" />
                                {phoneError && <small id="emailHelp" className="form-text error">{phoneError}</small>}
                            </div>
                        </div>
                        <div className="col-md-4 col-xl-3">
                            <div className="form-group">
                                <label htmlFor="exampleInputAddress">Address</label>
                                <input type="text" className="form-control" id="exampleInputAddress" placeholder="Enter address" name="address" value={employee.address || ""} onChange={InputEvent} onBlur={addressValidation} />
                                {addressError && <small id="emailHelp" className="form-text error">{addressError}</small>}
                            </div>
                        </div>
                    </>}
                    {(match || value === "Personal") && <>
                        <div className="col-md-4 col-xl-3">
                            <div className="form-group">
                                <label htmlFor="exampleInputcity">Country</label>
                                <select className="form-control" name="country" value={employee.country} onChange={InputEvent} onBlur={countryValidation}>
                                    <option value="country">Select country</option>
                                    {country.map((elem, ind) => {
                                        return (
                                            <option key={ind} value={elem}>
                                                {elem}
                                            </option>
                                        );
                                    })}
                                </select>
                                {countryError && <small id="emailHelp" className="form-text error">{countryError}</small>}
                            </div>
                        </div>
                        <div className="col-md-4 col-xl-3">
                            <div className="form-group">
                                <label htmlFor="exampleInputState">State</label>
                                <input type="text" className="form-control" id="exampleInputState" placeholder="Enter state" name="state" value={employee.state || ""} onChange={InputEvent} onBlur={stateValidation} />
                                {stateError && <small id="emailHelp" className="form-text error">{stateError}</small>}
                            </div>
                        </div>
                    </>}
                    {(match || value === "Profile") && <>
                        <div className="col-md-4 col-xl-3">
                            <div className="form-group">
                                <label htmlFor="exampleInputcity">City</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="exampleInputcity"
                                    placeholder="Enter city"
                                    name="city"
                                    value={employee.city || ""}
                                    onChange={InputEvent}
                                    onBlur={cityValidate}
                                />
                                {cityError && <small id="emailHelp" className="form-text error">{cityError}</small>}
                            </div>
                        </div>
                        <div className="col-md-4 col-xl-3">
                            <div className="form-group">
                                <label htmlFor="exampleInputPostcode">Postcode</label>
                                <input type="text" className="form-control" id="exampleInputPostcodee" placeholder="Enter Postcode" name="postcode" value={employee.postcode || ""} maxLength={6} onChange={InputEvent} onBlur={postcodeValidation} />
                                {postcodeError && <small id="emailHelp" className="form-text error">{postcodeError}</small>}
                            </div>
                        </div>
                    </>}
                    {(match || value === "Personal") &&
                        <div className="col-md-4 col-xl-3">
                            <div className="form-group position-relative">
                                <label htmlFor="exampleInputDate">Date Of Birth</label>
                                <div onClick={() => { birthDateRef.current.showPicker(); }}>
                                    <input type="date"
                                        className="form-control"
                                        value={employee.date_of_birth ? moment(employee.date_of_birth).format("YYYY-MM-DD") : ""}
                                        ref={birthDateRef}
                                        onChange={(e) => { handleagechange(e.target.value); }}
                                        autoComplete='off'
                                        onBlur={handleDateOfBorthValidation}
                                        max={moment(new Date()).format("YYYY-MM-DD")}
                                    />
                                    <CalendarMonthIcon className='calendar-icon' />
                                </div>
                                {dateofbirthError && <small id="emailHelp" className="form-text error">{dateofbirthError}</small>}
                            </div>
                        </div>}
                    {match &&
                        <div className="col-md-4 col-xl-3">
                            <div className="form-group position-relative">
                                <label htmlFor="exampleInputJoining">Joining Date</label>
                                <div onClick={() => { joinDateRef.current.showPicker(); }}>
                                    <input type="date"
                                        className="form-control"
                                        value={employee.joining_date ? moment(employee.joining_date).format("YYYY-MM-DD") : ""}
                                        ref={joinDateRef}
                                        onChange={(e) => { setEmployee({ ...employee, joining_date: e.target.value }) }}
                                        autoComplete='off'
                                        onBlur={handleJoinDatevalidation}
                                    />
                                    <CalendarMonthIcon className='calendar-icon' />
                                </div>
                                {joningDateError && <small id="emailHelp" className="form-text error">{joningDateError}</small>}
                            </div>
                        </div>}
                    {(match || value === "Profile") && <>
                        <div className="col-md-4 col-xl-3">
                            <div className="form-group">
                                <label htmlFor="exampleInputgender">Gender</label>
                                <select className="form-control" id="exampleInputgender" name="gender" value={employee.gender || ""} onChange={InputEvent} onBlur={genderValidation}>
                                    <option value="Select Gender">Select Gender</option>
                                    <option value="Male"> Male</option>
                                    <option value="Female">Female</option>
                                </select>
                                {genderError && <small id="emailHelp" className="form-text error">{genderError}</small>}
                            </div>
                        </div>
                    </>}
                    {(match || value === "Personal") && <>
                        <div className="col-md-4 col-xl-3">
                            <div className="form-group">
                                <label htmlFor="exampleInputAge">Age</label>
                                <input type="number" className="form-control" id="exampleInputAge" placeholder="Enter Age" name="age" value={employee.age || "0"} disabled />
                            </div>
                        </div>
                        <div className="col-md-4 col-xl-3">
                            <div className="form-group">
                                <label htmlFor="exampleInputBlood">Blood Group</label>
                                <input type="text" className="form-control" id="exampleInputBlood" placeholder="Enter Blood Group" name="blood_group" value={employee.blood_group || ""} onChange={InputEvent} onBlur={bloodgroupValidation} />
                                {bloodgroupError && <small id="emailHelp" className="form-text error">{bloodgroupError}</small>}
                            </div>
                        </div>
                    </>}
                    {(match || value === "Personal") &&
                        <div className="col-md-4 col-xl-3">
                            <div className="form-group">
                                <label htmlFor="exampleInputMARIIT">Marital Status</label>
                                <select className="form-control" id="exampleInputMARIIT" name="maried_status" value={employee.maried_status || ""} onChange={InputEvent} onBlur={marritalvalidation}>
                                    <option value="0">Select Marital Status</option>
                                    <option value="Married">Married</option>
                                    <option value="Unmarried">Unmarried</option>
                                </select>
                                {marritialError && <small id="emailHelp" className="form-text error">{marritialError}</small>}
                            </div>
                        </div>}
                    {match && <>
                        <div className="col-md-4 col-xl-3">
                            <Form.Group>
                                <label htmlFor="exampleFormControldesignation">Designation</label>
                                <select className="form-control" id="exampleFormControldesignation" name="designation_id" value={employee.designation_id} onChange={InputEvent} onBlur={designationValidation} >
                                    <option value="designation">Select Designation </option>
                                    {Designations.map((val) => {
                                        return (
                                            <option key={val._id} value={val._id}>
                                                {val.name}
                                            </option>
                                        );
                                    })}
                                </select>
                                {designationError && <small id="emailHelp" className="form-text error">{designationError}</small>}
                            </Form.Group>
                        </div>
                        <div className="col-md-4 col-xl-3">
                            <Form.Group>
                                <label htmlFor="exampleFormControlUser">User Role</label>
                                {/* eslint-disable-next-line eqeqeq */}
                                <select className="form-control" id="exampleFormControlUser" disabled={userDetail.id == GetLocalStorage("user_id")} name="role_id" value={employee.role_id} onChange={InputEvent} onBlur={roleValidation}>
                                    <option value="role">Select user role</option>
                                    {userRole.map((val) => {
                                        return (
                                            val.name.toLowerCase() !== "admin" &&
                                            <option key={val._id} value={val._id}>{val.name}</option>
                                        );
                                    })}
                                </select>
                                {roleError && <small id="emailHelp" className="form-text error">{roleError}</small>}
                            </Form.Group>
                        </div>
                        <div className="col-md-4 col-xl-3">
                            <Form.Group>
                                <label htmlFor="exampleFormControlStatus">Status</label>
                                {/* eslint-disable-next-line eqeqeq */}
                                <select className="form-control" id="exampleFormControlStatus" name="status" onChange={InputEvent} disabled={userDetail.id == GetLocalStorage("user_id")}>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </Form.Group>
                        </div>
                        <div className="col-md-4 col-xl-3">
                            <Form.Group>
                                <label htmlFor="reportby">Report To</label>
                                <select className="form-control" id="reportby" name="report_by" value={employee.report_by === null ? "" : employee.report_by} onChange={InputEvent} onBlur={reportValidation}>
                                    <option value="report">Select Report To</option>
                                    {userName.map((val) => {
                                        return (
                                            val._id !== employee._id && <option key={val._id} value={val._id}>{val.first_name?.concat(" ", val.last_name)}</option>
                                        );
                                    })}
                                </select>
                                {reportToerror && <small id="emailHelp" className="form-text error">{reportToerror}</small>}
                            </Form.Group>
                        </div>
                        <div className="col-md-4 col-xl-3">
                            <div className="form-group position-relative">
                                <label htmlFor="exampleInputJoining">
                                    Leaving Date
                                </label>
                                <div onClick={() => leaveDateRef.current.showPicker()}>
                                    <input type="date"
                                        className="form-control"
                                        value={employee.leaveing_date ? moment(employee.leaveing_date).format("YYYY-MM-DD") : ""}
                                        ref={leaveDateRef}
                                        onChange={(e) => {
                                            setEmployee({ ...employee, leaveing_date: e.target.value })
                                        }}
                                        autoComplete='off'
                                        min={moment(employee.joining_date).format("YYYY-MM-DD")}
                                    />
                                    <CalendarMonthIcon className='calendar-icon' />
                                </div>
                            </div>
                        </div>
                    </>}
                </div>
                {error.length !== 0 && <ol>
                    {error?.map((val) => {
                        return <li key={val} className="error">{val}</li>
                    })}
                </ol>}
                <div className="submit-section d-flex justify-content-between">
                    <button className="btn btn-gradient-primary" type="submit" onClick={handleSubmit}>Save</button>
                    <button className="btn btn-light" onClick={BackBtn}>Back</button>
                </div>
            </form >
            {(isLoading || loading) && <Spinner />}
        </>
    );
}

export default PersonalDetailForm;
