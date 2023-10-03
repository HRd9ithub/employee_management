import React, { useEffect } from 'react'
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Spinner from '../../../common/Spinner';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import GlobalPageRedirect from '../../../auth_context/GlobalPageRedirect';
import { GetLocalStorage } from '../../../../service/StoreLocalStorage';

const EductionForm = (props) => {
    let config = {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${GetLocalStorage('token')}`
        },
    }
    let { userDetail, getEmployeeDetail, handleClose, getuser } = props;
    const [eduction, setEduction] = useState([{
        degree: '',
        university_name: '',
        year: '',
        user_id: '',
        percentage: '',
    }])
    const [degree_error, setdegree_error] = useState([])
    const [university_name_error, setuniversity_name_error] = useState([])
    const [year_error, setyear_error] = useState([])
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
        if (userDetail.education.length > 0) {
            setEduction(userDetail.education)
        } else {
            eduction[0].user_id = userDetail.id
        }
        // eslint-disable-next-line
    }, [userDetail])

    let { pathname } = useLocation();

    useEffect(() => {
        let disableData = eduction.filter((curElem) => {
            return !curElem.degree || !curElem.university_name || !curElem.year || !curElem.percentage
        })
        if (disableData.length > 0 || degree_error.length > 0 || university_name_error.length > 0 || year_error.length > 0 || percentage_error.length > 0) {
            setDisableBtn(true)
        } else {
            setDisableBtn(false)
        }
    }, [eduction, year_error, degree_error, university_name_error, percentage_error])

    // degree name validation
    const handleDegreeValidate = (ind) => {
        if (!eduction[ind].degree || eduction[ind].degree.trim().length <= 0) {
            setdegree_error([...degree_error.filter((val) => {
                return val.id !== ind
            }), { name: "Degree is a required field.", id: ind }]);

        } else {
            let temp = degree_error.filter((elem) => {
                return elem.id !== ind
            })
            setdegree_error(temp)
        }
    }
    //  university name validation
    const handleuniversityValidate = (ind) => {
        if (!eduction[ind].university_name) {
            setuniversity_name_error([...university_name_error.filter((val) => {
                return val.id !== ind
            }), { name: "University name is a required field.", id: ind }]);

        } else if (!eduction[ind].university_name.match(/^[a-zA-Z. ]*$/) || !eduction[ind].university_name.trim()) {
            setuniversity_name_error([...university_name_error.filter((val) => {
                return val.id !== ind
            }), { name: "University name must be an alphabet,dot and space only.", id: ind }])
        } else {
            let temp = university_name_error.filter((elem) => {
                return elem.id !== ind
            })
            setuniversity_name_error(temp)
        }
    }
    //year validation
    const handleYearValidate = (ind) => {
        if (!eduction[ind].year) {
            setyear_error([...year_error.filter((val) => {
                return val.id !== ind
            }), { name: "Year is a required field.", id: ind }]);
 
        } else if (!eduction[ind].year.toString().match(/^[0-9]*$/) || eduction[ind].year > new Date().getFullYear()) {
            setyear_error([...year_error.filter((val) => {
                return val.id !== ind
            }), { name: "Year must be a number.", id: ind }])
        } else if (eduction[ind].year.toString().length < 4) {
            setyear_error([...year_error.filter((val) => {
                return val.id !== ind
            }), { name: "Your year must be 4 characters.", id: ind }])
        } else {
            let temp = year_error.filter((elem) => {
                return elem.id !== ind
            })
            setyear_error(temp)
        }
    }


    // percentage  validation
    const handlepercentageValidate = (ind) => {
        if (!eduction[ind].percentage) {
            setpercentage_error([...percentage_error.filter((val) => {
                return val.id !== ind
            }), { name: "Percentage is a required field.", id: ind }]);

        } else if (!eduction[ind].percentage.match(/(^100(\.0{1,2})?$)|(^([1-9]([0-9])?|0)(\.[0-9]{1,2})?$)/)) {
            setpercentage_error([...percentage_error.filter((val) => {
                return val.id !== ind
            }), { name: "Percentage must be a valid.", id: ind }])
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
        }
    }

    // submit function
    const HandleSubmit = async (e) => {
        e.preventDefault();
        setError([]);
        if (degree_error.length > 0 || university_name_error.length > 0 || year_error.length > 0 || percentage_error.length > 0) {
            return false
        }
        // edit data in mysql
        setLoader(true)
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_KEY}/education/`, { info: eduction,user_id : userDetail._id},config)
            if (response.data.success) {
                toast.success(response.data.message);
                if (pathname.toLocaleLowerCase().includes('/profile')) {
                    getuser();
                    handleClose();
                } else {
                    getEmployeeDetail();
                }
            }
        } catch (error) {
            if (!error.response) {
                toast.error(error.message)
            } else if (error.response.status === 401) {
                getCommonApi();
            } else {
                if (error.response.data.message) {
                    toast.error(error.response.data.message)
                } else {
                    setError(error.response.data.error);
                }
            }
        } finally { setLoader(false) }
}

