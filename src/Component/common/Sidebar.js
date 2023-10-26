import React, { useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Collapse } from 'react-bootstrap';
// import { Trans } from 'react-i18next';
import { useState } from 'react';
import { useContext } from 'react';
import { AppProvider } from '../context/RouteContext';
import Spinner from './Spinner';
import { GetLocalStorage } from '../../service/StoreLocalStorage';
import { toast } from 'react-hot-toast';
import GlobalPageRedirect from '../auth_context/GlobalPageRedirect';
import { useMemo } from 'react';
import { customAxios } from '../../service/CreateApi';

const Sidebar = () => {
  const [data, setData] = useState({});
  const [menu, setMenu] = useState([]);
  const [isLoading, setisLoading] = useState(false);
  const [widthTogle, setWidthToggle] = useState("")
  let { UserData, setSidebarToggle, sidebarToggle, sidebarRef, logoToggle } = useContext(AppProvider)

  let { getCommonApi } = GlobalPageRedirect();

  let location = useLocation()

  let menuref = useRef(null);
  let leaveref = useRef(null);
  let settingref = useRef(null);

  // eslint-disable-next-line
  useEffect(() => {
    if (window.innerWidth < 992) {
      document.body.classList.remove('sidebar-icon-only');
    } else {
      if (!logoToggle) {
        document.body.classList.add('sidebar-icon-only');
      }
    }
    let data = document.getElementsByClassName('sidebar-icon-only');
    if (data.length !== 0) {
      setWidthToggle(false)
    } else {
      setWidthToggle(true)
    }
  })

  const getMenu = async () => {
    try {
      setisLoading(true);
      const res = await customAxios().get('/menu');

      if (res.data.success) {
        let { data } = res.data
        setMenu(data)
      }
    } catch (error) {
      if (!error.response) {
        toast.error(error.message)
      } else if (error.response.status === 401) {
        getCommonApi();
      } else if (error.response.data.message) {
        toast.error(error.response.data.message)
      }
    } finally {
      setisLoading(false);
    }
  }


  // hover effect
  useEffect(() => {
    if (GetLocalStorage("token")) {
      getMenu();
    }
    // add class 'hover-open' to sidebar navitem while hover in sidebar-icon-only menu
    const body = document.querySelector('body');
    document.querySelectorAll('.sidebar .nav-item').forEach((el) => {

      el.addEventListener('mouseover', function () {
        if (body.classList.contains('sidebar-icon-only')) {
          el.classList.add('hover-open');
        }
      });
      el.addEventListener('mouseout', function () {
        if (body.classList.contains('sidebar-icon-only')) {
          el.classList.remove('hover-open');
        }
      });
    });
    // eslint-disable-next-line
  }, [])

  // submenu togle in click
  const toggleMenuState = (menuState) => {
    const iconValue = document.getElementsByClassName('sidebar-icon-only');
    if (iconValue.length === 0) {
      if (data[menuState]) {
        setData({ [menuState]: false });
      } else if (Object.keys(data).length === 0) {
        setData({ [menuState]: true });
      } else {
        Object.keys(data).forEach(i => {
          setData({ [i]: false });
        });
        setData({ [menuState]: true });
      }
    }
  }

  let submenu = []

  const HandleACtive = (name) => {
    if (name === 'employee') {
      submenu = ['employees', 'project', 'designation', 'premission']
    } else if (name === 'leave') {
      submenu = ['holiday', 'leave-type', 'leave']
    } else if (name === "setting") {
      submenu = ['user-role', 'work-report']
    }
    const response = submenu.filter((val) => {
      return val === location.pathname.toLowerCase().slice(1)
    })
    return response.length !== 0 ? true : false
  }

  const toggleSidebar = () => {
    document.querySelector('.sidebar-offcanvas').classList.remove('active')
    setSidebarToggle(!sidebarToggle)
  }


  const showSidebar = () => {
    const body = document.querySelector('body');
    document.querySelectorAll('.sidebar .nav-item').forEach((el) => {

      el.addEventListener('mouseover', function () {
        if (body.classList.contains('sidebar-icon-only')) {
          el.classList.add('hover-open');
        }
      });
      el.addEventListener('mouseout', function () {
        if (body.classList.contains('sidebar-icon-only')) {
          el.classList.remove('hover-open');
        }
      });
    });
  }

  // employee drop down display or not 
  let employee = useMemo(() => {
    let submenu = ['employees', 'project', 'designation']
    let response = ""
    if (UserData && UserData.role && UserData.role.name.toLowerCase() === 'admin') {
      response = true
    } else {
      response = menu.some((val) => {
        return submenu.includes(val.name.toLowerCase())
      })
    }
    return response
    // eslint-disable-next-line
  }, [menu])

  // leave drop down display or not 
  let leave = useMemo(() => {
    let submenu = ['holiday', 'leavetype', 'leaves']
    let response = ""
    if (UserData && UserData.role && UserData.role.name.toLowerCase() === 'admin') {
      response = true
    } else {
      response = menu.some((val) => {
        return submenu.includes(val.name.toLowerCase())
      })
    }
    return response
    // eslint-disable-next-line
  }, [menu])

  // leave drop down display or not 
  let setting = useMemo(() => {
    let submenu = ['user role', "work report"]
    let response = ""
    if (UserData && UserData.role && UserData.role.name.toLowerCase() === 'admin') {
      response = true
    } else {
      response = menu.some((val) => {
        return submenu.includes(val.name.toLowerCase())
      })
    }
    return response
    // eslint-disable-next-line
  }, [menu])


  useEffect(() => {
    const toggleSidebars = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target) && leaveref.current && !leaveref.current.contains(e.target)) {
        if (UserData && UserData.role && UserData.role.name.toLowerCase() === 'admin') {
          menuref.current && !menuref.current.contains(e.target) && settingref.current && !settingref.current.contains(e.target) && setSidebarToggle(false);
        } else {
          if (employee && menuref.current && !menuref.current.contains(e.target)) {
            setSidebarToggle(false);
          }
          if (setting && settingref.current && !settingref.current.contains(e.target)) {
            setSidebarToggle(false);
          } else {
            setSidebarToggle(false);
          }
        }
      }
    }
    document.addEventListener("mousedown", toggleSidebars);
    return () => {
      document.removeEventListener("mousedown", toggleSidebars);
    };
    // eslint-disable-next-line
  }, [sidebarRef, UserData]);




  return (
    <>
      <nav className={`sidebar sidebar-offcanvas ${sidebarToggle ? "active" : ""}`} id="sidebar" ref={sidebarRef}>
        <div className="text-center navbar-brand-wrapper d-flex align-items-center justify-content-center">
          {widthTogle ?
            <Link className="navbar-brand brand-logo " to="/"><img src='/Images/d9_logo_black.png' alt="logo" /></Link> :
            <Link className="navbar-brand brand-logo-mini" to="/"><img src='/Images/d9.jpg' alt="logo" width={53} height={45} /></Link>}
        </div>
        <ul className="nav mt-2" style={{marginTop: '0.2rem'}}>
          {/* dashboard */}
          <li className={`nav-item item-hover ${window.location.pathname.toLowerCase() === '/' && 'active'}`} onClick={() => {
            setData({})
            toggleSidebar();
          }} >
            {menu.map((elem) => {
              return (
                elem.name.toLowerCase().replace(/\s/g, '') === 'dashboard' &&
                <NavLink key={elem._id} className="nav-link" to="/">
                  <i className={`fa-solid fa-house slider-hover-icon dashboard-icon `} style={{ color: "#bba8bff5", fontSize: '15px' }}></i>
                  <span className={`menu-title`}>{elem.name}</span>
                </NavLink>
              )
            })}
          </li>
          {/* employee */}
          {employee &&
            <li ref={menuref} className={`nav-item item-hover  ${(HandleACtive('employee') || location.pathname.slice("1").toLowerCase().includes("employees/view") || location.pathname.slice("1").toLowerCase().includes("employees/edit")) && 'active'}`} onMouseEnter={showSidebar} >
              <div className={data.basicUiMenuOpen ? 'nav-link menu-expanded' : 'nav-link'} data-toggle="collapse" onClick={() => toggleMenuState('basicUiMenuOpen')}>
                <i className={`fa-solid fa-user slider-hover-icon employee-icon`} style={{
                  color: "#bba8bff5", fontSize: '15px'
                }}></i>
                <span className={`menu-title`}>Employee</span>
                <i className={`menu-arrow`}></i>
              </div>
              <Collapse in={data.basicUiMenuOpen}>
                <ul className="nav flex-column sub-menu">
                  {menu.map((elem) => {
                    return (
                      (elem.name.toLowerCase().replace(/\s/g, '') === 'employees' || elem.name.toLowerCase().replace(/\s/g, '') === 'project' || elem.name.toLowerCase().replace(/\s/g, '') === 'designation') &&
                      <div key={elem._id}>
                        {elem.name.toLowerCase().replace(/\s/g, '') === 'employees' && <li className="nav-item"  > <NavLink className="nav-link navlink-inner" to={elem.path}>{elem.name}</NavLink></li>}
                        {elem.name.toLowerCase().replace(/\s/g, '') === 'project' && <li className="nav-item" > <NavLink className="nav-link navlink-inner" to={elem.path}>{elem.name}</NavLink></li>}
                        {elem.name.toLowerCase().replace(/\s/g, '') === 'designation' && <li className="nav-item" > <NavLink className="nav-link navlink-inner" to={elem.path}>{elem.name}</NavLink></li>}
                      </div>
                    )
                  })}
                </ul>
              </Collapse>
            </li>}
          {/* leave */}
          {leave &&
            <li ref={leaveref} className={`nav-item item-hover  ${HandleACtive('leave') ? 'active' : ''}`} onMouseEnter={showSidebar}>
              <div className={data.leave ? 'nav-link menu-expanded' : 'nav-link'} onClick={() => toggleMenuState('leave')} data-toggle="collapse">
                <i className={`fa-regular fa-calendar slider-hover-icon leave-icon `} style={{ color: "#fff", fontSize: '15px' }}></i>
                <span className={`menu-title`}>Leave</span>
                <i className={`menu-arrow`}></i>
              </div>
              <Collapse in={data.leave}>
                <ul className="nav flex-column sub-menu">
                  {menu.map((elem) => {
                    return (
                      (elem.name.toLowerCase().replace(/\s/g, '') === 'leaves' || elem.name.toLowerCase().replace(/\s/g, '') === 'leavetype' || elem.name.toLowerCase().replace(/\s/g, '') === 'holiday') &&
                      <div key={elem._id}>
                        {elem.name.toLowerCase().replace(/\s/g, '') === 'leaves' && <li className="nav-item" > <NavLink className="nav-link" to="/leave">{elem.name}</NavLink></li>}
                        {elem.name.toLowerCase().replace(/\s/g, '') === 'leavetype' && <li className="nav-item" > <NavLink className="nav-link" to="/leave-type">{elem.name.slice(0, 5)} {elem.name.slice(5)}</NavLink></li>}
                        {elem.name.toLowerCase().replace(/\s/g, '') === 'holiday' && <li className="nav-item" > <NavLink className="nav-link" to="/holiday">{elem.name}</NavLink></li>}
                      </div>
                    )
                  })}
                </ul>
              </Collapse>
            </li>}
          {/* timesheet */}
          <li className={`nav-item item-hover ${window.location.pathname.toLowerCase() === '/time-sheet' && 'active'} `} onClick={() => setData({})} >
            {menu.map((elem) => {
              return (
                elem.name.toLowerCase().replace(/\s/g, '') === 'timesheet' &&
                <NavLink key={elem._id} className="nav-link" to="/time-sheet" onClick={toggleSidebar}>
                  <i className={`fa-solid fa-clock slider-hover-icon timesheet-icon`} style={{ color: "#bba8bff5", fontSize: '15px' }}></i>
                  <span className={`menu-title`}>{elem.name.slice(0, 4)} {elem.name.slice(4)}</span>
                </NavLink>)
            })}
          </li>
          {/* document */}
          <li className={`nav-item item-hover  ${window.location.pathname.toLowerCase() === '/documents' && 'active'}`} onClick={() => setData({})}>
            {menu.map((elem) => {
              return (
                elem.name.toLowerCase().replace(/\s/g, '') === 'document' &&
                <NavLink key={elem._id} className="nav-link" to="/documents" onClick={toggleSidebar}>
                  <i className={`fa-solid fa-book slider-hover-icon document-icon`} style={{ color: "#bba8bff5", fontSize: '15px' }}></i>
                  <span className={`menu-title`}>{elem.name}</span>
                </NavLink>
              )
            })}
          </li>
          {/* activity */}
          <li className={`nav-item item-hover  ${window.location.pathname.toLowerCase() === '/activity' && 'active'}`} onClick={() => setData({})}>
            {menu.map((elem) => {
              return (
                elem.name.toLowerCase().replace(/\s/g, '') === 'activitylogs' &&
                <NavLink key={elem._id} className="nav-link" to="/activity" onClick={toggleSidebar}>
                  <i className={`fa-solid fa-clock-rotate-left slider-hover-icon activity-icon`} style={{ color: "#bba8bff5", fontSize: '15px' }}></i>
                  <span className={`menu-title`}>{elem.name}</span>
                </NavLink>
              )
            })}
          </li>
          {/* setting */}
          {setting &&
            <li ref={settingref} className={`nav-item item-hover  ${HandleACtive('setting') && 'active'}`} onMouseEnter={showSidebar}>
              <div className={data.setting ? 'nav-link menu-expanded' : 'nav-link'} onClick={() => toggleMenuState('setting')} data-toggle="collapse">
                <i className={`fa-solid fa-gear slider-hover-icon email-icon`} style={{
                  color: "#bba8bff5", fontSize: '15px'
                }}></i>
                <span className={`menu-title`}>Setting</span>
                <i className={`menu-arrow`}></i>
              </div>
              <Collapse in={data.setting}>
                <ul className="nav flex-column sub-menu">
                  {menu.map((elem) => {
                    return (
                      (elem.name.toLowerCase().replace(/\s/g, '') === 'userrole' || elem.name.toLowerCase().replace(/\s/g, '') === 'workreport') &&
                      <div key={elem._id}>
                        {elem.name.toLowerCase().replace(/\s/g, '') === 'userrole' && <li className="nav-item"> <NavLink className="nav-link" to="/user-role">{elem.name}</NavLink></li>}
                        {elem.name.toLowerCase().replace(/\s/g, '') === 'workreport' && <li className="nav-item" onClick={toggleSidebar}> <NavLink className="nav-link" to="/work-report">{elem.name}</NavLink></li>}
                      </div>)
                  })}
                </ul>
              </Collapse>
            </li>}
        </ul>
      </nav>
      {isLoading && <Spinner />}
    </>
  )
}

export default Sidebar;
