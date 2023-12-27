import React, { useEffect, useState, useContext, useCallback } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Collapse } from 'react-bootstrap';
import { AppProvider } from '../context/RouteContext';
import Spinner from './Spinner';
import { GetLocalStorage } from '../../service/StoreLocalStorage';
import { toast } from 'react-hot-toast';
import { customAxios } from '../../service/CreateApi';

const Sidebar = () => {
  // initialistate 
  const [data, setData] = useState({});
  const [menu, setMenu] = useState([]);
  const [isLoading, setisLoading] = useState(false);
  const [widthTogle, setWidthToggle] = useState("");
  let { pathname } = useLocation();

  // Global state
  let { setSidebarToggle, sidebarToggle, sidebarRef } = useContext(AppProvider)

  // eslint-disable-next-line
  useEffect(() => {
    if (window.innerWidth < 992) {
      document.body.classList.remove('sidebar-icon-only');
    }
    const data = document.getElementsByClassName('sidebar-icon-only');
    if (data.length !== 0) {
      setWidthToggle(false)
    } else {
      setWidthToggle(true)
    }
  })

  // menu get function
  const getMenu = async () => {
    try {
      setisLoading(true);
      const res = await customAxios().get('/menu');

      if (res.data.success) {
        const { data } = res.data;
        let result = [];
        const employee = ['Employees', 'Project', 'Designation']
        const leave = ['Holiday', 'Leave Type', 'Leaves']
        const setting = ['User Role', 'Work Report', 'Password']
        const accounting = ['Invoices', "Clients"]

        data.forEach((item) => {
          if (employee.includes(item.name)) {
            let abc = result.find((val) => {
              return val.name === "employee"
            })
            !abc && result.push({ name: "employee", child: [], icon: item.icon, route: "#" })
            result = result.map((val) => {
              if (val.name === "employee") {
                return { ...val, child: val.child.concat({ _id: item._id, name: item.name, route: item.path }) }
              }
              return val
            })
          } else if (leave.includes(item.name)) {
            let abc = result.find((val) => {
              return val.name === "leave"
            })
            !abc && result.push({ name: "leave", child: [], icon: item.icon, route: "#" })
            result = result.map((val) => {
              if (val.name === "leave") {
                return { ...val, child: val.child.concat({ _id: item._id, name: item.name, route: item.path }) }
              }
              return val
            })
          } else if (setting.includes(item.name)) {
            let abc = result.find((val) => {
              return val.name === "settings"
            })
            !abc && result.push({ name: "settings", child: [], icon: item.icon, route: "#" })
            result = result.map((val) => {
              if (val.name === "settings") {
                return { ...val, child: val.child.concat({ _id: item._id, name: item.name, route: item.path }) }
              }
              return val
            })
          } else if (accounting.includes(item.name)) {
            let abc = result.find((val) => {
              return val.name === "accounting"
            })
            !abc && result.push({ name: "accounting", child: [], icon: item.icon, route: "#" })
            result = result.map((val) => {
              if (val.name === "accounting") {
                return { ...val, child: val.child.concat({ _id: item._id, name: item.name, route: item.path }) }
              }
              return val
            })
          } else {
            result.push({ _id: item._id, name: item.name, icon: item.icon, route: item.path })
          }
        })
        setMenu(result)
      }
    } catch (error) {
      if (!error.response) {
        toast.error(error.message);
      } else if (error.response.data.message) {
        toast.error(error.response.data.message);
      }
    } finally {
      setisLoading(false);
    }
  }

  useEffect(() => {
    if (GetLocalStorage("token")) {
      getMenu();
    }
    // eslint-disable-next-line
  }, [])

  // hover effect
  useEffect(() => {
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
  })

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

  // add active class 
  const HandleACtive = useCallback((menu) => {
    if (menu.route !== "#") {
      return pathname === menu.route
    } else {
      const result = menu.child.find((cur) => {
        return pathname.includes(cur.route)
      })
      return result ? true : false;
    }
  }, [pathname])

  // mobile screen close for click menu
  const toggleSidebar = () => {
    document.querySelector('.sidebar-offcanvas').classList.remove('active')
    setSidebarToggle(!sidebarToggle);
  }

  // outside click close sidebar use
  useEffect(() => {
    const toggleSidebars = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setSidebarToggle(false);
      }
    }
    document.addEventListener("mousedown", toggleSidebars);
    return () => {
      document.removeEventListener("mousedown", toggleSidebars);
    };
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <nav className={`sidebar sidebar-offcanvas ${sidebarToggle ? "active" : ""}`} id="sidebar" ref={sidebarRef}>
        <div className="text-center navbar-brand-wrapper d-flex align-items-center justify-content-center">
          {widthTogle ?
            <Link className="navbar-brand brand-logo " to="/"><img src='/Images/d9_logo_black.png' alt="logo" /></Link> :
            <Link className="navbar-brand brand-logo-mini" to="/"><img src='/Images/d9.jpg' alt="logo" width={53} height={45} /></Link>}
        </div>
        <ul className="nav mt-2 nav-container" ref={sidebarRef}>
          {menu.map((elem, ind) => {
            return (
              <li className={`nav-item item-hover ${HandleACtive(elem) ? 'active' : ''}`} key={ind}>
                <NavLink to={elem.route} className='nav-link' data-toggle="collapse" onClick={() => {
                  toggleMenuState(elem.name);
                  elem.route === "#" && toggleSidebar();
                }}>
                  <i className={`${elem.icon} slider-hover-icon ${elem.name.replace(" ", "-").toLowerCase()}-icon`}></i>
                  <div className='menu-title'>{elem.name}</div>
                  {elem.route === "#" && <i className={`menu-arrow`}></i>}
                </NavLink>
                {elem.route === "#" &&
                  <Collapse in={data.hasOwnProperty(elem.name) && data[elem.name]}>
                    <ul className="nav flex-column sub-menu">
                      {elem.child.map((item) => {
                        return (
                          <div key={item._id}>
                            <li className="nav-item" > <NavLink className="nav-link navlink-inner" to={item.route}>{item.name}</NavLink></li>
                          </div>
                        )
                      })}
                    </ul>
                  </Collapse>
                }
              </li>
            )
          })
          }
        </ul>
      </nav>
      {isLoading && <Spinner />}
    </>
  )
}

export default Sidebar;
