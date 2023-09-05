import React, { useEffect } from 'react'
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Spinner from '../../../common/Spinner';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import GlobalPageRedirect from '../../../auth_context/GlobalPageRedirect';
import { GetLocalStorage } from '../../../../service/StoreLocalStorage';

const EductionForm = (props) => {
    let { userDetail, getEmployeeDetail, handleClose, getuser } = props;
    const [eduction, setEduction] = useState([{
        degree_title: '',
        university_name: '',
        year_attended: '',
        user_id: '',
        percentage: '',
    }])
    const [degree_title_error, setdegree_title_error] = useState([])
    const [university_name_error, setuniversity_name_error] = useState([])
    const [year_attended_error, setyear_attended_error] = useState([])
    const [percentage_error, setpercentage_error] = useState([]);
    const [loader, setLoader] = useState(false);
    const [disableBtn, setDisableBtn] = useState(false);
    const [error, setError] = useState([])

    let { getCommonApi } = GlobalPageRedirect();

    // onchange function
    const InputEvent = (event, ind) => {
        let { value, name } = event.target

        let list = [...eduction];
        list[ind][name] = value;

        setEduction(list)
    }

    useEffect(() => {
        if (userDetail.education_detail.length > 0) {
            setEduction(userDetail.education_detail)
        } else {
            eduction[0].user_id = userDetail.id
        }
        // eslint-disable-next-line
    }, [userDetail])

    let { pathname } = useLocation();

    useEffect(() => {
        let disableData = eduction.filter((curElem) => {
            return !curElem.degree_title || !curElem.university_name || !curElem.year_attended || !curElem.percentage
        })
        if (disableData.length > 0 || degree_title_error.length > 0 || university_name_error.length > 0 || year_attended_error.length > 0 || percentage_error.length > 0) {
            setDisableBtn(true)
        } else {
            setDisableBtn(false)
        }
    }, [eduction, year_attended_error, degree_title_error, university_name_error, percentage_error])

    // degree name validation
    const handleDegreeValidate = (ind) => {
        if (!eduction[ind].degree_title || eduction[ind].degree_title.trim().length < 0) {
            setdegree_title_error([...degree_title_error.filter((val) => {
                return val.id !== ind
            }), { name: "Degree field is required.", id: ind }]);

        } else if (!eduction[ind].degree_title.match(/^[a-zA-Z. ]*$/)) {
            setdegree_title_error([...degree_title_error.filter((val) => {
                return val.id !== ind
            }), { name: "Please enter a valid degree.", id: ind }])
        } else {
            let temp = degree_title_error.filter((elem) => {
                return elem.id !== ind
            })
            setdegree_title_error(temp)
        }
    }
    //  university name validation
    const handleuniversityValidate = (ind) => {
        if (!eduction[ind].university_name) {
            setuniversity_name_error([...university_name_error.filter((val) => {
                return val.id !== ind
            }), { name: "University name field is required.", id: ind }]);

        } else if (!eduction[ind].university_name.match(/^[a-zA-Z. ]*$/) || !eduction[ind].university_name.trim()) {
            setuniversity_name_error([...university_name_error.filter((val) => {
                return val.id !== ind
            }), { name: "Please enter a valid University name.", id: ind }])
        } else {
            let temp = university_name_error.filter((elem) => {
                return elem.id !== ind
            })
            setuniversity_name_error(temp)
        }
    }
    //year validation
    const handleYearValidate = (ind) => {
        if (!eduction[ind].year_attended) {
            setyear_attended_error([...year_attended_error.filter((val) => {
                return val.id !== ind
            }), { name: "Year field is required.", id: ind }]);

        } else if (!eduction[ind].year_attended.toString().match(/^[0-9]*$/) || eduction[ind].year_attended > new Date().getFullYear()) {
            setyear_attended_error([...year_attended_error.filter((val) => {
                return val.id !== ind
            }), { name: "Please enter a valid year.", id: ind }])
        } else if (eduction[ind].year_attended.toString().length < 4) {
            setyear_attended_error([...year_attended_error.filter((val) => {
                return val.id !== ind
            }), { name: "Please enter at least 4 characters.", id: ind }])
        } else {
            let temp = year_attended_error.filter((elem) => {
                return elem.id !== ind
            })
            setyear_attended_error(temp)
        }
    }


    // percentage  validation
    const handlepercentageValidate = (ind) => {
        if (!eduction[ind].percentage) {
            setpercentage_error([...percentage_error.filter((val) => {
                return val.id !== ind
            }), { name: "Percentage field is required.", id: ind }]);

        } else if (!eduction[ind].percentage.match(/(^100(\.0{1,2})?$)|(^([1-9]([0-9])?|0)(\.[0-9]{1,2})?$)/)) {
            setpercentage_error([...percentage_error.filter((val) => {
                return val.id !== ind
            }), { name: "Please enter a valid percentage.", id: ind }])
        } else {
            let temp = percentage_error.filter((elem) => {
                return elem.id !== ind
            })
            setpercentage_error(temp)
        }
    }

    let history = useNavigate();
    // back btn
    const BackBtn = (e) => {
        e.preventDefault();
        if (pathname.toLocaleLowerCase().includes('/employees')) {
            history("/employees")
        } else {
            handleClose();
            getuser();
        }
    }

    // submit function
    const HandleSubmit = async (e) => {
        e.preventDefault();
        setError([]);
        if (degree_title_error.length > 0 || university_name_error.length > 0 || year_attended_error.length > 0 || percentage_error.length > 0) {
            return false
        }

        if (userDetail.education_detail.length > 0) {
            // edit data in mysql
            setLoader(true)
            try {
                const response = await axios.post(`${process.env.REACT_APP_API_KEY}/education_detail/update`, { record: JSON.stringify(eduction) }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${GetLocalStorage('token')}`
                    }
                })
                if (response.data.success) {
                    setLoader(false)
                    toast.success("Saved successfully");
                    if (pathname.toLocaleLowerCase().includes('/profile')) {
                        getuser();
                        handleClose();
                    } else {
                        getEmployeeDetail();
                    }
                } else {
                    setLoader(false)
                    toast.error("Something went wrong, Please check your details and try again.")
                }
            } catch (error) {
                console.log("🚀 ~ file: EductionForm.js:183 ~ HandleSubmit ~ error:", error)
                setLoader(false)
                if (error.response.status === 401) {
                    getCommonApi();
                } else {
                    if (error.response.data.message) {
                        toast.error(error.response.data.message)
                    } else {
                        if (typeof error.response.data.error === "string") {
                            toast.error(error.response.data.error)
                        } else {
                            setError(error.response.data.error);
                        }
                    }
                }
            }
        } else {
            //     // add data in mysql
            try {
                setLoader(true)
                const response = await axios.post(`${process.env.REACT_APP_API_KEY}/education_detail/add`, { record: JSON.stringify(eduction) }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${GetLocalStorage('token')}`
                    }
                })
                if (response.data.success) {
                    setLoader(false);
                    if (pathname.toLocaleLowerCase().includes('/profile')) {
                        getuser();
                        handleClose();
                    } else {
                        getEmployeeDetail();
                    }
                    toast.success("Added successfully")

                } else {
                    setLoader(false);
                    toast.error("Something went wrong, Please check your details and try again.")
                }
            } catch (error) {
                setLoader(false)
                console.log("🚀 ~ file: EductionForm.js:111 ~ HandleSubmit ~ error:", error)
                if (error.response.status === 401) {
                    getCommonApi();
                } else {
                    if (error.response.data.message) {
                        toast.error(error.response.data.message)
                    } else {
                        if (typeof error.response.data.error === "string") {
                            toast.error(error.response.data.error)
                        } else {
                            setError(error.response.data.error);
                        }
                    }
                }
            }

        }
    }

    // add row of form
    const addDuplicate = () => {
        let data = [...eduction, {
            degree_title: '',
            university_name: '',
            year_attended: '',
            percentage: '',
            user_id: userDetail.id
        }]

        setEduction(data)
    }

    // delete row
    const deleteRow = (id, ind) => {
        if (id) {
            let token = GetLocalStorage("token");
            const request = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            Swal.fire({
                title: "Delete Field",
                text: "Are you sure want to delete?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#1bcfb4",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, delete it!",
                cancelButtonText: "No, cancel!",
                width: "450px",
            }).then(async (result) => {
                if (result.isConfirmed) {
                    setLoader(true);
                    const res = await axios.post(`${process.env.REACT_APP_API_KEY}/education_detail/delete`, { id: id }, request);
                    if (res.data.success) {
                        toast.success("Field has been successfully deleted.");
                        if (pathname.toLocaleLowerCase().includes('/profile')) {
                            // getuser();
                        } else {
                            getEmployeeDetail();
                        }
                        let deleteField = [...eduction];
                        deleteField.splice(ind, 1);
                        setEduction(deleteField)
                        setLoader(false);
                    } else {
                        toast.error(res.data.message);
                        setLoader(false);
                    }
                }
            }).catch((error) => {
                setLoader(false);
                console.log("error", error);
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
            })
        } else {
            let deleteField = [...eduction];
            deleteField.splice(ind, 1);
            setEduction(deleteField)
        }
    }

    return (
        <>
            <form className="forms-sample">
                {eduction.map((val, ind) => {
                    return (
                        <div className='education-wrapper mt-3' key={ind}>
                            {ind > 0 && <div data-action="delete" className='delete text-right' onClick={() => deleteRow(val.id, ind)}>
                                <i className="fa-solid fa-trash-can "></i>
                            </div>}
                            <div className="form-group">
                                <label htmlFor="2" className='mt-3'>University Name</label>
                                <input type="text" className="form-control" id="2" placeholder="Enter university name" name='university_name' onChange={(event) => InputEvent(event, ind)} value={val.university_name} onKeyUp={() => handleuniversityValidate(ind)} autoComplete='off' />
                                {/* eslint-disable-next-line */}
                                {university_name_error.map((val) => {
                                    if (val.id === ind) {
                                        return <small id="emailHelp" className="form-text error" key={val.id}>{val.name}</small>
                                    }
                                })}

                            </div>
                            <div className="form-group">
                                <label htmlFor="3" className='mt-3'>Degree</label>
                                <input type="text" className="form-control" id="3" placeholder="Enter degree" name='degree_title' onChange={(event) => InputEvent(event, ind)} value={val.degree_title} onKeyUp={() => handleDegreeValidate(ind)} autoComplete='off' />
                                {/* eslint-disable-next-line */}
                                {degree_title_error.map((val) => {
                                    if (val.id === ind) {
                                        return <small id="emailHelp" className="form-text error" key={val.id}>{val.name}</small>
                                    }
                                })}
                            </div>
                            <div className="form-group">
                                <label htmlFor="1" className='mt-3'>Percentage</label>
                                <input type="text" className="form-control" id="1" placeholder="Enter percentage" name='percentage' onChange={(event) => InputEvent(event, ind)} value={val.percentage} onKeyUp={() => handlepercentageValidate(ind)} autoComplete='off' />
                                    {/* eslint-disable-next-line */}
                                {percentage_error.map((val) => {
                                    if (val.id === ind) {
                                        return <small id="emailHelp" className="form-text error" key={val.id}>{val.name}</small>
                                    }
                                })}
                            </div>
                            <div className="form-group">
                                <label htmlFor="6" className='mt-3'>Year</label>
                                <input type="text" className="form-control" id="6" placeholder="Enter year" name='year_attended' onChange={(event) => InputEvent(event, ind)} value={val.year_attended} onKeyUp={() => handleYearValidate(ind)} maxLength={4} autoComplete='off' />
                                {/* eslint-disable-next-line */}
                                {year_attended_error.map((val) => {
                                    if (val.id === ind) {
                                        return <small id="emailHelp" className="form-text error" key={val.id}>{val.name}</small>
                                    }
                                })}
                            </div>
                        </div>
                    )
                })}
                <div className="mt-2"><NavLink onClick={addDuplicate} className="active"><i className="fa-solid fa-circle-plus"></i> Add More</NavLink></div>
                <ol>
                    {error.map((val) => {
                        return <li className='error' key={val}>{val}</li>
                    })}
                </ol>
                <div className="submit-section d-flex justify-content-between py-3">
                    <button className="btn btn-light" onClick={BackBtn}>{pathname.toLocaleLowerCase().includes('/employees') ? "Back" : "Cancel"}</button>
                    <button className="btn btn-gradient-primary" disabled={disableBtn} onClick={HandleSubmit}>Save</button>
                </div>
            </form>
            {loader && <Spinner />}
        </>

    )
}

export default EductionForm
