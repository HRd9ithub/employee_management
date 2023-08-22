import React from 'react';
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";
import DatePicker from "react-date-picker";
import { useEffect } from 'react';
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import GlobalPageRedirect from '../../../auth_context/GlobalPageRedirect';
import { GetLocalStorage } from '../../../../service/StoreLocalStorage';

const CompanyForm = () => {

    const [userRole, setUserRole] = useState([]);
    const [Department, setDepartment] = useState([]);
    const [Designations, setDesignations] = useState([]);
    const [company, setCompany] = useState({
        employee_id: Math.random().toString().slice(2, 6),
        role_id: "",
        designation_id: "",
        department_id: "",
        status: "Active",
        join_date: "",
        leave_date: ""
    })
    // error message store state
    const [idError, setIdError] = useState("")
    const [departmentError, setdepartmentError] = useState("")
    const [designationError, setdesignationError] = useState("")
    const [joindateError, setjoindateError] = useState("")
    const [leavedateError, setleavedateError] = useState("")
    const [roleError, setroleError] = useState("")

    let { getCommonApi } = GlobalPageRedirect();

    // get department,designation,user role
    useEffect(() => {
        const get_role = async () => {
            try {
                let token = GetLocalStorage("token");
                const request = {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                };
                const res = await axios.get(`${process.env.REACT_APP_API_KEY}/role/list`, request);
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
        get_role();
        get_Department();
        get_Designations();
        // eslint-disable-next-line
    }, []);

    // onchange function
    const InputEvent = (e) => {
        let { name, value } = e.target;
        setCompany({ ...company, [name]: value })
    }

    // joining date onchange
    const handleJoinDate = (value) => {
        setCompany({ ...company, join_date: value.toLocaleDateString() });
        setjoindateError("")
    }
    // leave date onchange
    const handleLeavingDate = (value) => {
        setCompany({ ...company, leave_date: value.toLocaleDateString() });
        setleavedateError("")
    }

    // id validation
    const handleIdValidate = () => {
        if (!company.employee_id) {
            setIdError("Please enter a employee id.")
        } else if (!company.employee_id.match(/^[A-Za-z0-9]+$/)) {
            setIdError("Please enter a valid employee id.")
        } else {
            setIdError("")
        }
    }
    // department validation
    const handleDepartmentValidate = () => {
        if (!company.department_id || company.department_id === "Select Department") {
            setdepartmentError("Please select a department.");
        } else {
            setdepartmentError("");
        }
    }
    // designation validation
    const handledesignationValidate = () => {
        if (!company.designation_id || company.designation_id === "Select Designation") {
            setdesignationError("Please select a designation.");
        } else {
            setdesignationError("");
        }
    }
    // role validation
    const handleroleValidate = () => {
        if (!company.role_id || company.role_id === "Select user role") {
            setroleError("Please select a user role.");
        } else {
            setroleError("");
        }
    }
    // joining date validation
    const handlejoindatevalidation = () => {
        if (!company.join_date) {
            setjoindateError("Please select joining date");
        } else {
            setjoindateError("")
        }
    }
    // leave date validation
    const handleleavedatevalidation = () => {
        if (!company.leave_date) {
            setleavedateError("Please select leaving date");
        } else {
            setleavedateError("")
        }
    }

    // onsubmit function
    const handlesubmit = (e) => {
        e.preventDefault();
        handleIdValidate();
        handleDepartmentValidate();
        handledesignationValidate();
        handleroleValidate();
        handlejoindatevalidation();
        let { id, role_id, designation_id, department_id, status, join_date } = company
        if (!id || !role_id || !designation_id || !department_id || !status || !join_date) {
            return false
        }
        if (idError || departmentError || designationError || roleError || joindateError) {
            return false
        } else {
            console.log('company', company)
        }
    }

    return (
        <>
            <form className="forms-sample mt-2">
                <div className="form-group">
                    <label htmlFor="2" className='mt-3'>Employee Id</label>
                    <input type="text" className="form-control" id="2" placeholder="Enter employee id" name='employee_id' onChange={InputEvent} value={company.employee_id} autoComplete='off' onKeyUp={handleIdValidate} />
                    {idError && <small id="emailHelp" className="form-text error">{idError}</small>}
                </div>
                <div className="row">
                    <div className="col-md-6">
                        <div className="form-group">
                            <label htmlFor="exampleFormControldepartment">Department</label>
                            <select className="form-control" id="exampleFormControldepartment" name="department_id" onChange={InputEvent} value={company.department_id} onClick={handleDepartmentValidate} >
                                <option>Select Department</option>
                                {Department.map((val) => {
                                    return (<option key={val.id} value={val.id}>{val.name}</option>);
                                })}
                            </select>
                            <small id="emailHelp" className="form-text error">{departmentError}</small>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="form-group">
                            <label htmlFor="exampleFormControldesignation">Designation</label>
                            <select className="form-control" id="exampleFormControldesignation" name="designation_id" onChange={InputEvent} value={company.designation_id} onClick={handledesignationValidate}>
                                <option>Select Designation</option>
                                {Designations.map((val) => {
                                    return (<option key={val.id} value={val.id}>{val.name}</option>);
                                })}
                            </select>
                            <small id="emailHelp" className="form-text error">{designationError}</small>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6">
                        <div className="form-group">
                            <label htmlFor="exampleFormControlUser">User Role</label>
                            <select className="form-control" id="exampleFormControlUser" name="role_id" onChange={InputEvent} value={company.role_id} onClick={handleroleValidate}>
                                <option>Select user role</option>
                                {userRole.map((val) => {
                                    return (
                                        <option key={val.id} value={val.id}>
                                            {val.name}
                                        </option>
                                    );
                                })}
                            </select>
                            <small id="emailHelp" className="form-text error">{roleError}</small>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="form-group">
                            <label htmlFor="exampleFormControlStatus">Status</label>
                            <select className="form-control" id="exampleFormControlStatus" name="status" onChange={InputEvent} value={company.status}>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className='row'>
                    <div className="col-md-6">
                        <div className="form-group position-relative">
                            <label htmlFor="exampleInputJoining">Joining Date</label>
                            <DatePicker className="w-100 calcedar-field"
                                format="y-MM-dd" yearPlaceholder="YYYY" monthPlaceholder="MM" dayPlaceholder="DD" calendarIcon={
                                    <CalendarMonthIcon className="calendar-icon" />
                                } clearIcon=""
                                onChange={handleJoinDate}
                                value={company.join_date}
                                maxDate={new Date()}
                                name='join_date'
                                onCalendarClose={handlejoindatevalidation}
                            />
                            <small id="emailHelp" className="form-text error">{joindateError}</small>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="form-group position-relative">
                            <label htmlFor="exampleInputJoining">
                                Leaving Date
                            </label>
                            <DatePicker className="w-100 calcedar-field"
                                onChange={handleLeavingDate}
                                format="y-MM-dd" yearPlaceholder="YYYY" monthPlaceholder="MM" dayPlaceholder="DD" calendarIcon={
                                    <CalendarMonthIcon className="calendar-icon" />
                                } clearIcon=""
                                value={company.leave_date}
                                maxDate={new Date()}
                                onCalendarClose={handleleavedatevalidation}
                            />
                            <small id="emailHelp" className="form-text error">{leavedateError}</small>
                        </div>
                    </div>
                </div>
                <div className="submit-section py-3">
                    <button className="btn btn-primary submit-btn" onClick={handlesubmit}>Save & Continue</button>
                </div>
            </form>
        </>
    )
}

export default CompanyForm
