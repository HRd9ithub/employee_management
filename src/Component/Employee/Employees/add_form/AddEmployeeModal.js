import React, { useEffect, useState, useRef, useContext } from 'react'
import { Form } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import Spinner from '../../../common/Spinner';
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { customAxios } from "../../../../service/CreateApi";
import { AppProvider } from '../../../context/RouteContext';
import { alphaNumDeshFormat, alphabetFormat, emailFormat, numberFormat, passwordFormat } from '../../../common/RegaulrExp';

const AddEmployeeModal = ({ getAlluser, permission }) => {
    const history = useNavigate();
    let DateRef = useRef();
    let { get_username, userName, Loading } = useContext(AppProvider);


    const [modalShow, setModalShow] = useState(false);
    const [page, setPage] = useState(false)
    const [employee, setEmployee] = useState({
        first_name: "",
        last_name: "",
        email: "",
        mobile_no: "",
        join_date: "",
        password: "",
        role_id: "",
        designation_id: "",
        confirmPassword: "",
        employee_id: "",
        reporting_by: "",
        gender: ""
    });
    const [isLoading, setisLoading] = useState(false);
    const [userRole, setUserRole] = useState([]);
    const [Designations, setDesignations] = useState([]);
    const [firstNameError, setfirstNameError] = useState('');
    const [lastNameError, setlastNameError] = useState('');
    const [emailError, setemailError] = useState('');
    const [phoneError, setphoneError] = useState('');
    const [confirmPasswordError, setconfirmPasswordError] = useState('');
    const [passwordError, setpasswordError] = useState("");
    const [designationError, setdesignationError] = useState('');
    const [roleError, setroleError] = useState('');
    const [genderError, setgenderError] = useState('');
    const [reportToerror, setreporttoError] = useState('');
    const [EmployeeIdError, setEmployeeIdError] = useState('');
    const [joningDateError, setjoningDateError] = useState('');
    const [error, setError] = useState([]);

    // get department,designation,user role
    useEffect(() => {
        const get_role = async () => {
            setisLoading(true);
            try {
                const res = await customAxios().get('/role/');
                if (res.data.success) {
                    setUserRole(res.data.data);
                }
            } catch (error) {
                if (!error.response) {
                    toast.error(error.message);
                } else {
                    if (error.response.data.message) {
                        toast.error(error.response.data.message)
                    }
                }
            } finally {
                setisLoading(false)
            }
        };
        const get_Designations = async () => {
            setisLoading(true)
            try {
                const res = await customAxios().get('/designation/');

                if (res.data.success) {
                    setDesignations(res.data.data);
                }
            } catch (error) {
                if (!error.response) {
                    toast.error(error.message);
                } else {
                    if (error.response.data.message) {
                        toast.error(error.response.data.message)
                    }
                }
            } finally {
                setisLoading(false)
            }
        };
        if (page) {
            get_role();
            get_Designations();
            get_username();
        }
        // eslint-disable-next-line
    }, [page]);

    // hide modal function
    const onHideModal = (e) => {
        if (e) {
            e.preventDefault();
        }
        setModalShow(false);
        setPage(false);
        setEmployee({
            first_name: "",
            last_name: "",
            email: "",
            mobile_no: "",
            join_date: "",
            password: "",
            role_id: "",
            designation_id: "",
            gender: "",
            confirmPassword: "",
            employee_id: "",
            reporting_by: ""
        });
        setfirstNameError('');
        setlastNameError("");
        setemailError("");
        setphoneError("");
        setpasswordError("");
        setconfirmPasswordError("");
        setdesignationError("");
        setroleError("");
        setEmployeeIdError("");
        setreporttoError("")
        setjoningDateError("");
        setgenderError("");
        setError([]);
    }

    // chnage function
    const handleChange = (e) => {
        let { name, value } = e.target;

        setEmployee({ ...employee, [name]: value })
    }

    // first name validation 
    const firstNameValidation = () => {
        if (!employee.first_name) {
            setfirstNameError("First Name is a required field.");
        } else if (!alphabetFormat.test(employee.first_name)) {
            setfirstNameError("First Name must be alphabetic.");
        } else {
            setfirstNameError("");
        }
    }
    // last name validation 
    const lastNameValidation = () => {
        if (!employee.last_name) {
            setlastNameError("Last Name is a required field.");
        } else if (!alphabetFormat.test(employee.last_name)) {
            setlastNameError("Last Name must be alphabetic.");
        } else {
            setlastNameError("");
        }
    }
    // email validation 
    const emailValidation = () => {
        if (!employee.email) {
            setemailError("Email is a required field.");
        } else if (!emailFormat.test(employee.email)) {
            setemailError("Email must be a valid email.");
        } else {
            setemailError("");
        }
    }

    // email check in database
    const checkEmail = async () => {
        if (!employee.email) {
            setemailError("Email is a required field.");
        } else if (!emailFormat.test(employee.email)) {
            setemailError("Email must be a valid email.");
        } else {
            setisLoading(true)

            customAxios().post('/user/email', { email: employee.email }).then((response) => {
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

    // employee id  check in database
    const checkEmployeeId = async () => {
        if (!employee.employee_id) {
            setEmployeeIdError("Employee id is a required field.");
        } else if (!alphaNumDeshFormat.test(employee.employee_id)) {
            setEmployeeIdError("Please enter valid employee id.");
        } else {
            setisLoading(true)
            customAxios().post('/user/employeeId', { employee_id: employee.employee_id }).then((response) => {
                if (response.data.success) {
                    setEmployeeIdError("")
                }
            }).catch((error) => {
                if (!error.response) {
                    toast.error(error.message);
                } else {
                    if (error.response.data.message) {
                        toast.error(error.response.data.message)
                    } else {
                        setEmployeeIdError(error.response.data.error);
                    }
                }
            }).finally(() => {
                setisLoading(false)
            })
        }
    }

    // phone validation
    const phoneValidation = () => {
        if (!employee.mobile_no) {
            setphoneError("Mobile number is a required field.");
        } else if (!numberFormat.test(employee.mobile_no)) {
            setphoneError("Mobile number must be a number.");
        } else if (employee.mobile_no.length !== 10) {
            setphoneError("Your mobile number must be 10 characters.");
        } else {
            setphoneError("");
        }
    }
    // password validation
    const passwordValidation = () => {
        if (!employee.password) {
            setpasswordError("Password is a required field.");
        } else if (!employee.password.match(passwordFormat)) {
            setpasswordError("Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character.");
        } else {
            setpasswordError("");
        }
    }

    // confirm password validation
    const confirmPasswordValidation = () => {
        if (!employee.confirmPassword.trim()) {
            setconfirmPasswordError("Confirm Password is a required field.");
        } else if (employee.password !== employee.confirmPassword) {
            setconfirmPasswordError("Password do not match.");
        } else {
            setconfirmPasswordError("");
        }
    }

    // DESIGNATION validation
    const designationValidation = () => {
        if (!employee.designation_id || employee.designation_id === "designation") {
            setdesignationError("Designation is a required field.");
        } else {
            setdesignationError("")
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

    // report to validation
    const reportValidation = () => {
        if (!employee.reporting_by || employee.reporting_by === "report") {
            setreporttoError("Report to is a required field.");
        } else {
            setreporttoError("")
        }
    }

    // employee id validation
    const employeeIdValidation = () => {
        if (!employee.employee_id) {
            setEmployeeIdError("Employee id is a required field.");
        } else if (!employee.employee_id.match(alphaNumDeshFormat)) {
            setEmployeeIdError("Please enter valid employee id.");
        } else {
            setEmployeeIdError("")
        }
    }

    // joinig date validation
    const handleJoinDatevalidation = () => {
        if (!employee.join_date) {
            setjoningDateError("Joining date is a required field.");
        } else {
            setjoningDateError("");
        }
    }

    // gender validation 
    const genderValidation = () => {
        if (!employee.gender || employee.gender === "Select Gender") {
            setgenderError("Gender is a required field.");
        } else {
            setgenderError("");
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
        passwordValidation();
        confirmPasswordValidation();
        designationValidation();
        roleValidation();
        if (!EmployeeIdError) {
            employeeIdValidation();
        }
        handleJoinDatevalidation();
        reportValidation();
        genderValidation();

        let { first_name, last_name, email, mobile_no, join_date, gender, password, role_id, designation_id, confirmPassword, employee_id, reporting_by } = employee;

        if (!first_name || !last_name || !email || !mobile_no || !join_date || !gender || !password || !role_id || !confirmPassword || !employee_id || !designation_id || !reporting_by) {
            return false;
        } else if (firstNameError || lastNameError || emailError || phoneError || joningDateError || passwordError || roleError || designationError || genderError || confirmPasswordError || EmployeeIdError || reportToerror) {
            return false;
        } else {
            try {
                setisLoading(true);

                const response = await customAxios().post('/user/', {
                    first_name: first_name.charAt(0).toUpperCase() + first_name.slice(1),
                    last_name: last_name.charAt(0).toUpperCase() + last_name.slice(1),
                    email,
                    phone: mobile_no,
                    joining_date: join_date,
                    password,
                    role_id,
                    designation_id,
                    gender,
                    confirmPassword,
                    employee_id,
                    report_by: reporting_by
                });

                if (response.data.success) {
                    setModalShow(false)
                    toast.success(response.data.message);
                    setEmployee({
                        first_name: "",
                        last_name: "",
                        email: "",
                        mobile_no: "",
                        join_date: "",
                        password: "",
                        role_id: "",
                        designation_id: "",
                        gender: "",
                        confirmPassword: "",
                        employee_id: "",
                        reporting_by: ""
                    });
                    history('/Employees');
                    getAlluser();
                }
            } catch (error) {
                if (!error.response) {
                    toast.error(error.message);
                } else {
                    if (error.response.data.message) {
                        toast.error(error.response.data.message)
                    } else {
                        setError(error.response.data.error);
                    }
                }
            } finally {
                setisLoading(false);
                setPage(false);
            }
        }
    }

    return (
        <>
            {permission && permission.permissions.create === 1 &&
                <button type="button" className="btn btn-gradient-primary btn-rounded btn-fw text-center" onClick={() => {
                    setPage(true)
                    setModalShow(true)
                }} >
                    <i className="fa-solid fa-plus"></i>&nbsp;Add
                </button>}
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
                        Add Employee
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className=" grid-margin stretch-card inner-pages mb-lg-0">
                        <div className="card">
                            <div className="card-body">
                                <form className="forms-sample" >
                                    <div className="row">
                                        <div className="col-md-6 pr-md-2 pl-md-2">
                                            <div className="form-group">
                                                <label htmlFor="exampleInputfname">First Name</label>
                                                <input type="text" className="form-control text-capitalize" id="exampleInputfname" placeholder="Enter First name" name="first_name" value={employee.first_name} onChange={handleChange} onBlur={firstNameValidation} autoComplete='off' maxLength={25} />
                                                {firstNameError && <small id="emailHelp" className="form-text error">{firstNameError}</small>}
                                            </div>
                                        </div>
                                        <div className="col-md-6 pr-md-2 pl-md-2">
                                            <div className="form-group">
                                                <label htmlFor="exampleInputlname">Last Name</label>
                                                <input type="text" className="form-control text-capitalize" id="exampleInputlname" placeholder="Enter last name" name="last_name" value={employee.last_name} onChange={handleChange} onBlur={lastNameValidation} autoComplete='off' maxLength={25} />
                                                {lastNameError && <small id="emailHelp" className="form-text error">{lastNameError}</small>}
                                            </div>
                                        </div>
                                        <div className="col-md-6 pr-md-2 pl-md-2">
                                            <div className="form-group">
                                                <label htmlFor="exampleInputEmail1">Email Address</label>
                                                <input type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter email" name="email" onChange={handleChange} value={employee.email} onBlur={checkEmail} autoComplete='off' />
                                                {emailError && <small id="emailHelp" className="form-text error">{emailError}</small>}
                                            </div>
                                        </div>
                                        <div className="col-md-6 pr-md-2 pl-md-2">
                                            <div className="form-group">
                                                <label htmlFor="exampleInputmobile_no">Mobile No.</label>
                                                <input type="tel" className="form-control" id="exampleInputmobile_no" maxLength="10" minLength="10" placeholder="Enter mobile number" name="mobile_no" onChange={handleChange} value={employee.mobile_no} onBlur={phoneValidation} autoComplete='off' inputMode='numeric' />
                                                {phoneError && <small id="emailHelp" className="form-text error">{phoneError}</small>}
                                            </div>
                                        </div>
                                        <div className="col-md-6 pr-md-2 pl-md-2">
                                            <div className="form-group">
                                                <label htmlFor="password">Password</label>
                                                <input type="password" className="form-control" id="password" placeholder="Enter password" name="password" autocompleted="password" value={employee.password} onChange={handleChange} autoComplete='off' onBlur={passwordValidation} />
                                                {passwordError && <small id="emailHelp" className="form-text error">{passwordError}</small>}
                                            </div>
                                        </div>
                                        <div className="col-md-6 pr-md-2 pl-md-2">
                                            <div className="form-group">
                                                <label htmlFor="cpassword">Confirm Password</label>
                                                <input type="password" className="form-control" id="cpassword" placeholder="Enter confirm password" name="confirmPassword" autocompleted="confirmPassword" value={employee.confirmPassword} onChange={handleChange} onBlur={confirmPasswordValidation} autoComplete='off' />
                                                {confirmPasswordError && <small id="emailHelp" className="form-text error">{confirmPasswordError}</small>}
                                            </div>
                                        </div>
                                        <div className="col-md-6 pr-md-2 pl-md-2">
                                            <div className="form-group">
                                                <label htmlFor="employeeId">Employee ID</label>
                                                <input type="text" className="form-control" id="employeeId" placeholder="Enter employee id" name="employee_id" value={employee.employee_id} onChange={handleChange} onBlur={checkEmployeeId} autoComplete='off' />
                                                {EmployeeIdError && <small id="emailHelp" className="form-text error">{EmployeeIdError}</small>}
                                            </div>
                                        </div>
                                        <div className="col-md-6 pr-md-2 pl-md-2">
                                            <div className="form-group position-relative ">
                                                <label htmlFor="exampleInputJoining">
                                                    Joining Date
                                                </label>
                                                <input type="date"
                                                    className="form-control"
                                                    value={employee.join_date || ""}
                                                    ref={DateRef}
                                                    onChange={(e) => {
                                                        setEmployee({ ...employee, join_date: e.target.value })
                                                    }}
                                                    autoComplete='off'
                                                    onClick={() => { DateRef.current.showPicker(); }}
                                                    onBlur={() => handleJoinDatevalidation()}
                                                />
                                                <CalendarMonthIcon className='calendar-icon' onClick={() => { DateRef.current.showPicker(); }} />
                                                {joningDateError && <small id="emailHelp" className="form-text error">{joningDateError}</small>}
                                            </div>
                                        </div>
                                        <div className="col-md-6 pr-md-2 pl-md-2">
                                            <Form.Group>
                                                <label htmlFor="exampleFormControldesignation">Designation</label>
                                                <select className="form-control" id="exampleFormControldesignation" name="designation_id" value={employee.designation_id} onChange={handleChange} onBlur={designationValidation} >
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
                                        <div className="col-md-6 pr-md-2 pl-md-2">
                                            <Form.Group>
                                                <label htmlFor="exampleFormControlUser">User Role</label>
                                                <select className="form-control" id="exampleFormControlUser" name="role_id" value={employee.role_id} onChange={handleChange} onBlur={roleValidation}>
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
                                        <div className="col-md-6 pr-md-2 pl-md-2">
                                            <Form.Group>
                                                <label htmlFor="gender">Gender</label>
                                                <select className="form-control" id="gender" name="gender" onChange={handleChange} onBlur={genderValidation} >
                                                    <option value="Select Gender">Select Gender</option>
                                                    <option value="Male"> Male</option>
                                                    <option value="Female">Female</option>
                                                </select>
                                                {genderError && <small id="emailHelp" className="form-text error">{genderError}</small>}
                                            </Form.Group>
                                        </div>
                                        <div className="col-md-6 pr-md-2 pl-md-2">
                                            <Form.Group>
                                                <label htmlFor="frer">Report To</label>
                                                <select className="form-control" id="frer" name="reporting_by" value={employee.reporting_by || ""} onChange={handleChange} onBlur={reportValidation}>
                                                    <option value="report">Select Report To</option>
                                                    {userName.map((val) => {
                                                        return (
                                                            <option key={val._id} value={val._id}>{val.name}</option>
                                                        );
                                                    })}
                                                </select>
                                                {reportToerror && <small id="emailHelp" className="form-text error">{reportToerror}</small>}
                                            </Form.Group>
                                        </div>
                                    </div>
                                    {error.length !== 0 &&
                                        <ol>
                                            {error?.map((val) => {
                                                return <li className='error' key={val}>{val}</li>
                                            })}
                                        </ol>}
                                    <div className='d-flex justify-content-center modal-button remove-side-margin'>
                                        <button type="submit" className="btn btn-gradient-primary mr-2" onClick={handleSubmit} > Save</button>
                                        <button className="btn btn-light" onClick={onHideModal}>Cancel</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                {(isLoading || Loading) && <Spinner />}
            </Modal>
        </>
    )
}

export default AddEmployeeModal;