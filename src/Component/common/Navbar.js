import React, { useContext, useLayoutEffect, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import { Globalcomponent } from '../auth_context/GlobalComponent';
import { AppProvider } from '../context/RouteContext';
import { GetLocalStorage } from '../../service/StoreLocalStorage';
import Avatar from '@mui/material/Avatar';
import Spinner from './Spinner';
import Notification from './Notification';
// import { Trans } from 'react-i18next';

const Navbar = () => {
  // initialistate 
  const [sidebar, setsidebar] = useState(false);
  // page redirect
  let history = useNavigate();
  // Global state
  let { handleLogout, loading } = Globalcomponent();
  let { UserData,  getLeaveNotification, getUserData, setSidebarToggle, sidebarToggle, sidebarRef, setlogoToggle, Loading } = useContext(AppProvider);

  // mobile screen toggle sidebar 
  const toggleOffcanvas = () => {
    setSidebarToggle(!sidebarToggle)
  }
 
  // sidebar toggle in localstorage
  useEffect(() => {
    const data = localStorage.getItem("sidebarToggle")

    if (!data || data === 'false') {
      document.body.classList.remove('sidebar-icon-only');
      setlogoToggle(true)
    } else {
      document.body.classList.add('sidebar-icon-only');
      setlogoToggle(false)
    }
    // eslint-disable-next-line
  }, [sidebar])

  // get user data for Login
  useLayoutEffect(() => {
    if (GetLocalStorage("token")) {
      getUserData();
    }
    // eslint-disable-next-line
  }, [])

  // get leave notification
  useEffect(() => {
    if (GetLocalStorage("token") && UserData && UserData?.role?.name.toLowerCase() === "admin") {
      getLeaveNotification();
    }
    // eslint-disable-next-line
  }, [UserData])


  return (
    <nav className="navbar default-layout-navbar sticky-top">
      <div className="navbar-menu-wrapper d-flex align-items-stretch">
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
          {(UserData && UserData.role && UserData.role.name.toLowerCase() === 'admin') && <Notification />}

          {/* profile drop drown */}
          <li className="nav-item nav-profile">
            <Dropdown alignRight>
              <Dropdown.Toggle className="nav-link" >
                <div className="nav-profile-img">
                  {UserData.profile_image && <Avatar alt={UserData.first_name} className='text-capitalize' src={`${UserData.profile_image && process.env.REACT_APP_IMAGE_API}/${UserData.profile_image}`} sx={{ width: 30, height: 30 }} />}
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
                <Dropdown.Divider />
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
      {(loading || Loading) && <Spinner />}
    </nav>
  );
}

export default Navbar;
