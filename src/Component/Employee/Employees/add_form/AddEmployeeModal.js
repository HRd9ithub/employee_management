import React, { useEffect } from 'react'
import { useState } from 'react';
import { Form } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import Spinner from '../../../common/Spinner';
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import GlobalPageRedirect from '../../../auth_context/GlobalPageRedirect';
import { useRef } from 'react';
import axios from 'axios';
import { GetLocalStorage } from '../../../../service/StoreLocalStorage';

const AddEmployeeModal = ({ getAlluser, permission }) => {
    let config = {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${GetLocalStorage('token')}`
        },
    }
    // eslint-disable-next-line
    var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    const history = useNavigate();
    let { getCommonApi } = GlobalPageRedirect();

    let DateRef = useRef();

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
        department_id: "",
        status: "Active",
        confirmPassword: "",
        employee_id: "",
        reporting_by: ""
    });
    const [loader, setLoader] = useState(false);
    const [userRole, setUserRole] = useState([]);
    const [Department, setDepartment] = useState([]);
    const [userName, setUserName] = useState([]);
    const [Designations, setDesignations] = useState([]);
    const [firstNameError, setfirstNameError] = useState('');
    const [lastNameError, setlastNameError] = useState('');
    const [emailError, setemailError] = useState('');
    const [phoneError, setphoneError] = useState('');
    const [passwordError, setpasswordError] = useState("");
    const [confirmPasswordError, setconfirmPasswordError] = useState('');
    const [departmentError, setdepartmentError] = useState('');
    const [designationError, setdesignationError] = useState('');
    const [roleError, setroleError] = useState('');
    const [reportToerror, setreporttoError] = useState('');
    const [EmployeeIdError, setEmployeeIdError] = useState('');
    const [joningDateError, setjoningDateError] = useState('');
    const [error, setError] = useState([]);

    // get department,designation,user role
    useEffect(() => {
        const get_role = async () => {
            setLoader(true);
            try {
                const res = await axios.get(`${process.env.REACT_APP_API_KEY}/role/`,config);
                if (res.data.success) {
                    setUserRole(res.data.data);
                }
            } catch (error) {
                if (!error.response) {
                    toast.error(error.message);
                } else {
                    if (error.response.status === 401) {
                        getCommonApi();
                    } else {
                        if (error.response.data.message) {
                            toast.error(error.response.data.message)
                        }
                    }
                }
            } finally {
                setLoader(false)
            }
        };
        const get_Department = async () => {
            try {
                setLoader(true)
                const res = await axios.get(`${process.env.REACT_APP_API_KEY}/department/`,config);

                if (res.data.success) {
                    setDepartment(res.data.data);
                }
            } catch (error) {
                if (!error.response) {
                    toast.error(error.message);
                } else {
                    if (error.response.status === 401) {
                        getCommonApi();
                    } else {
                        if (error.response.data.message) {
                            toast.error(error.response.data.message)
                        }
                    }
                }
            } finally {
                setLoader(false)
            }
        };
        const get_Designations = async () => {
            setLoader(true)
            try {
                const res = await axios.get(`${process.env.REACT_APP_API_KEY}/designation/`,config);

                if (res.data.success) {
                    setDesignations(res.data.data);
                }
            } catch (error) {
                if (!error.response) {
                    toast.error(error.message);
                } else {
                    if (error.response.status === 401) {
                        getCommonApi();
                    } else {
                        if (error.response.data.message) {
                            toast.error(error.response.data.message)
                        }
                    }
                }
            } finally {
                setLoader(false)
            }
        };
        const get_username = async () => {
            setLoader(true)
            try {
                const res = await axios.post(`${process.env.REACT_APP_API_KEY}/user/username`,{},config);

                if (res.data.success) {
                    setUserName(res.data.data);
                }
            } catch (error) {
                if (!error.response) {
                    toast.error(error.message);
                } else {
                    if (error.response.status === 401) {
                        getCommonApi();
                    } else {
                        if (error.response.data.message) {
                            toast.error(error.response.data.message)
                        }
                    }
                }
            } finally {
                setLoader(false)
            }
        };
        if (page) {
            get_role();
            get_Department();
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
            department_id: "",
            status: "Active",
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
        setdepartmentError("");
        setdesignationError("");
        setroleError("");
        setEmployeeIdError("");
        setreporttoError("")
        setjoningDateError("");
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
        !employee.email && emailValidation();
        if (!emailError && employee.email) {
            setLoader(true)
          
            axios.post(`${process.env.REACT_APP_API_KEY}/user/email`, { email: employee.email },config).then((response) => {
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
                setLoader(false)
            })
        }
    }

    // employee id  check in database
    const checkEmployeeId = async () => {
        !employee.employee_id && employeeIdValidation();
        if (!EmployeeIdError && employee.employee_id) {
            setLoader(true)
            axios.post(`${process.env.REACT_APP_API_KEY}/user/employeeId`, { employee_id: employee.employee_id },config).then((response) => {
                if (response.data.success) {
                    setEmployeeIdError("")
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
                        setEmployeeIdError(error.response.data.error);
                    }
                }
            }).finally(() => {
                setLoader(false)
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
    // password validation
    const passwordValidation = () => {
        if (!employee.password) {
            setpasswordError("Please enter password.");
        } else if (!employee.password.match(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/)) {
            setpasswordError("Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character.");
        } else {
            setpasswordError("");
        }
    }

    // confirm password validation
    const confirmPasswordValidation = () => {
        if (!employee.confirmPassword.trim()) {
            setconfirmPasswordError("Please enter a confirm Password.");
        } else if (employee.password !== employee.confirmPassword) {
            setconfirmPasswordError("Password do not match.");
        } else {
            setconfirmPasswordError("");
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

    // role validation
    const roleValidation = () => {
        if (!employee.role_id || employee.role_id === "role") {
            setroleError("Please select user role.");
        } else {
            setroleError("")
        }
    }

    // report to validation
    const reportValidation = () => {
        if (!employee.reporting_by || employee.reporting_by === "report") {
            setreporttoError("Please select report to.");
        } else {
            setreporttoError("")
        }
    }

    // employee id validation
    const employeeIdValidation = () => {
        if (!employee.employee_id) {
            setEmployeeIdError("Please enter employee id.");
        } else if (!employee.employee_id.match(/^[A-Za-z0-9-]+$/)) {
            setEmployeeIdError("Please enter valid employee id.");
        } else {
            setEmployeeIdError("")
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
        departmentValidation();
        designationValidation();
        roleValidation();
        if (!EmployeeIdError) {
            employeeIdValidation();
        }
        handleJoinDatevalidation();
        reportValidation();

        let { first_name, last_name, email, mobile_no, join_date, password, role_id, designation_id, department_id, status, confirmPassword, employee_id, reporting_by } = employee;

        if (!first_name || !last_name || !email || !mobile_no || !join_date || !password || !role_id || !status || !confirmPassword || !employee_id || !designation_id || !department_id || !reporting_by) {
            return false;
        } else if (firstNameError || lastNameError || emailError || phoneError || joningDateError || passwordError.length !== 0 || roleError || designationError || departmentError || confirmPasswordError || EmployeeIdError || reportToerror) {
            return false;
        } else {
            try {
                setLoader(true);

                const response = await axios.post(`${process.env.REACT_APP_API_KEY}/user/`, {
                    first_name: first_name.charAt(0).toUpperCase() + first_name.slice(1),
                    last_name: last_name.charAt(0).toUpperCase() + last_name.slice(1),
                    email,
                    phone: mobile_no,
                    joining_date: join_date,
                    password,
                    role_id,
                    designation_id,
                    department_id,
                    status,
                    confirmPassword,
                    employee_id,
                    report_by: reporting_by
                },config);

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
                        department_id: "",
                        status: "Active",
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
                } else if (error.response.status === 401) {
                    getCommonApi();
                } else {
                    if (error.response.data.message) {
                        toast.error(error.response.data.message)
                    } else {
                        setError(error.response.data.error);
                    }
                }
            } finally {
                setLoader(false);
                setPage(false);
            }
        }
    }



    return (
        <>
            {permission && (permission.name.toLowerCase() === "admin" || (permission.permissions.length !== 0 && permission.permissions.create === 1)) &&
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
                                                <input type="text" className="form-control text-capitalize" id="exampleInputfname" placeholder="Enter First name" name="first_name" value={employee.first_name} onChange={handleChange} onKeyUp={firstNameValidation} onBlur={firstNameValidation} autoComplete='off' />
                                                <small id="emailHelp" className="form-text error">{firstNameError}</small>
                                            </div>
                                        </div>
                                        <div className="col-md-6 pr-md-2 pl-md-2">
                                            <div className="form-group">
                                                <label htmlFor="exampleInputlname">Last Name</label>
                                                <input type="text" className="form-control text-capitalize" id="exampleInputlname" placeholder="Enter last name" name="last_name" value={employee.last_name} onChange={handleChange} onKeyUp={lastNameValidation} onBlur={lastNameValidation} autoComplete='off' />
                                                <small id="emailHelp" className="form-text error">{lastNameError}</small>
                                            </div>
                                        </div>
                                        <div className="col-md-6 pr-md-2 pl-md-2">
                                            <div className="form-group">
                                                <label htmlFor="exampleInputEmail1">Email Address</label>
                                                <input type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter email" name="email" onChange={handleChange} value={employee.email} onBlur={checkEmail}  onKeyUp={emailValidation} autoComplete='off' />
                                                <small id="emailHelp" className="form-text error">{emailError}</small>
                                            </div>
                                        </div>
                                        <div className="col-md-6 pr-md-2 pl-md-2">
                                            <div className="form-group">
                                                <label htmlFor="exampleInputmobile_no">Mobile No.</label>
                                                <input type="tel" className="form-control" id="exampleInputmobile_no" maxLength="10" minLength="10" placeholder="Enter mobile number" name="mobile_no" onChange={handleChange} value={employee.mobile_no} onKeyUp={phoneValidation} onBlur={phoneValidation} autoComplete='off' inputMode='numeric' />
                                                <small id="emailHelp" className="form-text error">{phoneError}</small>
                                            </div>
                                        </div>
                                        <div className="col-md-6 pr-md-2 pl-md-2">
                                            <div className="form-group">
                                                <label htmlFor="password">Password</label>
                                                <input type="password" className="form-control" id="password" placeholder="Enter password" name="password" autocompleted="password" value={employee.password} onChange={handleChange} onKeyUp={passwordValidation} autoComplete='off' onBlur={passwordValidation} />
                                                <small id="emailHelp" className="form-text error">{passwordError}</small>
                                            </div>
                                        </div>
                                        <div className="col-md-6 pr-md-2 pl-md-2">
                                            <div className="form-group">
                                                <label htmlFor="cpassword">Confirm Password</label>
                                                <input type="password" className="form-control" id="cpassword" placeholder="Enter confirm password" name="confirmPassword" autocompleted="confirmPassword" value={employee.confirmPassword} onChange={handleChange} onKeyUp={confirmPasswordValidation} onBlur={confirmPasswordValidation} autoComplete='off' />
                                                <small id="emailHelp" className="form-text error">{confirmPasswordError}</small>
                                            </div>
                                        </div>
                                        <div className="col-md-6 pr-md-2 pl-md-2">
                                            <div className="form-group">
                                                <label htmlFor="employeeId">Employee ID</label>
                                                <input type="text" className="form-control" id="employeeId" placeholder="Enter employee id" name="employee_id" value={employee.employee_id} onChange={handleChange} onKeyUp={employeeIdValidation} onBlur={checkEmployeeId} autoComplete='off' />
                                                <small id="emailHelp" className="form-text error">{EmployeeIdError}</small>
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
                                                        if (!e.target.value) {
                                                            setjoningDateError("Please select joining date");
                                                        } else {
                                                            setjoningDateError("");
                                                        }
                                                    }}
                                                    autoComplete='off'
                                                    onClick={() => { DateRef.current.showPicker(); handleJoinDatevalidation(); }}
                                                    onBlur={() => handleJoinDatevalidation()}
                                                />
                                                <CalendarMonthIcon className='calendar-icon' />
                                                <small id="emailHelp" className="form-text error">{joningDateError}</small>
                                            </div>
                                        </div>
                                        <div className="col-md-6 pr-md-2 pl-md-2">
                                            <Form.Group>
                                                <label htmlFor="exampleFormControldepartment">Department</label>
                                                <select className="form-control" id="exampleFormControldepartment" name="department_id" value={employee.department_id} onChange={(e) => {
                                                    handleChange(e);
                                                    if(e.target.value && e.target.value !== "department"){
                                                        setdepartmentError("");
                                                    }else{
                                                        setdepartmentError("Please select a department.");
                                                    }
                                                    }} onClick={departmentValidation} >
                                                    <option value="department">Select Department</option>
                                                    {Department.map((val) => {
                                                        return (
                                                            <option key={val._id} value={val._id}>
                                                                {val.name}
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                                <small id="emailHelp" className="form-text error">{departmentError}</small>
                                                {Department.length === 0 && <small id="emailHelp" className="form-text error">Please insert at least one department.</small>}
                                            </Form.Group>
                                        </div>
                                        <div className="col-md-6 pr-md-2 pl-md-2">
                                            <Form.Group>
                                                <label htmlFor="exampleFormControldesignation">Designation</label>
                                                <select className="form-control" id="exampleFormControldesignation" name="designation_id" value={employee.designation_id} onChange={(e) => {
                                                    handleChange(e);
                                                    if(e.target.value && e.target.value !== "designation"){
                                                        setdesignationError("");
                                                    }else{
                                                        setdesignationError("Please select a designation.");
                                                    }
                                                    }} onClick={designationValidation} >
                                                    <option value="designation">Select Designation </option>
                                                    {Designations.map((val) => {
                                                        return (
                                                            <option key={val._id} value={val._id}>
                                                                {val.name}
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                                <small id="emailHelp" className="form-text error">{designationError}</small>
                                                {Designations.length === 0 && <small id="emailHelp" className="form-text error">Please insert at least one designation.</small>}
                                            </Form.Group>
                                        </div>
                                        <div className="col-md-6 pr-md-2 pl-md-2">
                                            <Form.Group>
                                                <label htmlFor="exampleFormControlUser">User Role</label>
                                                <select className="form-control" id="exampleFormControlUser" name="role_id" value={employee.role_id} onChange={(e) => {
                                                    handleChange(e);
                                                    if(e.target.value && e.target.value !== "role"){
                                                        setroleError("");
                                                    }else{
                                                        setroleError("Please select user role.");
                                                    }
                                                    }} onClick={roleValidation}>
                                                    <option value="role">Select user role</option>
                                                    {userRole.map((val) => {
                                                        return (
                                                            val.name.toLowerCase() !== "admin" &&
                                                            <option key={val._id} value={val._id}>{val.name}</option>
                                                        );
                                                    })}
                                                </select>
                                                <small id="emailHelp" className="form-text error">{roleError}</small>
                                                {userRole.length === 0 && <small id="emailHelp" className="form-text error">Please insert at least one user role.</small>}
                                            </Form.Group>
                                        </div>
                                        <div className="col-md-6 pr-md-2 pl-md-2">
                                            <Form.Group>
                                                <label htmlFor="exampleFormControlStatus">Status</label>
                                                <select className="form-control" id="exampleFormControlStatus" name="status" onChange={handleChange} >
                                                    <option value="Active">Active</option>
                                                    <option value="Inactive">Inactive</option>
                                                </select>
                                            </Form.Group>
                                        </div>
                                        <div className="col-md-12 pr-md-2 pl-md-2">
                                            <Form.Group>
                                                <label htmlFor="frer">Report To</label>
                                                <select className="form-control" id="frer" name="reporting_by" value={employee.reporting_by || ""} onChange={(e) => {
                                                    handleChange(e);
                                                    if(e.target.value && e.target.value !== "report"){
                                                        setreporttoError("");
                                                    }else{
                                                        setreporttoError("Please select report to.");
                                                    }
                                                    }} onClick={reportValidation}>
                                                    <option value="report">Select Report To</option>
                                                    {userName.map((val) => {
                                                        return (
                                                            <option key={val._id} value={val._id}>{val.first_name?.concat(" ", val.last_name)}</option>
                                                        );
                                                    })}
                                                </select>
                                                <small id="emailHelp" className="form-text error">{reportToerror}</small>
                                                {userName.length === 0 && <small id="emailHelp" className="form-text error">Please insert at least one employee.</small>}
                                            </Form.Group>
                                        </div>
                                    </div>
                                    <ol>
                                        {error?.map((val) => {
                                            return <li className='error'>{val}</li>
                                        })}
                                    </ol>
                                    <div className='d-flex justify-content-end modal-button'>
                                        <button type="submit" className="btn btn-gradient-primary mr-2" onClick={handleSubmit} > Save</button>
                                        <button className="btn btn-light" onClick={onHideModal}>Cancel</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                {loader && <Spinner />}
            </Modal>
        </>
    )
}

export default AddEmployeeModal;