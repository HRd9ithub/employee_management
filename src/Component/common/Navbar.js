import React, { useContext, useLayoutEffect } from 'react';
import { Dropdown } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { Globalcomponent } from '../auth_context/GlobalComponent';
import { AppProvider } from '../context/RouteContext';
import { useEffect } from 'react';
import Spinner from './Spinner';
import { toast } from 'react-hot-toast';
import { FaAngleDown, FaAngleLeft } from "react-icons/fa";
import { useState } from 'react';
import { HiOutlineMinus } from "react-icons/hi";
import GlobalPageRedirect from '../auth_context/GlobalPageRedirect';
import { GetLocalStorage } from '../../service/StoreLocalStorage';
import Avatar from '@mui/material/Avatar';
import { customAxios } from '../../service/CreateApi';
import { timeAgo } from '../../helper/dateFormat';
import moment from 'moment';
// import { Trans } from 'react-i18next';

const Navbar = () => {
  let { handleLogout, loading } = Globalcomponent()
  let { UserData, leaveNotification, getLeaveNotification, getUserData, getLeave, reportRequest, setSidebarToggle, sidebarToggle, sidebarRef, setlogoToggle } = useContext(AppProvider);
  const [dropdownbtnToggle, setdropdownbtnToggle] = useState(false);
  const [dropdownbtnToggleTwo, setdropdownbtnToggleTwo] = useState(false);
  const [sidebar, setsidebar] = useState(false);
  const [isLoading, setisLoading] = useState(false);

  let { pathname } = useLocation();

  const toggleOffcanvas = () => {
    setSidebarToggle(!sidebarToggle)
  }

  let { getCommonApi } = GlobalPageRedirect();

  useEffect(() => {
    // HandleButton()
    let data = localStorage.getItem("sidebarToggle")

    if (!data || data === 'false') {
      document.body.classList.remove('sidebar-icon-only');
      setlogoToggle(true)
    } else {
      document.body.classList.add('sidebar-icon-only');
      setlogoToggle(false)
    }
    // eslint-disable-next-line
  }, [sidebar])

  useLayoutEffect(() => {
    getUserData();
    // eslint-disable-next-line
  }, [])

  // get leave notification
  useEffect(() => {
    if (GetLocalStorage("token") && UserData && UserData.role && UserData.role?.name.toLowerCase() === "admin") {
      getLeaveNotification();
    }
    // eslint-disable-next-line
  }, [UserData])

  // page redirect
  let history = useNavigate();

  // leave status change
  const changeStatus = async (id) => {
    try {
      setisLoading(true);
      const res = await customAxios().patch(`/leave/${id}`, { status: "Read" })
      if (res.data.success) {
        setisLoading(false);
        if (pathname === "/leave") {
          getLeave();
        } else {
          history('/leave')
        }
      }
    } catch (error) {
      setisLoading(false)
      if (!error.response) {
        toast.error(error.message)
      } else if (error.response.status === 401) {
        getCommonApi();
      } else {
        if (error.response.data.message) {
          toast.error(error.response.data.message)
        }
      }
    }
  }

  // view all click
  const allStatusChange = async () => {
    try {
      setisLoading(true);
      const res = await customAxios().post('/leave/status');
      if (res.data.success) {
        if (pathname === "/leave") {
          getLeave();
        } else {
          history('/leave')
        }
        setisLoading(false)
      }
    } catch (error) {
      setisLoading(false)
      if (!error.response) {
        toast.error(error.message)
      } else if (error.response.status === 401) {
        getCommonApi();
      } else {
        if (error.response.data.message) {
          toast.error(error.response.data.message)
        }
      }
    }
  }

  // ! report request delete api
  const handleDeleteRequestReportClick = async (id) => {
    try {
      setisLoading(true);
      const res = await customAxios().delete(`/report_request/${id}`)
      if (res.data.success) {
        setisLoading(false);
        getLeaveNotification();
        history('/work-report')
      }
    } catch (error) {
      setisLoading(false)
      if (!error.response) {
        toast.error(error.message)
      } else if (error.response.status === 401) {
        getCommonApi();
      } else {
        if (error.response.data.message) {
          toast.error(error.response.data.message)
        }
      }
    }
  }

  return (
    <nav className="navbar default-layout-navbar sticky-top">
      <div className="navbar-menu-wrapper d-flex align-items-stretch">
        {/* <img src='/Images/d9_logo_black.png' className='logo-none' alt="logo" /> */}
        <button className="navbar-toggler navbar-toggler align-self-center text-white" type="button" >
          <span className="mdi mdi-menu" onClick={() => {
            let data = localStorage.getItem("sidebarToggle")
            if (!data || data === 'false') {
              localStorage.setItem("sidebarToggle", true);
            } else {
              localStorage.setItem("sidebarToggle", false);
            }
            setsidebar(!sidebar)
          }}></span>
        </button>
        <ul className="navbar-nav navbar-nav-right">

          {/* notification drop drown */}
          {(UserData && UserData.role && UserData.role.name.toLowerCase() === 'admin') &&
            <li className="nav-item">
              <Dropdown alignRight>
                <Dropdown.Toggle className="nav-link count-indicator new-notification">
                  <i className="fa-solid fa-bell nav-icons"></i>
                  <span className="badge badge-light">{leaveNotification.length + reportRequest.length}</span>
                </Dropdown.Toggle>
                <Dropdown.Menu className="dropdown-menu navbar-dropdown preview-list px-2" style={{ width: "26rem" }} >
                  <h6 className="px-1 py-3 mb-0 new-message">Notifications</h6>
                  <div className="dropdown-divider"></div>
                  <div className="notification-list">
                    <div className="notification-item">
                      <div className="notification-content d-flex justify-content-start align-items-start">
                        <div>
                          <div className="notification-image">
                            <img src="./Images/download.png" alt="img" />
                          </div>
                        </div>
                        <div className="notification-details w-100">
                          <div className="w-100 d-flex justify-content-between align-items-center">
                            <p className='mb-0'>Leave Application</p>
                            <p className='mb-0 text-dark-secondary'>1min</p>
                          </div>
                          <p className='mt-1 mb-0 ellipsis text-dark-secondary'>Lorem ipsum dolor sit</p>
                          <p className='notifictaion-description mt-1 mb-0 text-dark-secondary'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Mollitia, pariatur reiciendis nulla quaerat facilis dolorem deleniti sapiente error quidem corporis quam? Debitis autem sint</p>
                        </div>
                      </div>
                    </div>
                    {/* <div className="notification-item-no-record">
                      <h5 className='text-center my-3 text-dark-secondary'>No Record Found</h5>
                    </div> */}
                  </div>
                  {leaveNotification.length > 0 && <>
                    <div className="dropdown-divider"></div>
                    <Dropdown.Item className="dropdown-item preview-item justify-content-center" onClick={evt => {
                      evt.preventDefault()
                      allStatusChange()
                    }}>
                      <div className="preview-item-content d-flex align-items-start flex-column justify-content-center">
                        <div className='d-flex justify-content-between' style={{ gap: "50px" }}>
                          <h6 className="preview-subject font-weight-normal mb-1">View all</h6>
                        </div>
                      </div>
                    </Dropdown.Item>
                  </>}
                </Dropdown.Menu>
              </Dropdown>
            </li>
          }
          {/* profile drop drown */}
          <li className="nav-item nav-profile">
            <Dropdown alignRight>
              <Dropdown.Toggle className="nav-link" >
                <div className="nav-profile-img">
                  {UserData && <Avatar alt={UserData.first_name} className='text-capitalize' src={`${UserData.profile_image && process.env.REACT_APP_IMAGE_API}/${UserData.profile_image}`} sx={{ width: 30, height: 30 }} />}
                  <span className="availability-status online"></span>
                </div>
                <div className="nav-profile-text">
                  <p className="mb-1 text-white text-capitalize">{UserData.first_name && UserData.first_name.concat(" ", UserData.last_name)}<i className="fa-solid fa-chevron-down"
                    style={{
                      fontSize: '12px',
                      marginLeft: '5px'
                    }}
                  ></i></p>
                </div>
              </Dropdown.Toggle>
              <Dropdown.Menu className="navbar-dropdown">
                <Dropdown.Item className='dropdown-item' onClick={() => history(`/profile/${UserData._id}`)}>
                  <i className="mdi mdi-account-circle mr-2 text-primary"></i>
                  Profile
                </Dropdown.Item>
                <div className="dropdown-divider"></div>
                <Dropdown.Item className='dropdown-item' onClick={handleLogout}>
                  <i className="mdi mdi-logout mr-2 text-primary"></i>
                  Sign Out
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </li>
        </ul>
        <button className="navbar-toggler navbar-toggler-right d-lg-none align-self-center text-white" ref={sidebarRef} type="button" onClick={toggleOffcanvas}>
          <span className="mdi mdi-menu sider-menu"></span>
        </button>
      </div>
      <div className="nav-standard">
      </div>
      {(isLoading || loading) && <Spinner />}
    </nav>
  );
}

export default Navbar;
