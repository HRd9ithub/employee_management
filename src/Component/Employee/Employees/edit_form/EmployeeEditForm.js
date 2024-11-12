import React, { useEffect, useState } from "react";
import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { useParams } from "react-router-dom";
import Spinner from "../../../common/Spinner";
import AccountForm from "../form_user/AccountForm";
import EductionForm from "../form_user/EductionForm";
import UserDoumentForm from "../form_user/userDoumentForm";
import EmergencyForm from "../form_user/EmergencyForm";
import { NavLink } from "react-router-dom";
import PersonalDetailForm from "../form_user/PersonalDetailForm";
import LeaveSettingComponent from "../../../setting/leave_setting/LeaveSettingComponent";
import { toast } from "react-hot-toast";
import LoginInfo from "../view/LoginInfo";
import Error403 from "../../../error_pages/Error403";
import Error500 from "../../../error_pages/Error500";
import { customAxios } from "../../../../service/CreateApi";
import { Dropdown } from "react-bootstrap";

const EmployeeEditForm = () => {
  const [value, setValue] = React.useState('Personal');
  const [userId, setUserId] = useState("");
  const [userDetail, setUserDetail] = useState("");
  const [permission, setpermission] = useState("");
  const [isLoading, setisLoading] = useState(true);
  const [serverError, setServerError] = useState(false);


  // drop down tab onchange function
  const handleChanges = (newValue) => {
    setValue(newValue);
  };

  // tabs onchange function
  const changeTab = (event, newValue) => {
    setValue(newValue);
  }

  // get prameters id
  let { id } = useParams();

  // get employee data for single
  const getEmployeeDetail = async () => {
    try {
      setServerError(false);
      setisLoading(true);
      let res = await customAxios().get(`/user/${id}`)

      if (res.data.success) {
        let result = await res.data.data;
        setpermission(res.data.permissions)
        setUserDetail(result);
        if (result) {
          setUserId(result._id);
        }
      }
    } catch (error) {
      if (!error.response) {
        setServerError(true);
        toast.error(error.message)
      } else {
        if (error.response.status === 500) {
          setServerError(true)
        }
        if (error.response.data.message) {
          toast.error(error.response.data.message)
        }
      }
    } finally { setisLoading(false) }
  }

  useEffect(() => {
    if (id) {
      getEmployeeDetail()
    }
    // eslint-disable-next-line
  }, [id])

  if (isLoading) {
    return <Spinner />;
  }

  if (serverError) {
    return <Error500 />;
  }

  if (!permission || permission.permissions.update === 0) {
    return <Error403 />;
  }

  return (
    <>
      <div className="container-fluid p-4">
        <div className="background-wrapper bg-white">
          <div className='row justify-content-start align-items-center row-std remove-margin-bottom m-0 px-4'>
            <div className="col-12 col-sm-6 d-flex justify-content-between align-items-center p-0">
              <div>
                <ul id="breadcrumb" className="mb-0">
                  <li><NavLink to="/" className="ihome">Dashboard</NavLink></li>
                  <li><NavLink to="/employees" className="ibeaker"><i className="fa-solid fa-play"></i> &nbsp; Employee</NavLink></li>
                  <li><NavLink to="" className="ibeaker"><i className="fa-solid fa-play"></i> &nbsp;Edit</NavLink></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="grid-margin stretch-card inner-pages mb-lg-0 tab-view">
            <div className="card">
              {/* ............................Header one.......................... */}
              <div className="modal-header employee-form">
                <Tabs
                  value={value}
                  onChange={changeTab}
                  aria-label="secondary tabs example"
                >
                  <Tab value="Personal" label="Personal Information" className="tab-panel-button" />
                  <Tab value="Account" label="Account Information" className="tab-panel-button" />
                  <Tab value="Education" label="Education Information" className="tab-panel-button" />
                  <Tab value="Document" label="Document Information" className="tab-panel-button" />
                  <Tab value="Emergency" label="Emergency Contact Information" className="tab-panel-button" />
                  <Tab value="login" label="Login Information" className="tab-panel-button" />
                  <Tab value="leave-setting" label="Leave Setting" className="tab-panel-button" />
                </Tabs>
              </div>

              {/* ............................Header two.......................... */}
              <div className="modal-header-none">
                <Dropdown>
                  <Dropdown.Toggle className="btn btn-secondary" id="profile-dropdown">
                    {value && value + " Information"} <i className="fa-solid fa-chevron-down"></i>
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => handleChanges("Personal")}>Personal Information</Dropdown.Item>
                    <Dropdown.Item onClick={() => handleChanges("Account")}>Account Information</Dropdown.Item>
                    <Dropdown.Item onClick={() => handleChanges("Education")}>Education Information</Dropdown.Item>
                    <Dropdown.Item onClick={() => handleChanges("Document")}>Document Information</Dropdown.Item>
                    <Dropdown.Item onClick={() => handleChanges("Emergency")}>Emergency Contact Information</Dropdown.Item>
                    <Dropdown.Item onClick={() => handleChanges("login")}>Login Information</Dropdown.Item>
                    <Dropdown.Item onClick={() => handleChanges("leave-setting")}>Leave Setting</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>

              <div className="card-body">
                {value === "Personal" ?
                  <PersonalDetailForm userDetail={userDetail} getEmployeeDetail={getEmployeeDetail} permission={permission?.name?.toLowerCase() === "admin"} />
                  : value === "Account" ?
                    <AccountForm
                      userDetail={userDetail}
                      userId={userId}
                      getEmployeeDetail={getEmployeeDetail}
                    />
                    : value === "Education" ?
                      <EductionForm
                        userDetail={userDetail}
                        getEmployeeDetail={getEmployeeDetail}
                        userId={userId}
                      /> :
                      value === "Document" ?
                        <UserDoumentForm
                          userDetail={userDetail}
                          getEmployeeDetail={getEmployeeDetail}
                          userId={userId} />
                        : value === "login" ?
                          <LoginInfo userId={userId} />
                          :
                          value === "leave-setting" ?
                            <LeaveSettingComponent userId={userId} />
                            :
                            <EmergencyForm
                              userDetail={userDetail}
                              getEmployeeDetail={getEmployeeDetail}
                              userId={userId} />
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default EmployeeEditForm;
