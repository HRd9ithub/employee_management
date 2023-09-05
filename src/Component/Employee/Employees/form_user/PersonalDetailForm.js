import React, { useEffect, useLayoutEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import { Form } from "react-bootstrap";
import { country } from "../../../../static/County.js";
import { toast } from "react-toastify";
import axios from "axios";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { useContext } from "react";
import { AppProvider } from "../../../context/RouteContext.js";
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css'
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useRef } from 'react';
import Spinner from "../../../common/Spinner.js";
import { defaultImage } from "../../../../static/DefaultImage.js"
import { useLocation, useNavigate } from "react-router-dom";
import GlobalPageRedirect from "../../../auth_context/GlobalPageRedirect.js";
import { MdCancel } from "react-icons/md";
import { GetLocalStorage } from "../../../../service/StoreLocalStorage.js";
import moment from "moment";

function PersonalDetailForm({ userDetail, getEmployeeDetail, handleClose, getuser, value }) {
    const [employee, setEmployee] = useState({
        first_name: "",
        last_name: "",
        email: "",
        mobile_no: "",
        address: "",
        country: "",
        state: "",
        city: "",
        postcode: "",
        age: 0,
        gender: "",
        blood_group: "",
        date_of_birth: "",
        join_date: "",
        role_id: "",
        designation_id: "",
        department_id: "",
        status: "Active",
        profile_image: defaultImage,
        leaveing_date: "",
        maried_status: "",
        reporting_by: ""
    });
    // const hosto
    const [image, setImage] = useState(defaultImage);
    const [userRole, setUserRole] = useState([]);
    const [Department, setDepartment] = useState([]);
    const [Designations, setDesignations] = useState([]);
    // image crop state
    const [crop, setCrop] = useState({
        unit: '%',
        width: 70,
        height: 70
    })
    const [imagesrc, setimagesrc] = useState("")
    const [images, setimages] = useState("")
    const [secondshow, setsecondshow] = useState(false);
    const [loader, setLoader] = useState(false);
    const [allRecords, setallRecords] = useState([]);
    const [reportToerror, setreporttoError] = useState('');

    const [firstNameError, setfirstNameError] = useState('');
    const [lastNameError, setlastNameError] = useState('');
    const [emailError, setemailError] = useState('');
    const [phoneError, setphoneError] = useState('');
    const [departmentError, setdepartmentError] = useState('');
    const [designationError, setdesignationError] = useState('');
    const [roleError, setroleError] = useState('');
    const [joningDateError, setjoningDateError] = useState('');
    const [leaveingdateerror, setleaveingdateError] = useState('');
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


    let { getUserData } = useContext(AppProvider);

    let { pathname } = useLocation();

    let { getCommonApi } = GlobalPageRedirect();

    let history = useNavigate();

    const ref = useRef(null);
    const birthDateRef = useRef(null);
    const joinDateRef = useRef(null);
    const leaveDateRef = useRef(null);

    // get department,designation,user role
    useLayoutEffect(() => {
        const get_role = async () => {
            try {
                let token = GetLocalStorage("token");
                const request = {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                };
                const res = await axios.get(
                    `${process.env.REACT_APP_API_KEY}/role/list`,
                    request
                );
                if (res.data.success) {
                    setUserRole(res.data.data);
                }
            } catch (error) {
                console.log(error, "esjrihewaiu");
                if (error.response.status === 401) {
                    getCommonApi();
                } else {
                    if (error.response.data.message) {
                        toast.error(error.response.data.message)
                    } else {
                        if (typeof error.response.data.error === "string") {
                            toast.error(error.response.data.error)
                        }
                    }
                }
            }
        };
        const get_Department = async () => {
            try {
                let token = GetLocalStorage("token");
                const request = {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                };
                const res = await axios.get(
                    `${process.env.REACT_APP_API_KEY}/department/list`,
                    request
                );

                if (res.data.success) {
                    let temp = res.data.data.filter((elem) => {
                        return elem.status === "Active";
                    });
                    setDepartment(temp);
                }
            } catch (error) {
                console.log(error, "esjrihewaiu");
                if (error.response.status === 401) {
                    getCommonApi();
                } else {
                    if (error.response.data.message) {
                        toast.error(error.response.data.message)
                    } else {
                        if (typeof error.response.data.error === "string") {
                            toast.error(error.response.data.error)
                        }
                    }
                }
            }
        };
        const get_Designations = async () => {
            try {
                let token = GetLocalStorage("token");
                const request = {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                };
                const res = await axios.get(
                    `${process.env.REACT_APP_API_KEY}/designation/list`,
                    request
                );

                if (res.data.success) {
                    setDesignations(res.data.data);
                }
            } catch (error) {
                console.log(error, "esjrihewaiu");
                if (error.response.status === 401) {
                    getCommonApi();
                } else {
                    if (error.response.data.message) {
                        toast.error(error.response.data.message)
                    } else {
                        if (typeof error.response.data.error === "string") {
                            toast.error(error.response.data.error)
                        }
                    }
                }
            }
        };
        // get employee data in backend
        const getAlluser = async () => {
            try {
                setLoader(true);
                let token = GetLocalStorage("token");
                const request = {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                };
                const res = await axios.get(`${process.env.REACT_APP_API_KEY}/user/list`, request);

                if (res.data.success) {
                    setallRecords(res.data.data)
                }
            } catch (error) {
                console.log(error, " <<< ==== error ");
                if (error.response.status === 401) {
                    getCommonApi();
                } else {
                    if (error.response.data.message) {
                        toast.error(error.response.data.message)
                    } else {
                        if (typeof error.response.data.error === "string") {
                            toast.error(error.response.data.error)
                        }
                    }
                }
            } finally {
                setLoader(false);
            }
        };
        if (!value) {
            getAlluser();
            get_role();
            get_Department();
            get_Designations();
        }
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        if (userDetail) {
            if (userDetail.profile_image) {
                setImage(`${process.env.REACT_APP_IMAGE_API}/storage/${userDetail.profile_image}`);
            }
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
        if (age_now === 0 && !date) {
            setdateofbirthError("Please select date of birth.");
        } else if (age_now <= 18) {
            setdateofbirthError("Please select a valid date of birth.");
        } else {
            setdateofbirthError("");
        }
    };


    // validate in button click
    // eslint-disable-next-line
    var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (employee.profile_image) {
            if (employee.profile_image.startsWith("uploads")) {
                delete employee["profile_image"];
                setEmployee({ ...employee });
            }
        }
        let { first_name, last_name, email, mobile_no, leaveing_date, reporting_by, join_date, id, age, maried_status, employee_id, profile_image, role_id, confirmPassword, designation_id, password, department_id, status, address, state, city, postcode, gender, blood_group, date_of_birth, country } = employee;
        firstNameValidation();
        lastNameValidation();
        if (!emailError) {
            emailValidation();
        }
        phoneValidation();
        departmentValidation();
        designationValidation();
        roleValidation();
        handleJoinDatevalidation();
        // reportValidation()

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
            if (!address || !city || !postcode || !gender) {
                return false
            }
            if (addressError || cityError || postcodeError || genderError) {
                return false
            }
        }

        if (value !== "Profile" && value !== "Personal") {
            if (!first_name || !last_name || !email || !mobile_no || !join_date || !role_id || !designation_id || !department_id) {
                return false
            }
            if (firstNameError || lastNameError || emailError || phoneError || joningDateError || reportToerror || roleError || designationError || departmentError) {
                return false;
            }
        }

        setLoader(true)
        try {
            let token = GetLocalStorage("token");
            const request = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                }
            };
            const response = await axios.post(`${process.env.REACT_APP_API_KEY}/user/update`, {
                first_name: first_name.charAt(0).toUpperCase() + first_name.slice(1),
                last_name: last_name.charAt(0).toUpperCase() + last_name.slice(1),
                email,
                id,
                mobile_no,
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
                join_date,
                password,
                role_id,
                designation_id,
                department_id,
                status,
                profile_image,
                confirmPassword,
                leaveing_date,
                reporting_by
            }, request);
            if (response.data.success) {
                if (userDetail.id.toString() === GetLocalStorage('user_id')) {
                    getUserData()
                }
                if (pathname.toLocaleLowerCase().includes('/employees')) {
                    getEmployeeDetail()
                    toast.success("Saved Successfully");
                } else {
                    toast.success("Profile has been updated successfully.");
                    handleClose()
                    getuser()
                }
                setLoader(false)
            } else {
                setLoader(false)
                toast.error("Something went wrong, Please check your details and try again.");
            }
        } catch (error) {
            console.log("error", error);
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
    };


    // first name validation 
    const firstNameValidation = () => {
        if (!employee.first_name) {
            setfirstNameError("Please enter First name.");
        } else if (!employee.first_name.match(/^[A-Za-z]+$/)) {
            setfirstNameError("Please enter only alphabet.");
        } else {
            setfirstNameError("");
        }
    }
    // last name validation 
    const lastNameValidation = () => {
        if (!employee.last_name) {
            setlastNameError("Please enter Last name.");
        } else if (!employee.last_name.match(/^[A-Za-z]+$/)) {
            setlastNameError("Please enter only alphabet.");
        } else {
            setlastNameError("");
        }
    }
    // email validation 
    const emailValidation = () => {
        if (!employee.email) {
            setemailError("Please enter email address.");
        } else if (!employee.email.match(mailformat)) {
            setemailError("Please enter a valid email address");
        } else {
            setemailError("");
        }
    }

    // email check in database
    const checkEmail = async () => {
        if (!emailError && userDetail.email !== employee.email) {
            let token = GetLocalStorage("token");
            setLoader(true)
            axios.post(`${process.env.REACT_APP_API_KEY}/user/checkemail`, { email: employee.email }, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                }
            }).then((response) => {
                if (!response.data.success) {
                    setemailError("Email Address is already exists.");
                    setLoader(false)
                } else {
                    setemailError("")
                    setLoader(false)
                }
            }).catch((error) => {
                setLoader(false)
                console.log('error :>> ', error.response);
                if (error.response.data.message) {
                    toast.error(error.response.data.message);
                } else {
                    setemailError(error.response.data.error[0]);
                }
            })
        }
    }

    // phone validation
    const phoneValidation = () => {
        if (!employee.mobile_no) {
            setphoneError("Please enter a mobile number.");
        } else if (!employee.mobile_no.match(/^[0-9]+$/)) {
            setphoneError("Please enter a valid mobile number.");
        } else if (employee.mobile_no.length !== 10) {
            setphoneError("Please enter a valid mobile number.");
        } else {
            setphoneError("");
        }
    }

    // department validation
    const departmentValidation = () => {
        if (Department.length !== 0) {
            if (!employee.department_id || employee.department_id === "department") {
                setdepartmentError("Please select a department.");
            } else {
                setdepartmentError("")
            }
        }
    }
    // DESIGNATION validation
    const designationValidation = () => {
        if (Designations.length !== 0) {
            if (!employee.designation_id || employee.designation_id === "designation") {
                setdesignationError("Please select a designation.");
            } else {
                setdesignationError("")
            }
        }
    }

    // report to validation
    const reportValidation = () => {
        console.log('first')
        if (!employee.reporting_by || employee.reporting_by === "report") {
            setreporttoError("Please select report to.");
        } else {
            setreporttoError("")
        }
    }

    // role validation
    const roleValidation = () => {
        if (!employee.role_id || employee.role_id === "role") {
            setroleError("Please select user role.");
        } else {
            setroleError("")
        }
    }
    // country validation
    const countryValidation = () => {
        if (!employee.country || employee.country === "country") {
            setcountryError("Please select Country.");
        } else {
            setcountryError("")
        }
    }

    // joinig date validation
    const handleJoinDatevalidation = () => {
        if (!employee.join_date) {
            setjoningDateError("Please select joining date");
        } else {
            setjoningDateError("");
        }
    }
    // leaving  date validation
    const handleleavingdateValidation = () => {
        if (!employee.leaveing_date) {
            setleaveingdateError("Please select leaving date");
        } else {
            setleaveingdateError("");
        }
    }

    // address validation
    const addressValidation = () => {
        if (!employee.address) {
            setaddressError("Please enter address.")
        } else if (!employee.address.trim()) {
            setaddressError("Please enter a valid address.")
        } else {
            setaddressError("");
        }
    }


    // city validation
    const cityValidate = () => {
        if (!employee.city) {
            setcityError("Please enter city name.");
        } else if (!employee.city.match(/^[A-Za-z]+$/)) {
            setcityError("Please enter only alphabet.");
        } else { setcityError("") }
    }

    // state validation
    const stateValidation = () => {
        if (!employee.state) {
            setstateError("Please enter state.");
        } else if (!employee.state.match(/^[A-Za-z]+$/)) {
            setstateError("Please enter only alphabet.");
        } else {
            setstateError("");
        }
    }

    // postcode validation
    const postcodeValidation = () => {
        if (!employee.postcode) {
            setpostcodeError("Please enter postcode.");
        } else if (!employee.postcode.toString().match(/^[0-9]+$/)) {
            setpostcodeError("Please use only numbers.");
        } else if (employee.postcode.toString().length !== 6) {
            setpostcodeError("Your postcode must be 6 characters.");
        } else {
            setpostcodeError("");
        }
    }

    // dateof birth validation
    const handleDateOfBorthValidation = () => {
        if (!employee.date_of_birth) {
            setdateofbirthError("Please select date of birth.");
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
            setgenderError("Please select gender.");
        } else {
            setgenderError("");
        }
    }
    // MARRITAL validation 
    const marritalvalidation = () => {
        if (!employee.maried_status || employee.maried_status === "0") {
            setmeritialerror("Please select maritial status.");
        } else {
            setmeritialerror("");
        }
    }

    // blood group validation
    const bloodgroupValidation = () => {
        if (!employee.blood_group) {
            setbloodgroupError("Please enter blood group.")
        } else if (!employee.blood_group.match(/^(A|B|AB|O)[-+]$/)) {
            setbloodgroupError("Please enter a valid blood group.")
        } else {
            setbloodgroupError("");
        }
    }

    // image onchnage function
    const imageChange = (e) => {
        if (e.target.files.length !== 0) {
            var reader = new FileReader();
            reader.onloadend = function () {
                setsecondshow(true)
                setimagesrc(reader.result.toString());
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    }

    // crop image submit
    const onclick = () => {
        const canvas = ref.current
        const scaleX = images.naturalWidth / images.width;
        const scaleY = images.naturalHeight / images.height;
        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext("2d");

        // New lines to be added
        const pixelRatio = window.devicePixelRatio;
        canvas.width = crop.width * pixelRatio;
        canvas.height = crop.height * pixelRatio;
        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        ctx.imageSmoothingQuality = "high";

        ctx.drawImage(
            images,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width,
            crop.height
        );

        // As Base64 string
        const base64Image = canvas.toDataURL("image/jpeg");
        if (base64Image.includes('image')) {
            setEmployee({ ...employee, profile_image: base64Image })
            setImage(base64Image)
        } else {
            setEmployee({ ...employee, profile_image: imagesrc })
            setImage(imagesrc)
        }
        setsecondshow(false)
    }

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
            <form className="forms-sample">
                {(pathname.toLocaleLowerCase().includes('/employees') || value === "Profile") && <>
                    <div className="employee-id shadow rounded">
                        <h5 >Employee Id : -  {employee.employee_id}</h5>
                    </div>
                    <div className="text-center image-standard">
                        <div className="profile-image">
                            <img src={image && image} alt="" />
                        </div>
                        <label className="profile-edit-icon">
                            <i className="fa-solid fa-pencil"></i>
                            <input type="file" accept="image/png, image/jpg, image/jpeg" className="d-none" onChange={imageChange} />
                        </label>
                    </div>
                </>}


                <div className="row">
                    {(pathname.toLocaleLowerCase().includes('/employees') || value === "Profile") && <>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label htmlFor="exampleInputfname">First Name</label>
                                <input type="text" className="form-control text-capitalize" id="exampleInputfname" placeholder="Enter First name" name="first_name" value={employee.first_name || ""} onChange={InputEvent} onKeyUp={firstNameValidation} />
                                <small id="emailHelp" className="form-text error">{firstNameError}</small>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label htmlFor="exampleInputlname">Last Name</label>
                                <input type="text" className="form-control text-capitalize" id="exampleInputlname" placeholder="Enter last name" name="last_name" value={employee.last_name || ""} onChange={InputEvent} onKeyUp={lastNameValidation} />
                                <small id="emailHelp" className="form-text error">{lastNameError}</small>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label htmlFor="exampleInputEmail1">Email Address</label>
                                <input type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter email" name="email" value={employee.email || ""} onChange={InputEvent} onKeyUp={emailValidation} onBlur={checkEmail} />
                                <small id="emailHelp" className="form-text error">{emailError}</small>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label htmlFor="exampleInputmobile_no">Mobile No.</label>
                                <input type="tel" className="form-control" id="exampleInputmobile_no" maxLength="10" minLength="10" placeholder="Enter mobile number" name="mobile_no" value={employee.mobile_no || ""} onChange={InputEvent} onKeyUp={phoneValidation} />
                                <small id="emailHelp" className="form-text error">{phoneError}</small>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label htmlFor="exampleInputAddress">Address</label>
                                <input type="text" className="form-control" id="exampleInputAddress" placeholder="Enter address" name="address" value={employee.address || ""} onChange={InputEvent} onKeyUp={addressValidation} />
                                <small id="emailHelp" className="form-text error">{addressError}</small>
                            </div>
                        </div>
                    </>}
                    {(pathname.toLocaleLowerCase().includes('/employees') || value === "Personal") && <>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label htmlFor="exampleInputcity">Country</label>
                                <select className="form-control" name="country" value={employee.country} onChange={InputEvent} onClick={countryValidation}>
                                    <option value="country">Select country</option>
                                    {country.map((elem, ind) => {
                                        return (
                                            <option key={ind} value={elem}>
                                                {elem}
                                            </option>
                                        );
                                    })}
                                </select>
                                <small id="emailHelp" className="form-text error">{countryError}</small>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label htmlFor="exampleInputState">State</label>
                                <input type="text" className="form-control" id="exampleInputState" placeholder="Enter state" name="state" value={employee.state || ""} onChange={InputEvent} onKeyUp={stateValidation} />
                                <small id="emailHelp" className="form-text error">{stateError}</small>
                            </div>
                        </div>
                    </>}
                    {(pathname.toLocaleLowerCase().includes('/employees') || value === "Profile") && <>
                        <div className="col-md-6">
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
                                    onKeyUp={cityValidate}
                                />
                                <small id="emailHelp" className="form-text error">
                                    {cityError}
                                </small>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label htmlFor="exampleInputPostcode">Postcode</label>
                                <input type="text" className="form-control" id="exampleInputPostcodee" placeholder="Enter Postcode" name="postcode" value={employee.postcode || ""} maxLength={6} onChange={InputEvent} onKeyUp={postcodeValidation} />
                                <small id="emailHelp" className="form-text error">{postcodeError}</small>
                            </div>
                        </div>
                    </>}
                    {(pathname.toLocaleLowerCase().includes('/employees') || value === "Personal") &&
                        <div className="col-md-6">
                            <div className="form-group position-relative">
                                <label htmlFor="exampleInputDate">Date Of Birth</label>
                                <input type="date"
                                    className="form-control"
                                    value={employee.date_of_birth || ""}
                                    ref={birthDateRef}
                                    onChange={(e) => {
                                        handleagechange(e.target.value);
                                    }}
                                    autoComplete='off'
                                    onClick={() => { birthDateRef.current.showPicker(); handleDateOfBorthValidation(); }}
                                    max={moment(new Date()).format("YYYY-MM-DD")}
                                />
                                <CalendarMonthIcon className='calendar-icon' />
                                <small id="emailHelp" className="form-text error">{dateofbirthError}</small>
                            </div>
                        </div>}
                    {pathname.toLocaleLowerCase().includes('/employees') &&
                        <div className="col-md-6">
                            <div className="form-group position-relative">
                                <label htmlFor="exampleInputJoining">
                                    Joining Date
                                </label>
                                <input type="date"
                                    className="form-control"
                                    value={employee.join_date || ""}
                                    ref={joinDateRef}
                                    onChange={(e) => {
                                        setEmployee({ ...employee, join_date: e.target.value })
                                        if (!e.target.value) {
                                            setjoningDateError("Please select joining date");
                                        } else {
                                            setjoningDateError("");
                                        }
                                    }}
                                    autoComplete='off'
                                    onClick={() => { joinDateRef.current.showPicker(); handleJoinDatevalidation(); }}
                                    max={moment(new Date()).format("YYYY-MM-DD")}
                                />
                                <CalendarMonthIcon className='calendar-icon' />
                                <small id="emailHelp" className="form-text error">{joningDateError}</small>
                            </div>
                        </div>}
                    {(pathname.toLocaleLowerCase().includes('/employees') || value === "Profile") && <>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label htmlFor="exampleInputgender">Gender</label>
                                <select className="form-control" id="exampleInputgender" name="gender" value={employee.gender || ""} onChange={InputEvent} onClick={genderValidation}>
                                    <option value="Select Gender">Select Gender</option>
                                    <option value="Male"> Male</option>
                                    <option value="Female">Female</option>
                                </select>
                                <small id="emailHelp" className="form-text error">{genderError}</small>
                            </div>
                        </div>
                    </>}
                    {(pathname.toLocaleLowerCase().includes('/employees') || value === "Personal") && <>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label htmlFor="exampleInputAge">Age</label>
                                <input type="number" className="form-control" id="exampleInputAge" placeholder="Enter Age" name="age" value={employee.age || "0"} disabled />
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label htmlFor="exampleInputBlood">Blood Group</label>
                                <input type="text" className="form-control" id="exampleInputBlood" placeholder="Enter Blood Group" name="blood_group" value={employee.blood_group || ""} onChange={InputEvent} onKeyUp={bloodgroupValidation} />
                                <small id="emailHelp" className="form-text error">{bloodgroupError}</small>
                            </div>
                        </div>
                    </>}
                    {(pathname.toLocaleLowerCase().includes('/employees') || value === "Personal") &&
                        <div className="col-md-6">
                            <div className="form-group">
                                <label htmlFor="exampleInputMARIIT">Marital Status</label>
                                <select className="form-control" id="exampleInputMARIIT" name="maried_status" value={employee.maried_status || ""} onChange={InputEvent} onClick={marritalvalidation}>
                                    <option value="0">Select Marital Status</option>
                                    <option value="Married">Married</option>
                                    <option value="Unmarried">Unmarried</option>
                                </select>
                                <small id="emailHelp" className="form-text error">{marritialError}</small>
                            </div>
                        </div>}
                    {pathname.toLocaleLowerCase().includes('/employees') && <>
                        <div className="col-md-6">
                            <Form.Group>
                                <label htmlFor="exampleFormControldepartment">Department</label>
                                <select className="form-control" id="exampleFormControldepartment" name="department_id" value={employee.department_id} onChange={InputEvent} onClick={departmentValidation} >
                                    <option value="department">Select Department</option>
                                    {Department.map((val) => {
                                        return (
                                            <option key={val.id} value={val.id}>
                                                {val.name}
                                            </option>
                                        );
                                    })}
                                </select>
                                <small id="emailHelp" className="form-text error">{departmentError}</small>
                                {Department.length === 0 && <small id="emailHelp" className="form-text error">Please insert at least one department.</small>}
                            </Form.Group>
                        </div>
                        <div className="col-md-6">
                            <Form.Group>
                                <label htmlFor="exampleFormControldesignation">Designation</label>
                                <select className="form-control" id="exampleFormControldesignation" name="designation_id" value={employee.designation_id} onChange={InputEvent} onClick={designationValidation} >
                                    <option value="designation">Select Designation </option>
                                    {Designations.map((val) => {
                                        return (
                                            <option key={val.id} value={val.id}>
                                                {val.name}
                                            </option>
                                        );
                                    })}
                                </select>
                                <small id="emailHelp" className="form-text error">{designationError}</small>
                                {Designations.length === 0 && <small id="emailHelp" className="form-text error">Please insert at least one designation.</small>}
                            </Form.Group>
                        </div>
                        <div className="col-md-6">
                            <Form.Group>
                                <label htmlFor="exampleFormControlUser">User Role</label>
                                {/* eslint-disable-next-line eqeqeq */}
                                <select className="form-control" id="exampleFormControlUser" disabled={userDetail.id == GetLocalStorage("user_id")} name="role_id" value={employee.role_id} onChange={InputEvent} onClick={roleValidation}>
                                    <option value="role">Select user role</option>
                                    {userRole.map((val) => {
                                        return (
                                            val.name.toLowerCase() !== "admin" &&
                                            <option key={val.id} value={val.id}>{val.name}</option>
                                            );
                                    })}
                                </select>
                                <small id="emailHelp" className="form-text error">{roleError}</small>
                            </Form.Group>
                        </div>
                        <div className="col-md-6">
                            <Form.Group>
                                <label htmlFor="exampleFormControlStatus">Status</label>
                                            {/* eslint-disable-next-line eqeqeq */}
                                <select className="form-control" id="exampleFormControlStatus" name="status" onChange={InputEvent} disabled={userDetail.id == GetLocalStorage("user_id")}>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </Form.Group>
                        </div>
                        <div className="col-md-6">
                            <Form.Group>
                                <label htmlFor="reportby">Report To</label>
                                <select className="form-control" id="reportby" name="reporting_by" value={employee.reporting_by === null ? "" : employee.reporting_by} onChange={InputEvent} onClick={reportValidation}>
                                    <option value="report">Select Report To</option>
                                    {allRecords.map((val) => {
                                        return (
                                            <option key={val.id} value={val.id}>{val.first_name?.concat(" ", val.last_name)}</option>
                                        );
                                    })}
                                </select>
                                <small id="emailHelp" className="form-text error">{reportToerror}</small>
                            </Form.Group>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group position-relative">
                                <label htmlFor="exampleInputJoining">
                                    Leaving Date
                                </label>
                                <input type="date"
                                    className="form-control"
                                    value={employee.leaveing_date || ""}
                                    ref={leaveDateRef}
                                    onChange={(e) => {
                                        setEmployee({ ...employee, leaveing_date: e.target.value })
                                        if (!e.target.value) {
                                            setleaveingdateError("Please select leaving date");
                                        } else {
                                            setleaveingdateError("");
                                        }
                                    }}
                                    autoComplete='off'
                                    onClick={() => { leaveDateRef.current.showPicker(); handleleavingdateValidation(); }}
                                    min={moment(employee.join_date).format("YYYY-MM-DD")}
                                />
                                <CalendarMonthIcon className='calendar-icon' />
                                {employee.leaveing_date &&
                                    <MdCancel className="cancel_leave" onClick={() => setEmployee({ ...employee, leaveing_date: "" })} />}
                                <small id="emailHelp" className="form-text error">{leaveingdateerror}</small>
                            </div>
                        </div>
                    </>}
                </div>
                <ol>
                    {error?.map((val) => {
                        return <li key={val} className="error">{val}</li>
                    })}
                </ol>
                <div className="submit-section d-flex justify-content-between">
                    <button className="btn btn-light" onClick={BackBtn}>Back</button>
                    <button className="btn btn-gradient-primary" onClick={handleSubmit}>Save</button>
                </div>
            </form >

            {/* image crop modal */}
            < Modal show={secondshow} animation={true} size="md" aria-labelledby="example-modal-sizes-title-sm" className='small-modal' centered >
                <Modal.Header className='small-modal'>
                    <Modal.Title>Crop Image
                    </Modal.Title>
                    <p className='close-modal' onClick={() => setsecondshow(false)}><i className="fa-solid fa-xmark"></i></p>
                </Modal.Header>
                <Modal.Body>
                    <div className="container-fluid p-0">
                        < div className="row" >
                            <div className=" col-12">
                                <ReactCrop src={imagesrc} crop={crop} onChange={newCrop => setCrop(newCrop)} onImageLoaded={setimages} />
                            </div>
                            <div className="col-12 text-center">
                                <label className="upload m-0" >
                                    <CloudUploadIcon />  Upload Different Image <input type="file" accept="image/png,image/jpeg,image/jpg"
                                        name="image" id="" style={{ display: "none" }} onChange={imageChange} />
                                </label>
                            </div>
                            <div className="col-12 d-flex py-2 upload-btn">
                                <button className="btn btn-gradient-primary" onClick={() => { setsecondshow(false); setImage(imagesrc); setEmployee({ ...employee, profile_image: imagesrc }) }}>Upload Original</button>
                                <button className="btn btn-gradient-primary" onClick={onclick}>Save Cropped Image</button>
                            </div>

                        </div>
                    </div>
                </Modal.Body>
            </Modal >
            <canvas ref={ref} className='d-none'></canvas>
            {loader && <Spinner />}
        </>
    );
}

export default PersonalDetailForm;
