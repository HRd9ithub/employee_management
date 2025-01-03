import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useMatch, useNavigate, useParams } from 'react-router-dom';
import Spinner from '../../../common/Spinner';
import { toast } from 'react-hot-toast';
import EmployeeModal from "../../../user_profile/EmployeeModal"
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { HiOutlineMinus } from "react-icons/hi";
import { AiOutlineMinus } from "react-icons/ai";
import ChangePassword from '../../../user_profile/ChangePassword';
import Avatar from '@mui/material/Avatar';
import { useContext } from 'react';
import { AppProvider } from '../../../context/RouteContext';
import Error403 from '../../../error_pages/Error403';
import { dateFormat } from '../../../../helper/dateFormat';
import { customAxios, customAxios1 } from '../../../../service/CreateApi';
import { GetLocalStorage } from '../../../../service/StoreLocalStorage';
import Swal from 'sweetalert2';
import { Dropdown } from 'react-bootstrap';

const EmployeeViewComponent = () => {
    const [isLoading, setisLoading] = useState(false);
    const [data, setdata] = useState("");
    const [show, setShow] = useState(false);
    const [Value, setValue] = useState("");
    const [value, setvalue] = React.useState('Personal');
    const [permission, setpermission] = useState("");

    let navigate = useNavigate();

    // eslint-disable-next-line
    const [image, setimage] = useState("")

    let { getUserData, UserData, Loading } = useContext(AppProvider);

    const ref = useRef(null);

    // get parameter 
    const { id } = useParams();

    // get path name
    const match = useMatch("/profile/" + id)

    // drop down tab onchange function
    const handleChanges = (newValue) => {
        setvalue(newValue);
    };

    // tabs onchange function
    const changeTab = (event, newValue) => {
        setvalue(newValue);
    }

    const getuser = async () => {
        setisLoading(true);
        try {
            const response = await customAxios().get(`/user/${id}`)
            if (response.data.success) {
                setpermission(response.data.permissions)
                if (response.data.data && response.data.data.profile_image) {
                    setimage(`${process.env.REACT_APP_IMAGE_API}/${response.data.data.profile_image}`)
                }
                setdata(response.data.data);
            }
            setisLoading(false);
        } catch (error) {
            setisLoading(false);
            if (!error.response) {
                toast.error(error.message)
            } else {
                if (error.response.data.message) {
                    toast.error(error.response.data.message)
                }
            }
        }
    }

    // # get user data
    useEffect(() => {
        if (!match) {
            getuser();
        }
        if (GetLocalStorage("userVerify") === "true") {
            Swal.fire({
                title: "Necessary Action",
                text: "Before accessing other features, it is necessary to fill out your account and emergency contact details.",
                showCancelButton: false,
                confirmButtonText: "Ok",
                cancelButtonText: "Ok",
                width: "450px",
            })
        }
        // eslint-disable-next-line
    }, [match]);

    useEffect(() => {
        if (match) {
            setdata(UserData);
            setimage(`${process.env.REACT_APP_IMAGE_API}/${UserData.profile_image}`)
        }
    }, [UserData, match])

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
    const imageChange = async (e) => {
        if (e.target.files.length !== 0) {
            var formdata = new FormData();
            formdata.append('profile_image', e.target.files[0]);
            setisLoading(true);
            try {
                const response = await customAxios1().post('/user/image', formdata);
                if (response.data.success) {
                    toast.success(response.data.message)
                    // getuser();
                    getUserData();
                    setisLoading(false);
                }
            } catch (error) {
                setisLoading(false)
                if (!error.response) {
                    toast.error(error.message)
                } else {
                    if (error.response.data.message) {
                        toast.error(error.response.data.message)
                    }
                }
            }
        }
    }

    if (isLoading || Loading) {
        return <Spinner />
    }

    return (
        <>
            {/* <div className=" container-fluid pt-4"> */}
            {(match || (!match && permission && permission.permissions.list === 1)) ?
                <div className=" container-fluid py-4">
                    <div className="background-wrapper bg-white pb-4">
                        <div className='row justify-content-end align-items-center row-std m-0 px-4'>
                            <div className="col-12 col-sm-6 d-flex justify-content-between align-items-center p-0">
                                <div>
                                    {/* <NavLink className="path-header">Profile</NavLink> */}
                                    <ul id="breadcrumb" className="mb-0">
                                        <li><NavLink to="/" className="ihome">Dashboard</NavLink></li>
                                        {!match && <li><NavLink to="/employees" className="ibeaker"><i className="fa-solid fa-play"></i> &nbsp; Employee</NavLink></li>}
                                        <li><NavLink to="" className="ibeaker"><i className="fa-solid fa-play"></i> &nbsp;Profile</NavLink></li>
                                    </ul>
                                </div>
                            </div>
                            <div className="col-12 col-sm-6 d-flex justify-content-end pr-0" id="two">
                                {!match &&
                                    <div>
                                        <button className='btn-gradient-primary mr-2' onClick={() => navigate(`/employees/edit/${id}`)}><i className="fa-solid fa-pen"></i>&nbsp; Edit</button>
                                        <button className='btn-gradient-primary' onClick={() => navigate("/employees")}><i className="fa-solid fa-arrow-left"></i>&nbsp; Back</button>
                                    </div>}
                            </div>
                        </div>
                        <div className="profile-box mb-0 px-4">
                            <div className="py-3">
                                <div className="row m-0">
                                    <div className="col-xl-4 text-center pl-0 pr-xl-3 pr-0 mb-4">
                                        <div className="profile-image-card">
                                            <div className={!match ? "no-animate profile-image" : "profile-image"}>
                                                {image && <Avatar alt={data.first_name} className='text-capitalize img text-center' src={image} onClick={() => ref.current?.click()} />}
                                                {match &&
                                                    <input type="file" accept="image/png, image/jpg, image/jpeg" ref={ref} className="d-none" onChange={imageChange} />
                                                }
                                            </div>
                                            <h2 className="user-name mt-3">{data.first_name && data.first_name.concat(" ", data.last_name)}</h2>
                                            <h4 className="mb-1">{data && data.designation ? data.designation.name : <AiOutlineMinus />}</h4>
                                            <div className="doj text-muted mb-1">Date of Join :  {dateFormat(data.joining_date)}</div>
                                            <div className="staff-id">Employee ID : {data.employee_id}</div>
                                        </div>
                                    </div>
                                    <div className="col-xl-8 pl-0 pl-xl-3 pr-0">
                                        <div className=" grid-margin stretch-card inner-pages mb-lg-0 tab-view">
                                            <div className="card modal-content profile_tabs">
                                                <div className="modal-header employee-form">
                                                    <Tabs
                                                        value={value}
                                                        onChange={changeTab}
                                                        variant="scrollable"
                                                        scrollButtons
                                                        allowScrollButtonsMobile
                                                        aria-label="scrollable force tabs example"
                                                        className='profile-tab-header'
                                                    >
                                                        <Tab value="Personal" label="Personal Info." className="tab-panel-button" />
                                                        <Tab value="Account" label="Account Info." className="tab-panel-button" />
                                                        <Tab value="Education" label="Education Info." className="tab-panel-button" />
                                                        <Tab value="Document" label="Document Info." className="tab-panel-button" />
                                                        <Tab value="Company" label="Company Info." className="tab-panel-button" />
                                                        <Tab value="Emergency" label="Emergency Contact Info." className="tab-panel-button" />
                                                        {match &&
                                                            <Tab value="password" label="Change Password" className="tab-panel-button" />}
                                                    </Tabs>
                                                </div>
                                                <div className="modal-header-none">
                                                    <Dropdown>
                                                        <Dropdown.Toggle className="btn btn-secondary" id="profile-dropdown">
                                                            {value === "password" ? "Change Password" : value + " Details"} <i className="fa-solid fa-chevron-down"></i>
                                                        </Dropdown.Toggle>
                                                        <Dropdown.Menu>
                                                            <Dropdown.Item onClick={() => handleChanges("Personal")}>Personal Info.</Dropdown.Item>
                                                            <Dropdown.Item onClick={() => handleChanges("Account")}>Account Info.</Dropdown.Item>
                                                            <Dropdown.Item onClick={() => handleChanges("Education")}>Education Info.</Dropdown.Item>
                                                            <Dropdown.Item onClick={() => handleChanges("Document")}>Document Info.</Dropdown.Item>
                                                            <Dropdown.Item onClick={() => handleChanges("Company")}>Company Info.</Dropdown.Item>
                                                            <Dropdown.Item onClick={() => handleChanges("Emergency")}>Emergency Contact Info.</Dropdown.Item>
                                                            {match &&
                                                                <Dropdown.Item onClick={() => handleChanges("password")}>Change Password</Dropdown.Item>}
                                                        </Dropdown.Menu>
                                                    </Dropdown>
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
                                                                                    {match && <NavLink onClick={() => handleShow("Personal")} className="edit-icon" data-bs-toggle="modal" data-bs-target="#personal_info_modal"><i className="fa fa-pencil"></i></NavLink>}
                                                                                </h3>
                                                                                <ul className="personal-info">
                                                                                    <li>
                                                                                        <div className="title">Name:</div>
                                                                                        <div className="text">{data.first_name && data.first_name.concat(" ", data.last_name)}</div>
                                                                                    </li>
                                                                                    <li>
                                                                                        <div className="title">Phone:</div>
                                                                                        <div className="text"><a href={`tel:${data.phone}`}>{data.phone}</a></div>
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
                                                                                        {data.date_of_birth ? <div className="text">{dateFormat(data.date_of_birth)}</div>
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
                                                                                    {match && <NavLink onClick={() => handleShow("Account")} className="edit-icon" data-bs-toggle="modal" data-bs-target="#personal_info_modal"><i className="fa fa-pencil"></i></NavLink>}
                                                                                </h3>
                                                                                {data.account_detail.length !== 0 ?
                                                                                    <ul className="personal-info">
                                                                                        <li>
                                                                                            <div className="title">Name</div>
                                                                                            <div className="text">{data.account_detail.length !== 0 ? data.account_detail[0].name : <AiOutlineMinus />}</div>
                                                                                        </li>
                                                                                        <li>
                                                                                            <div className="title">Bank name</div>
                                                                                            <div className="text">{data.account_detail[0].bank_name}</div>
                                                                                        </li>
                                                                                        <li>
                                                                                            <div className="title">Branch name</div>
                                                                                            <div className="text">{data.account_detail[0].branch_name}</div>
                                                                                        </li>
                                                                                        <li>
                                                                                            <div className="title">Account Number</div>
                                                                                            <div className="text">{data.account_detail[0].account_number}</div>
                                                                                        </li>
                                                                                        <li>
                                                                                            <div className="title">IFSC Code</div>
                                                                                            <div className="text">{data.account_detail[0].ifsc_code}</div>
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
                                                                                        {match && <NavLink onClick={() => handleShow("Education")} className="edit-icon" data-bs-toggle="modal" data-bs-target="#personal_info_modal"><i className="fa fa-pencil"></i></NavLink>}
                                                                                    </h3>
                                                                                    {data.education && data.education.length > 0 ?
                                                                                        <div className="experience-box">
                                                                                            <ul className="experience-list pl-0">
                                                                                                {data.education.map((val) => {
                                                                                                    return (
                                                                                                        <li key={val._id}>
                                                                                                            <div className="experience-content">
                                                                                                                <p className="name mb-0 font-weight-bold" style={{ fontSize: "16px" }}>{val.university_name}</p>
                                                                                                                <div className="timeline-content ml-4">
                                                                                                                    <div>{val.degree}</div>
                                                                                                                    <span className="time">{val.percentage}</span>
                                                                                                                    <span className="time">{val.year}</span>
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
                                                                                                    <div className="title">Designation</div>
                                                                                                    <div className="text">{data?.designation ? data.designation.name : <AiOutlineMinus />}</div>
                                                                                                </li>
                                                                                                <li>
                                                                                                    <div className="title">User Role</div>
                                                                                                    <div className="text">{data?.role ? data.role.name : <AiOutlineMinus />}</div>
                                                                                                </li>
                                                                                                <li>
                                                                                                    <div className="title">Joining Date</div>
                                                                                                    {data.joining_date ?
                                                                                                        <div className="text"> {dateFormat(data.joining_date)}</div> :
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
                                                                                                {match && <NavLink onClick={() => handleShow("Document")} className="edit-icon" data-bs-toggle="modal" data-bs-target="#personal_info_modal"><i className="fa fa-pencil"></i></NavLink>}
                                                                                            </h3>
                                                                                            {data.user_document.length > 0 ?
                                                                                                <div className='d-flex'>
                                                                                                    {data.user_document[0].photo &&
                                                                                                        <NavLink to={`${process.env.REACT_APP_IMAGE_API}/uploads/${data.user_document[0].photo}`} target='_blank' className="mr-3 text-decoration-none">
                                                                                                            <img
                                                                                                                className='mt-1 '
                                                                                                                style={{ width: '70px', height: '70px' }}
                                                                                                                src={(data.user_document[0]?.photo?.split(".")?.pop() !== 'doc' && data.user_document[0].photo?.split(".").pop() !== "pdf") ? `${process.env.REACT_APP_IMAGE_API}/uploads/${data.user_document[0].photo}` : data.user_document[0].joining_letter?.split(".").pop() === 'doc' ? '/Images/doc.png' : '/Images/pdf.png'}
                                                                                                                alt="file"
                                                                                                            />
                                                                                                            <p className='document-title'> Photo</p>
                                                                                                        </NavLink>}
                                                                                                    {data.user_document[0].aadhar_card &&
                                                                                                        <NavLink to={`${process.env.REACT_APP_IMAGE_API}/uploads/${data.user_document[0].aadhar_card}`} target='_blank' className="mr-3 text-decoration-none">
                                                                                                            <img
                                                                                                                className='mt-1 '
                                                                                                                style={{ width: '70px', height: '70px' }}
                                                                                                                src={(data.user_document[0].aadhar_card.split(".").pop() !== 'doc' && data.user_document[0].aadhar_card.split(".").pop() !== "pdf") ? `${process.env.REACT_APP_IMAGE_API}/uploads/${data.user_document[0].aadhar_card}` : data.user_document[0].aadhar_card.split(".").pop() === 'doc' ? '/Images/doc.png' : '/Images/pdf.png'}
                                                                                                                alt="file"
                                                                                                            />
                                                                                                            <p className='document-title'>Aadhar Card</p>
                                                                                                        </NavLink>}
                                                                                                    {data.user_document[0].pan_card &&
                                                                                                        <NavLink to={`${process.env.REACT_APP_IMAGE_API}/uploads/${data.user_document[0].pan_card}`} target='_blank' className="mr-3 text-decoration-none">
                                                                                                            <img
                                                                                                                className='mt-1 '
                                                                                                                style={{ width: '70px', height: '70px' }}
                                                                                                                src={(data.user_document[0].pan_card.split(".").pop() !== 'doc' && data.user_document[0].pan_card.split(".").pop() !== "pdf") ? `${process.env.REACT_APP_IMAGE_API}/uploads/${data.user_document[0].pan_card}` : data.user_document[0].pan_card.split(".").pop() === 'doc' ? '/Images/doc.png' : '/Images/pdf.png'}
                                                                                                                alt="file"
                                                                                                            />
                                                                                                            <p className='document-title'> Pan Card</p>
                                                                                                        </NavLink>}
                                                                                                    {data.user_document[0].offer_letter &&
                                                                                                        <NavLink to={`${process.env.REACT_APP_IMAGE_API}/uploads/${data.user_document[0].offer_letter}`} target='_blank' className="mr-3 text-decoration-none">
                                                                                                            <img
                                                                                                                className='mt-1'
                                                                                                                style={{ width: '70px', height: '70px' }}
                                                                                                                src={(data.user_document[0].offer_letter.split(".").pop() !== 'doc' && data.user_document[0].offer_letter.split(".").pop() !== "pdf") ? `${process.env.REACT_APP_IMAGE_API}/uploads/${data.user_document[0].offer_letter}` : data.user_document[0].offer_letter.split(".").pop() === 'doc' ? '/Images/doc.png' : '/Images/pdf.png'}
                                                                                                                alt="file"
                                                                                                            />
                                                                                                            <p className='document-title'> Offer letter</p>
                                                                                                        </NavLink>}
                                                                                                    {data.user_document[0].resume &&
                                                                                                        <NavLink to={`${process.env.REACT_APP_IMAGE_API}/uploads/${data.user_document[0].resume}`} target='_blank' className="mr-3 text-decoration-none">
                                                                                                            <img
                                                                                                                className='mt-1 '
                                                                                                                style={{ width: '70px', height: '70px' }}
                                                                                                                src={(data.user_document[0].resume.split(".").pop() !== 'doc' && data.user_document[0].resume.split(".").pop() !== "pdf") ? `${process.env.REACT_APP_IMAGE_API}/uploads/${data.user_document[0].resume}` : data.user_document[0].resume.split(".").pop() === 'doc' ? '/Images/doc.png' : '/Images/pdf.png'}
                                                                                                                alt="file"
                                                                                                            />
                                                                                                            <p className='document-title'> Resume</p>
                                                                                                        </NavLink>}
                                                                                                    {data.user_document[0].other &&
                                                                                                        <NavLink to={`${process.env.REACT_APP_IMAGE_API}/uploads/${data.user_document[0].other}`} target='_blank' className="mr-3 text-decoration-none">
                                                                                                            <img
                                                                                                                className='mt-1 '
                                                                                                                style={{ width: '70px', height: '70px' }}
                                                                                                                src={(data.user_document[0].other.split(".").pop() !== 'doc' && data.user_document[0].other.split(".").pop() !== "pdf") ? `${process.env.REACT_APP_IMAGE_API}/uploads/${data.user_document[0].other}` : data.user_document[0].other.split(".").pop() === 'doc' ? '/Images/doc.png' : '/Images/pdf.png'}
                                                                                                                alt="file"
                                                                                                            />
                                                                                                            <p className='document-title'> Other</p>
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
                                                                                                    {match && <NavLink onClick={() => handleShow("Emergency Contact")} className="edit-icon" data-bs-toggle="modal" data-bs-target="#personal_info_modal"><i className="fa fa-pencil"></i></NavLink>}
                                                                                                </h3>
                                                                                                {data.emergency_contact.length > 0 ?
                                                                                                    <ul className="personal-info">
                                                                                                        <li>
                                                                                                            <div className="title">Name</div>
                                                                                                            <div className="text">{data?.emergency_contact[0].name}</div>
                                                                                                        </li>
                                                                                                        <li>
                                                                                                            <div className="title">Relationship</div>
                                                                                                            <div className="text">{data.emergency_contact[0].relationship ? data.emergency_contact[0].relationship : <HiOutlineMinus />}</div>
                                                                                                        </li>
                                                                                                        <li>
                                                                                                            <div className="title">Email </div>
                                                                                                            <div className="text">{data?.emergency_contact[0].email}</div>
                                                                                                        </li>
                                                                                                        <li>
                                                                                                            <div className="title">Address </div>
                                                                                                            <div className="text">{data?.emergency_contact[0].address}</div>
                                                                                                        </li>
                                                                                                        <li>
                                                                                                            <div className="title">Phone </div>
                                                                                                            <div className="text">{data?.emergency_contact[0].phone}</div>
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
                                </div>
                            </div>
                        </div>
                    </div>
                </div > : <Error403 />
            }
            <EmployeeModal show={show} handleClose={handleClose} value={Value} data={data} getuser={getUserData} />
        </>
    )
}


export default EmployeeViewComponent;