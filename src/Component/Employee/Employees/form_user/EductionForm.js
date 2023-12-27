import React, { useEffect } from 'react'
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import Spinner from '../../../common/Spinner';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { customAxios } from '../../../../service/CreateApi';
import { numberFormat, percentageFormat } from '../../../common/RegaulrExp';
import ErrorComponent from '../../../common/ErrorComponent';

const EductionForm = (props) => {
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
    const [isLoading, setisLoading] = useState(false);
    const [disableBtn, setDisableBtn] = useState(false);
    const [error, setError] = useState([])

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
        if (!eduction[ind].degree.trim()) {
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
        if (!eduction[ind].university_name.trim()) {
            setuniversity_name_error([...university_name_error.filter((val) => {
                return val.id !== ind
            }), { name: "University name is a required field.", id: ind }]);

        }else {
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
 
        } else if (!eduction[ind].year.toString().match(numberFormat) || eduction[ind].year > new Date().getFullYear()) {
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

        } else if (!eduction[ind].percentage.match(percentageFormat)) {
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

    // submit function
    const HandleSubmit = async (e) => {
        e.preventDefault();
        setError([]);
        if (degree_error.length > 0 || university_name_error.length > 0 || year_error.length > 0 || percentage_error.length > 0) {
            return false
        }
        // edit data in mysql
        setisLoading(true)
        try {
            const response = await customAxios().post('/education/', { info: eduction,user_id : userDetail._id})
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
            } else {
                if (error.response.data.message) {
                    toast.error(error.response.data.message)
                } else {
                    setError(error.response.data.error);
                }
            }
        } finally { setisLoading(false) }
}

    // add row of form
    const addDuplicate = () => {
        const data = [...eduction, {
            degree: '',
            university_name: '',
            year: '',
            percentage: '',
            user_id: userDetail.id
        }]

        setEduction(data)
    }

    // delete row
    const deleteRow = (ind) => {
            let deleteField = [...eduction];
            deleteField.splice(ind, 1);
            setEduction(deleteField)
            setuniversity_name_error(university_name_error.filter((val) => val.id !== ind))
            setdegree_error(university_name_error.filter((val) => val.id !== ind))
            setyear_error(university_name_error.filter((val) => val.id !== ind))
            setpercentage_error(university_name_error.filter((val) => val.id !== ind))
    }

return (
    <>
        <form className="forms-sample">
            {eduction.map((val, ind) => {
                return (
                    <div className='education-wrapper mt-3' key={ind}>
                        {ind > 0 && <div data-action="delete" className='delete text-right' onClick={() => deleteRow(ind)}>
                            <i className="fa-solid fa-trash-can "></i>
                        </div>}
                        <div className="row">
                            <div className="col-md-4 pr-md-2">
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
                            </div>
                            <div className="col-md-4 pl-md-2 pr-md-2">
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
                            </div>
                            <div className="col-md-4 pl-md-2">
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
                            </div>
                            <div className="col-md-4 pr-md-2">
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
                        </div>
                    </div>
                )
            })}
            <div className="mt-2 mb-3"><NavLink onClick={addDuplicate} className="active"><i className="fa-solid fa-circle-plus"></i> Add More</NavLink></div>
            {error.length !== 0 && 
              <div className="row">
                <div className="col-md-12">
                    <ErrorComponent errors={error}/>
                </div>
              </div>
            }
            <div className="submit-section d-flex justify-content-between pb-3">
                <button className="btn btn-gradient-primary" disabled={disableBtn} type='submit' onClick={HandleSubmit}>Save</button>
                <button className="btn btn-light" onClick={BackBtn}>{pathname.toLocaleLowerCase().includes('/employees') ? "Back" : "Cancel"}</button>
            </div>
        </form>
        {isLoading && <Spinner />}
    </>

)
}

export default EductionForm