// add row of form
const addDuplicate = () => {
    let data = [...eduction, {
        degree: '',
        university_name: '',
        year: '',
        percentage: '',
        user_id: userDetail.id
    }]

    setEduction(data)
}

// delete row
const deleteRow = (id, ind) => {
    setError([])
    if (id) {
        Swal.fire({
            title: "Delete Field",
            text: "Are you sure you want to delete?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#1bcfb4",
            cancelButtonColor: "#d33",
            confirmButtonText: "Delete",
            cancelButtonText: "Cancel",
            width: "450px",
        }).then(async (result) => {
            if (result.isConfirmed) {
                setLoader(true);
                const res = await axios.delete(`${process.env.REACT_APP_API_KEY}/education/${id}`,config);
                if (res.data.success) {
                    toast.success(res.data.message);
                    if (pathname.toLocaleLowerCase().includes('/profile')) {
                        getuser();
                    } else {
                        getEmployeeDetail();
                    }
                }
            }
        }).catch((error) => {
            if (!error.response) {
                toast.error(error.message)
            } else if (error.response.status === 401) {
                getCommonApi();
            } else {
                if (error.response.data.message) {
                    toast.error(error.response.data.message)
                } else {
                    setError(error.response.data.error);
                }
            }
        }).finally(() => setLoader(false))
    } else {
        let deleteField = [...eduction];
        deleteField.splice(ind, 1);
        setEduction(deleteField)
        setuniversity_name_error(university_name_error.filter((val) => val.id !== ind))
        setdegree_error(university_name_error.filter((val) => val.id !== ind))
        setyear_error(university_name_error.filter((val) => val.id !== ind))
        setpercentage_error(university_name_error.filter((val) => val.id !== ind))
    }
}

return (
    <>
        <form className="forms-sample">
            {eduction.map((val, ind) => {
                return (
                    <div className='education-wrapper mt-3' key={ind}>
                        {ind > 0 && <div data-action="delete" className='delete text-right' onClick={() => deleteRow(val._id, ind)}>
                            <i className="fa-solid fa-trash-can "></i>
                        </div>}
                        <div className="form-group">
                            <label htmlFor="2" className='mt-3'>University Name</label>
                            <input type="text" className="form-control" id="2" placeholder="Enter university name" name='university_name' onChange={(event) => InputEvent(event, ind)} value={val.university_name} onBlur={() => handleuniversityValidate(ind)} autoComplete='off' />
                            {/* eslint-disable-next-line */}
                            {university_name_error.map((val) => {
                                if (val.id === ind) {
                                    return <small id="emailHelp" className="form-text error" key={val.id}>{val.name}</small>
                                }
                            })}

                        </div>
                        <div className="form-group">
                            <label htmlFor="3" className='mt-3'>Degree</label>
                            <input type="text" className="form-control" id="3" placeholder="Enter degree" name='degree' onChange={(event) => InputEvent(event, ind)} value={val.degree}  onBlur={() => handleDegreeValidate(ind)} autoComplete='off' />
                            {/* eslint-disable-next-line */}
                            {degree_error.map((val) => {
                                if (val.id === ind) {
                                    return <small id="emailHelp" className="form-text error" key={val.id}>{val.name}</small>
                                }
                            })}
                        </div>
                        <div className="form-group">
                            <label htmlFor="1" className='mt-3'>Percentage</label>
                            <input type="text" className="form-control" id="1" placeholder="Enter percentage" name='percentage' onChange={(event) => InputEvent(event, ind)} value={val.percentage}  onBlur={() => handlepercentageValidate(ind)} autoComplete='off' />
                            {/* eslint-disable-next-line */}
                            {percentage_error.map((val) => {
                                if (val.id === ind) {
                                    return <small id="emailHelp" className="form-text error" key={val.id}>{val.name}</small>
                                }
                            })}
                        </div>
                        <div className="form-group">
                            <label htmlFor="6" className='mt-3'>Year</label>
                            <input type="text" className="form-control" id="6" placeholder="Enter year" name='year' onChange={(event) => InputEvent(event, ind)} value={val.year} onBlur={() => handleYearValidate(ind)}  maxLength={4} autoComplete='off' />
                            {/* eslint-disable-next-line */}
                            {year_error.map((val) => {
                                if (val.id === ind) {
                                    return <small id="emailHelp" className="form-text error" key={val.id}>{val.name}</small>
                                }
                            })}
                        </div>
                    </div>
                )
            })}
            <div className="mt-2"><NavLink onClick={addDuplicate} className="active"><i className="fa-solid fa-circle-plus"></i> Add More</NavLink></div>
            {error.length !== 0 && <ol>
                {error.map((val) => {
                    return <li className='error' key={val}>{val}</li>
                })}
            </ol>}
            <div className="submit-section d-flex justify-content-between py-3">
                <button className="btn btn-gradient-primary" disabled={disableBtn} type='submit' onClick={HandleSubmit}>Save</button>
                <button className="btn btn-light" onClick={BackBtn}>{pathname.toLocaleLowerCase().includes('/employees') ? "Back" : "Cancel"}</button>
            </div>
        </form>
        {loader && <Spinner />}
    </>

)
}

export default EductionForm
