import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { NavLink, useLocation, useNavigate, useParams } from 'react-router-dom';
import Spinner from '../../../common/Spinner';
import { toast } from 'react-toastify';
import moment from 'moment';
import EmployeeModal from "../../../user_profile/EmployeeModal"
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { HiOutlineMinus } from "react-icons/hi";
import { AiOutlineMinus } from "react-icons/ai";
import GlobalPageRedirect from '../../../auth_context/GlobalPageRedirect';
import { GetLocalStorage } from '../../../../service/StoreLocalStorage';
import { Modal } from 'react-bootstrap';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css'
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ChangePassword from '../../../user_profile/ChangePassword';

const EmployeeViewComponent = () => {
    const [loader, setLoader] = React.useState(false);
    const [data, setdata] = React.useState("");
    const [show, setShow] = useState(false);
    const [Value, setValue] = useState("");
    const [value, setvalue] = React.useState('Personal');

    let navigate = useNavigate();

    // image crop state
    const [crop, setCrop] = useState({
        unit: '%',
        width: 70,
        height: 70
    })
    // eslint-disable-next-line
    const [profile_image, setProfile_image] = useState("")
    const [image, setimage] = useState("")
    const [imagesrc, setimagesrc] = useState("")
    const [images, setimages] = useState("")
    const [secondshow, setsecondshow] = useState(false);

    let { getCommonApi } = GlobalPageRedirect();

    const ref = useRef(null);

    // get parameter 
    const { id } = useParams();

    // get path name
    const { pathname } = useLocation();

    // drop down tab onchange function
    const handleChanges = (newValue) => {
        setvalue(newValue);
    };

    // tabs onchange function
    const changeTab = (event, newValue) => {
        setvalue(newValue);
    }
    const getuser = async () => {
        setLoader(true);
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_KEY}/user/edit`, { id }, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${GetLocalStorage("token")}`,
                }
            })
            if (response.data.success) {
                if (response.data.data.profile_image) {
                    setimage(`${process.env.REACT_APP_IMAGE_API}/storage/${response.data.data.profile_image}`)
                }
                setdata(response.data.data)
            }
            setLoader(false);
        } catch (error) {
            console.log('error', error)
            setLoader(false);
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
    }

    // # get user data
    useEffect(() => {
        getuser();
        // eslint-disable-next-line
    }, [pathname]);

    //Ordinal  add in date
    const dateHandle = (date) => {
        let day = new Date(date).getDate();
        var b = day % 10;

        if ((day % 100) / 10 === 1) {
            return "th";
        } else if (b === 1) {
            return "st";
        } else if (b === 2) {
            return "nd";
        } else if (b === 3) {
            return "rd";
        } else {
            return "th";
        }
    };

    // **** modal close function ****
    const handleClose = () => {
        setShow(false)
    }
    // **** modal show function ****
    const handleShow = (data) => {
        setValue(data);
        setShow(true);
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
            setProfile_image(base64Image)
        } else {
            setProfile_image(imagesrc)
        }
        setsecondshow(false)
    }

    return (
        <>

            {/* ................................................................... */}
            {/* <div className=" container-fluid pt-4"> */}
                <div className="background-wrapper bg-white py-2">
                    <div className=' container-fluid'>
                        <div className='row justify-content-end align-items-center row-std m-0 pb-2'>
                            <div className="col-12 d-flex justify-content-between align-items-center p-0">
                                <div>
                                    <NavLink className="path-header">Profile</NavLink>
                                    <ul id="breadcrumb" className="mb-0">
                                        <li><NavLink to="/" className="ihome">Dashboard</NavLink></li>
                                        <li><NavLink to="/employees" className="ibeaker"><i class="fa-solid fa-play"></i> &nbsp; Employee</NavLink></li>
                                        <li><NavLink to={`/employees/view/${data.id}`} className="ibeaker"><i class="fa-solid fa-play"></i> &nbsp;Profile</NavLink></li>
                                    </ul>
                                </div>
                                <div className="d-flex" id="two">
                                    {!pathname.toLocaleLowerCase().match('/profile') &&
                                        <div>
                                            <button className='btn-gradient-primary' onClick={() => navigate("/employees")}><i className="fa-solid fa-arrow-left"></i>&nbsp; Back</button>
                                        </div>}
                                </div>
                            </div>
                        </div>
                        <div className="profile-box mb-0">
                            <div className="card-body">
                                {pathname.toLocaleLowerCase().match('/profile') && <NavLink onClick={() => handleShow("Profile")} className="edit-icon" data-bs-toggle="modal" data-bs-target="#personal_info_modal"><i className="fa fa-pencil"></i></NavLink>}
                                <div className="row m-0">
                                    <div className="col-md-12">
                                        <div className="profile-view col-12">
                                            <div className="profile-img-wrap ">
                                                <div className="profile-img">
                                                    <img alt="profile_logo" src={`${image && image}`} />
                                                    {pathname.toLocaleLowerCase().match('/profile') && <label className="profile-edit-icon">
                                                        <i className="fa-solid fa-pencil"></i>
                                                        <input type="file" accept="image/png, image/jpg, image/jpeg" className="d-none" onChange={imageChange} />
                                                    </label>}
                                                </div>
                                            </div>
                                            <div className="profile-basic">
                                                <div className="row">
                                                    <div className="col-md-5 col-lg-6 col-12 ">
                                                        <div className="profile-info-left">
                                                            <h3 className="user-name m-t-0 mb-0">{data.first_name && data.first_name.concat(" ", data.last_name)}</h3>
                                                            <small className="text-muted">{data.designation ? data.designation.name : <AiOutlineMinus />}</small>
                                                            <div className="small doj text-muted">Date of Join :  {moment(data.join_date).format("DD")}
                                                                <sup> {dateHandle(data.join_date)} </sup>
                                                                {moment(data.join_date).format("MMM YYYY")}</div>
                                                            <div className="staff-id">Employee ID : {data.employee_id}</div>
                                                            <div className="staff-msg"><button className="btn btn-custom btn-gradient-primary" disabled>Send Message</button></div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-7 col-lg-6 col-12 p-0">
                                                        <ul className="personal-info info-main">
                                                            <li>
                                                                <div className="title">Phone:</div>
                                                                <div className="text"><a href={`tel:${data.mobile_no}`}>{data.mobile_no}</a></div>
                                                            </li>
                                                            <li>
                                                                <div className="title">Email:</div>
                                                                <div className="text">{data.email}</div>
                                                            </li>
                                                            <li>
                                                                <div className="title">Address:</div>
                                                                <div className="text">{data.address ? data.address.concat(", ", data.city).concat(" - ", data.postcode) : <AiOutlineMinus />}</div>
                                                            </li>
                                                            <li>
                                                                <div className="title">Gender:</div>
                                                                <div className="text">{data.gender ? data.gender : <AiOutlineMinus />}</div>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* **** tab display **** */}
                        <div className=" grid-margin stretch-card inner-pages mb-lg-0 pt-4 tab-view">
                            <div className="card modal-content">
                                {/* ............................Header one.......................... */}
                                <div className="modal-header employee-form">
                                    <Tabs value={value} onChange={changeTab} aria-label="secondary tabs example">
                                        <Tab value="Personal" label="Personal Info." />
                                        <Tab value="Account" label="Account Info." />
                                        <Tab value="Education" label="Education Info." />
                                        <Tab value="Document" label="Document Info." />
                                        <Tab value="Company" label="Company Info." />
                                        <Tab value="Emergency" label="Emergency Contact Info." />
                                        {pathname.toLocaleLowerCase().match('/profile') &&
                                            <Tab value="password" label="Change Password" />}
                                    </Tabs>
                                </div>

                                {/* ............................Header two.......................... */}
                                <div className="modal-header-none">
                                    <div className="dropdown">
                                        <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                            {/* eslint-disable-next-line no-useless-concat */}
                                            {value === "password" ? "Change Password" : value + " " + "Details"} <i className="fa-solid fa-chevron-down"></i>
                                        </button>
                                        <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                            <NavLink className="dropdown-item" href="#" onClick={() => handleChanges("Personal")}>Personal Info.</NavLink>
                                            <NavLink className="dropdown-item" href="#" onClick={() => handleChanges("Account")}>Account Info.</NavLink>
                                            <NavLink className="dropdown-item" href="#" onClick={() => handleChanges("Education")}>Education Info.</NavLink>
                                            <NavLink className="dropdown-item" href="#" onClick={() => handleChanges("Document")}>Document Info.</NavLink>
                                            <NavLink className="dropdown-item" href="#" onClick={() => handleChanges("Company")}>Company Info.</NavLink>
                                            <NavLink className="dropdown-item" href="#" onClick={() => handleChanges("Emergency")}>Emergency Contact Info.</NavLink>
                                            {pathname.toLocaleLowerCase().match('/profile') &&
                                                <NavLink className="dropdown-item" href="#" onClick={() => handleChanges("password")}>Change Password</NavLink>}
                                        </div>
                                    </div>
                                </div>

                                <div className="profile-info">
                                    {/* ************** personal detail display ********************* */}
                                    {value === "Personal" ?
                                        <div className="tab-pane fade show active" id="pills-home" role="tabpanel" aria-labelledby="pills-home-tab">
                                            <div id="emp_profile" className="pro-overview tab-pane fade active show">
                                                <div className="row">
                                                    <div className="col-12 d-flex px-md-0 m-auto">
                                                        <div className="flex-fill">
                                                            <div className="">
                                                                <h3 className="card-title">Personal Information
                                                                    {pathname.toLocaleLowerCase().match('/profile') && <NavLink onClick={() => handleShow("Personal")} className="edit-icon" data-bs-toggle="modal" data-bs-target="#personal_info_modal"><i className="fa fa-pencil"></i></NavLink>}
                                                                </h3>
                                                                <ul className="personal-info">
                                                                    <li>
                                                                        <div className="title">Marital status</div>
                                                                        <div className="text">{data.maried_status ? data.maried_status : <HiOutlineMinus />}</div>
                                                                    </li>

                                                                    <li>
                                                                        <div className="title">Country</div>
                                                                        <div className="text">{data.country ? data.country : <HiOutlineMinus />}</div>
                                                                    </li>
                                                                    <li>
                                                                        <div className="title">State</div>
                                                                        <div className="text">{data.state ? data.state : <HiOutlineMinus />}</div>
                                                                    </li>

                                                                    <li>
                                                                        <div className="title">Birthday</div>
                                                                        {data.date_of_birth ? <div className="text">{moment(data.date_of_birth).format("DD")}
                                                                            <sup> {dateHandle(data.date_of_birth)} </sup>
                                                                            {moment(data.date_of_birth).format("MMMM YYYY")}</div>
                                                                            : <div className='text'><HiOutlineMinus /></div>}
                                                                    </li>
                                                                    <li>
                                                                        <div className="title">Age</div>
                                                                        <div className="text">{data.age ? data.age : <HiOutlineMinus />}</div>
                                                                    </li>
                                                                    <li>
                                                                        <div className="title">Blood Group</div>
                                                                        <div className="text">{data.blood_group ? data.blood_group : <HiOutlineMinus />}</div>
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        // *************************** Account detail display ******************* //
                                        : value === "Account" ?
                                            <div className="tab-pane fade show" id="pills-profile" role="tabpanel" aria-labelledby="pills-profile-tab">
                                                <div className="row">
                                                    <div className="col-12 d-flex px-md-0 m-auto">
                                                        <div className="flex-fill">
                                                            <div className="">
                                                                <h3 className="card-title">Account Information
                                                                    {pathname.toLocaleLowerCase().match('/profile') && <NavLink onClick={() => handleShow("Account")} className="edit-icon" data-bs-toggle="modal" data-bs-target="#personal_info_modal"><i className="fa fa-pencil"></i></NavLink>}
                                                                </h3>
                                                                {data.account_detail ?
                                                                    <ul className="personal-info">
                                                                        <li>
                                                                            <div className="title">Name</div>
                                                                            <div className="text">{data.account_detail ? data.account_detail.name : <AiOutlineMinus />}</div>
                                                                        </li>
                                                                        <li>
                                                                            <div className="title">Bank name</div>
                                                                            <div className="text">{data.account_detail?.bank_name}</div>
                                                                        </li>
                                                                        <li>
                                                                            <div className="title">Branch name</div>
                                                                            <div className="text">{data.account_detail?.branch_name}</div>
                                                                        </li>
                                                                        <li>
                                                                            <div className="title">Account Number</div>
                                                                            <div className="text">{data.account_detail?.account_number}</div>
                                                                        </li>
                                                                        <li>
                                                                            <div className="title">IFSC Code</div>
                                                                            <div className="text">{data.account_detail?.ifsc_code}</div>
                                                                        </li>
                                                                    </ul>
                                                                    :
                                                                    <h4 className='no-data'>No Data Found</h4>
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            // *************************** Education detail display ******************* //
                                            : value === "Education" ?
                                                <div className="tab-pane fade show" id="pills-education" role="tabpanel" aria-labelledby="pills-education-tab">
                                                    <div className="row">
                                                        <div className="col-12 d-flex px-md-0 m-auto">
                                                            <div className="flex-fill">
                                                                <div className="">
                                                                    <h3 className="card-title">Education Informations
                                                                        {pathname.toLocaleLowerCase().match('/profile') && <NavLink onClick={() => handleShow("Education")} className="edit-icon" data-bs-toggle="modal" data-bs-target="#personal_info_modal"><i className="fa fa-pencil"></i></NavLink>}
                                                                    </h3>
                                                                    {data.education_detail && data.education_detail.length > 0 ?
                                                                        <div className="experience-box">
                                                                            <ul className="experience-list">
                                                                                {data.education_detail.map((val) => {
                                                                                    return (
                                                                                        <li>
                                                                                            <div className="experience-user">
                                                                                                <div className="before-circle"></div>
                                                                                            </div>
                                                                                            <div className="experience-content">
                                                                                                <div className="timeline-content">
                                                                                                    <p className="name">{val.university_name}</p>
                                                                                                    <div>{val.degree_title}</div>
                                                                                                    <span className="time">{val.percentage}</span>
                                                                                                    <span className="time">{val.year_attended}</span>
                                                                                                </div>
                                                                                            </div>
                                                                                        </li>
                                                                                    )
                                                                                })}
                                                                            </ul>
                                                                        </div>
                                                                        :
                                                                        <h4 className='no-data'>No Data Found</h4>
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div> :
                                                // *************************** company detail display ******************* //
                                                value === "Company" ?
                                                    <div className="tab-pane fade show" id="pills-company" role="tabpanel" aria-labelledby="pills-company-tab">
                                                        <div id="emp_profile" className="pro-overview tab-pane fade active show">
                                                            <div className="row">
                                                                <div className="col-12 d-flex px-md-0 m-auto">
                                                                    <div className="flex-fill">
                                                                        <div className="">
                                                                            <h3 className="card-title">Company Information
                                                                            </h3>
                                                                            <ul className="personal-info">
                                                                                <li>
                                                                                    <div className="title">Employee Id</div>
                                                                                    <div className="text">{data.employee_id}</div>
                                                                                </li>
                                                                                <li>
                                                                                    <div className="title">Department</div>
                                                                                    <div className="text">{data.department ? data.department.name : <AiOutlineMinus />}</div>
                                                                                </li>
                                                                                <li>
                                                                                    <div className="title">Designation</div>
                                                                                    <div className="text">{data.designation ? data.designation.name : <AiOutlineMinus />}</div>
                                                                                </li>
                                                                                <li>
                                                                                    <div className="title">User Role</div>
                                                                                    <div className="text">{data.role ? data.role.name : <AiOutlineMinus />}</div>
                                                                                </li>
                                                                                <li>
                                                                                    <div className="title">Status</div>
                                                                                    <div className="text">{data.status && data.status}</div>
                                                                                </li>
                                                                                <li>
                                                                                    <div className="title">Joining Date</div>
                                                                                    {data.join_date ?
                                                                                        <div className="text"> {data.join_date && moment(data.join_date).format("DD")}
                                                                                            <sup> {dateHandle(data.join_date)} </sup>
                                                                                            {moment(data.join_date).format("MMMM YYYY")}</div> :
                                                                                        <div className='text'><AiOutlineMinus /></div>
                                                                                    }
                                                                                </li>
                                                                                <li>
                                                                                    <div className="title">Leaving Date</div>
                                                                                    {data.leaveing_date ?
                                                                                        <div className="text">{moment(data.leaveing_date).format("DD")}
                                                                                            <sup> {dateHandle(data.leaveing_date)} </sup>
                                                                                            {moment(data.leaveing_date).format("MMMM YYYY")}</div> :
                                                                                        <div className='text'><AiOutlineMinus /></div>
                                                                                    }
                                                                                </li>
                                                                            </ul>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    // *********************document detail *********************//
                                                    : value === "Document" ?
                                                        <div className="tab-pane fade show" id="pills-education" role="tabpanel" aria-labelledby="pills-education-tab">
                                                            <div className="row">
                                                                <div className="col-12 d-flex px-md-0 m-auto">
                                                                    <div className="flex-fill">
                                                                        <div className="">
                                                                            <h3 className="card-title">Document Information
                                                                                {pathname.toLocaleLowerCase().match('/profile') && <NavLink onClick={() => handleShow("Document")} className="edit-icon" data-bs-toggle="modal" data-bs-target="#personal_info_modal"><i className="fa fa-pencil"></i></NavLink>}
                                                                            </h3>
                                                                            {data.joining_letter || data.offer_letter || data.resume || data.other ?
                                                                                <div className='d-flex'>
                                                                                    {data.joining_letter &&
                                                                                        <NavLink to={`${process.env.REACT_APP_IMAGE_API}/storage/${data.joining_letter}`} target='_blank' className="mr-3 text-decoration-none">
                                                                                            <img
                                                                                                className='mt-1 '
                                                                                                style={{ width: '70px', height: '70px' }}
                                                                                                src={data.joining_letter.split(".").pop() !== 'pdf' ? `${process.env.REACT_APP_IMAGE_API}/storage/${data.joining_letter}` : '/images/pdf.png'}
                                                                                                alt="file"
                                                                                            />
                                                                                            <p className='document-title'> Joining letter</p>
                                                                                        </NavLink>}
                                                                                    {data.offer_letter &&
                                                                                        <NavLink to={`${process.env.REACT_APP_IMAGE_API}/storage/${data.offer_letter}`} target='_blank' className="mr-3 text-decoration-none">
                                                                                            <img
                                                                                                className='mt-1'
                                                                                                style={{ width: '70px', height: '70px' }}
                                                                                                src={data.offer_letter.split(".").pop() !== 'pdf' ? `${process.env.REACT_APP_IMAGE_API}/storage/${data.offer_letter}` : '/images/pdf.png'}
                                                                                                alt="file"
                                                                                            />
                                                                                            <p className='document-title'> offer letter</p>
                                                                                        </NavLink>}
                                                                                    {data.resume &&
                                                                                        <NavLink to={`${process.env.REACT_APP_IMAGE_API}/storage/${data.resume}`} target='_blank' className="mr-3 text-decoration-none">
                                                                                            <img
                                                                                                className='mt-1 '
                                                                                                style={{ width: '70px', height: '70px' }}
                                                                                                src={data.resume.split(".").pop() !== 'pdf' ? `${process.env.REACT_APP_IMAGE_API}/storage/${data.resume}` : '/images/pdf.png'}
                                                                                                alt="file"
                                                                                            />
                                                                                            <p className='document-title'> resume</p>
                                                                                        </NavLink>}
                                                                                    {data.other &&
                                                                                        <NavLink to={`${process.env.REACT_APP_IMAGE_API}/storage/${data.other}`} target='_blank' className="mr-3 text-decoration-none">
                                                                                            <img
                                                                                                className='mt-1 '
                                                                                                style={{ width: '70px', height: '70px' }}
                                                                                                src={data.other.split(".").pop() !== 'pdf' ? `${process.env.REACT_APP_IMAGE_API}/storage/${data.other}` : '/images/pdf.png'}
                                                                                                alt="file"
                                                                                            />
                                                                                            <p className='document-title'> other</p>
                                                                                        </NavLink>}
                                                                                </div> :
                                                                                <h4 className='no-data'>No Data Found</h4>
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div> : value === "password" ? <ChangePassword />
                                                            // *************************** emergancy detail display ******************* //
                                                            : <div className="tab-pane fade show" id="pills-emergency" role="tabpanel" aria-labelledby="pills-emergency-tab">
                                                                <div className="row">
                                                                    <div className="col-12 d-flex px-md-0 m-auto">
                                                                        <div className="flex-fill">
                                                                            <div className="">
                                                                                <h3 className="card-title">Emergency Contact
                                                                                    {pathname.toLocaleLowerCase().match('/profile') && <NavLink onClick={() => handleShow("Emergency Contact")} className="edit-icon" data-bs-toggle="modal" data-bs-target="#personal_info_modal"><i className="fa fa-pencil"></i></NavLink>}
                                                                                </h3>
                                                                                {data.e_name ?
                                                                                    <ul className="personal-info">
                                                                                        <li>
                                                                                            <div className="title">Name</div>
                                                                                            <div className="text">{data?.e_name}</div>
                                                                                        </li>
                                                                                        <li>
                                                                                            <div className="title">Relationship</div>
                                                                                            <div className="text">{data.e_relationship ? data.e_relationship : <HiOutlineMinus />}</div>
                                                                                        </li>
                                                                                        <li>
                                                                                            <div className="title">Email </div>
                                                                                            <div className="text">{data?.e_email}</div>
                                                                                        </li>
                                                                                        <li>
                                                                                            <div className="title">Address </div>
                                                                                            <div className="text">{data?.e_address}</div>
                                                                                        </li>
                                                                                        <li>
                                                                                            <div className="title">Phone </div>
                                                                                            <div className="text">{data?.mobile_no}</div>
                                                                                        </li>
                                                                                    </ul> :
                                                                                    <h4 className='no-data'>No Data Found</h4>
                                                                                }
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    <EmployeeModal show={show} handleClose={handleClose} value={Value} data={data} getuser={getuser} />
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
                                            <CloudUploadIcon />  Upload Different Image <input type="file" accept="image/png,image/jpeg,image/jpg,"
                                                name="image" id="" style={{ display: "none" }} onChange={imageChange} />
                                        </label>
                                    </div>
                                    <div className="col-12 d-flex py-2 upload-btn">
                                        <button className="btn btn-gradient-primary" onClick={() => { setsecondshow(false); setProfile_image(imagesrc); }}>Upload Original</button>
                                        <button className="btn btn-gradient-primary" onClick={onclick}>Save Cropped Image</button>
                                    </div>

                                </div>

                            </div>
                        </Modal.Body>
                    </Modal >
                    <canvas ref={ref} className='d-none'></canvas>
                    {loader && <Spinner />}
                </div>

        </>
    )
}


export default EmployeeViewComponent;