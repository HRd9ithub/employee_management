import React, { useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from "framer-motion";
import AddPasswordForm from './AddPasswordForm';
import Modal from "react-bootstrap/Modal";
import { customAxios } from '../../../service/CreateApi';
import toast from 'react-hot-toast';
import Spinner from '../../common/Spinner';
import Error500 from '../../error_pages/Error500';
import Error403 from '../../error_pages/Error403';
import { Dropdown } from 'react-bootstrap';
import Swal from 'sweetalert2';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { GetLocalStorage } from '../../../service/StoreLocalStorage';
import { saveAs } from "file-saver";

const PasswordComponent = () => {

  const [show, setShow] = useState(false);
  const [urlCopy, seturlCopy] = useState(false);
  const [userNameCopy, setuserNameCopy] = useState(false);
  const [passwordCopy, setpasswordCopy] = useState(false);
  const [serverError, setServerError] = useState(false);
  const [permission, setPermission] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [view, setView] = useState("");
  const [permissionToggle, setPermissionToggle] = useState(true);
  const [searchItem, setSearchItem] = useState("");

  // toggle state
  const [eyeToggle, setEyeToggle] = useState(false);

  // password show and hide 
  const passwordToggle = () => {
    setEyeToggle(!eyeToggle)
  }

  // *show modal
  const showModal = (data) => {
    setShow(true);
    setView(data);
  }

  // *hide modal
  const hideModal = (event) => {
    event && event.preventDefault();

    setShow(false);
  }
  // get password function 
  const getPasswordRecord = async () => {
    setServerError(false);
    setIsLoading(true);
    setPermissionToggle(true);
    customAxios().get('/password').then((res) => {
      if (res.data.success) {
        let { permissions, data } = res.data;
        setPermission(permissions);
        setRecords(data);
        setIsLoading(false)
      }
    }).catch((error) => {
      setIsLoading(false)
      if (!error.response) {
        setServerError(true)
        toast.error(error.message)
      } else {
        if (error.response.status === 500) {
          setServerError(true)
        }
        if (error.response.data.message) {
          toast.error(error.response.data.message)
        }
      }
    }).finally(() => setPermissionToggle(false));
  }

  useEffect(() => {
    getPasswordRecord();
    // eslint-disable-next-line
  }, [])

  // delete function
  const handleDelete = (id) => {
    Swal.fire({
      title: "Delete Password",
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
        setIsLoading(true);
        const res = await customAxios().delete(`/password/${id}`);
        if (res.data.success) {
          getPasswordRecord();
          toast.success(res.data.message);
        }
      }
    }).catch((error) => {
      setIsLoading(false);
      if (!error.response) {
        toast.error(error.message)
      } else {
        if (error.response.data.message) {
          toast.error(error.response.data.message)
        }
      }
    })
  };

  const recordsFilter = useMemo(() => {
    return records.filter((item) => {
      return (
        item.title.toLowerCase().includes(searchItem.toLowerCase()) ||
        item.url.toLowerCase().includes(searchItem.toLowerCase()) ||
        item?.created?.first_name?.concat(" ", item?.created?.last_name)?.toLowerCase()?.includes(searchItem.toLowerCase())
      )
    });
  }, [records, searchItem]);

  // outside click 
  useEffect(() => {
    const toggleSidebars = (e) => {
      seturlCopy(false);
      setuserNameCopy(false);
      setpasswordCopy(false);
    }
    document.addEventListener("mousedown", toggleSidebars);
    return () => {
      document.removeEventListener("mousedown", toggleSidebars);
    };
    // eslint-disable-next-line
  }, []);

  // copy text 
  const textCopy = React.useCallback(async (state, name) => {
    try {
      if (name) {
        await navigator.clipboard.writeText(name);
        state === "url" ? seturlCopy(true) : state === "userName" ? setuserNameCopy(true) : setpasswordCopy(true)
      }
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  }, []);

  const handleDownload = () => {
    const filePath = `${process.env.REACT_APP_IMAGE_API}/uploads/password/${view.file.pathName}`;
    const fileName = view.file.name;

    saveAs(filePath, fileName);
  };

  if (isLoading) {
    return <Spinner />;
  } else if (serverError) {
    return <Error500 />;
  } else if ((!permission || permission.permissions.list !== 1) && !permissionToggle) {
    return <Error403 />;
  }

  return (
    <>
      <motion.div
        className="box"
        initial={{ opacity: 0, transform: 'translateY(-20px)' }}
        animate={{ opacity: 1, transform: 'translateY(0px)' }}
        transition={{ duration: 0.5 }}
      >
        <div className=" container-fluid py-4">
          <div className="background-wrapper bg-white pb-4">
            <div className='row justify-content-start align-items-center row-std m-0'>
              <div className="col-12 col-sm-5 col-xl-3 d-flex justify-content-between align-items-center">
                <div>
                  <ul id="breadcrumb" className="mb-0">
                    <li><NavLink to="/" className="ihome">Dashboard</NavLink></li>
                    <li><NavLink to="" className="ibeaker"><i className="fa-solid fa-play"></i> &nbsp; Password</NavLink></li>
                  </ul>
                </div>
              </div>
              <div className="col-12 col-sm-7 col-xl-9 d-flex justify-content-end" id="two">
                <div className="search-full">
                  <input type="search" className="input-search-full" autoComplete='off' value={searchItem} name="txt" placeholder="Search" onChange={(event) => setSearchItem(event.target.value)} />
                  <i className="fas fa-search"></i>
                </div>
                <div className="search-box mr-3">
                  <form name="search-inner">
                    <input type="search" className="input-search" autoComplete='off' value={searchItem} name="txt" onChange={(event) => setSearchItem(event.target.value)} />
                  </form>
                  <i className="fas fa-search"></i>
                </div>
                {permission && permission.permissions.create === 1 && <AddPasswordForm getPasswordRecord={getPasswordRecord} />}
              </div>
            </div>
            {recordsFilter.length !== 0 ?
              <div className="row justify-content-start align-items-center m-0 pb-3">
                {recordsFilter.map((item) => {
                  return (
                    <div className="col-md-4 mt-3" key={item._id} >
                      <div className="password-info-box">
                        <div className="d-flex align-items-center justify-content-between position-relative w-100 mb-1">
                          <h5 className='mb-0'>{item.title}</h5>
                          <Dropdown>
                            <Dropdown.Toggle id="password-action">
                              <i className="fa-solid fa-ellipsis-vertical" style={{ cursor: "pointer" }}></i>
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="password-action--dropdown">
                              <Dropdown.Item onClick={() => showModal(item)} ><i className="fa-solid fa-eye"></i><label>View</label></Dropdown.Item>
                              {permission && permission.permissions.update === 1 && (permission?.name.toLowerCase() === "admin" || item.createdBy === GetLocalStorage("user_id")) && <>
                                <Dropdown.Divider />
                                <AddPasswordForm data={item} getPasswordRecord={getPasswordRecord} />
                              </>}
                              {permission && permission.permissions.delete === 1 && (permission?.name.toLowerCase() === "admin" || item.createdBy === GetLocalStorage("user_id")) && <>
                                <Dropdown.Divider />
                                <Dropdown.Item onClick={() => handleDelete(item._id)}><i className="fa-solid fa-trash-can"></i><label>Delete</label></Dropdown.Item>
                              </>}
                            </Dropdown.Menu>
                          </Dropdown>
                        </div>
                        <hr className='mt-1 mb-2' />
                        <p>{item.url}</p>
                        {item.created &&
                          <div className="text-muted mt-2">
                            <small>Created By: </small>
                            <small>{item.created?.first_name.concat(" ", item.created?.last_name)}</small>
                          </div>}
                      </div>
                    </div>
                  )
                })}
              </div> :
              <div className="row m-0 pb-3">
                <div className="col-12 text-center pt-3">
                  <h3 style={{ color: "rgb(163, 170, 177)" }}>No Records Found</h3>
                </div>
              </div>
            }
          </div>
        </div>
      </motion.div>

      {/* modal  */}
      {show &&
        <Modal show={show} animation={true} size="md" aria-labelledby="example-modal-sizes-title-sm" className='department-modal password-modal' centered>
          <Modal.Header className='small-modal'>
            <Modal.Title>Preview</Modal.Title>
            <p className='close-modal' onClick={hideModal}><i className="fa-solid fa-xmark"></i></p>
          </Modal.Header>
          <Modal.Body>
            <div className=" grid-margin stretch-card inner-pages mb-lg-0" >
              <div className='card'>
                <div className="card-body pb-4">
                  <h3>{view.title}</h3>
                  <div className='password-auth-info'>
                    <div className="row">
                      <div className="col-md-6 mt-1">
                        <label >User Name</label>
                        <div className='position-relative auth-box'>
                          <p>{view.user_name}</p>
                          {!userNameCopy ?
                            <i className="fa-solid fa-copy" onClick={() => textCopy("userName", view.user_name)}></i> :
                            <i className="fa-solid fa-check"></i>}
                        </div>
                      </div>
                      <div className="col-md-6 mt-1">
                        <label >Password</label>
                        <div className='position-relative auth-box'>
                          <input type={eyeToggle ? 'text' : "password"} value={view.password} readOnly />
                          {!passwordCopy ?
                            <i className="fa-solid fa-copy" onClick={() => textCopy("password", view.password)}></i> :
                            <i className="fa-solid fa-check"></i>}
                          {eyeToggle ? <span className='eye-icon-password' onClick={passwordToggle}><VisibilityIcon /></span> :
                            <span className='eye-icon-password' onClick={passwordToggle}><VisibilityOffIcon /></span>}
                        </div>
                      </div>
                      <div className="col-md-12 mt-2">
                        <label >URL</label>
                        <div className='position-relative auth-box'>
                          <p>{view.url}</p>
                          {!urlCopy ? <i className="fa-solid fa-copy" onClick={() => textCopy("url", view.url)}></i> :
                            <i className="fa-solid fa-check"></i>}
                        </div>
                      </div>
                      {view.note ?
                        <div className="col-md-12 mt-2">
                          <label >Note</label>
                          <div className='position-relative auth-box'>
                            <pre className='mb-0 p-2' style={{ background: "transparent", whiteSpace: "break-spaces" }} >{view.note}</pre>
                          </div>
                        </div> : null}
                      {view.file && view.file?.name ?
                        <div className="col-md-12 mt-2">
                          <label >File</label>
                          <div className='position-relative auth-box'>
                            <p>{view.file?.name}</p>
                            <NavLink to="" onClick={handleDownload}><i className="fa-solid fa-cloud-arrow-down"></i></NavLink>
                          </div>
                        </div> : null}
                    </div>
                  </div>
                  {permission && (permission?.name.toLowerCase() === "admin" || view.createdBy === GetLocalStorage("user_id")) && view.hasOwnProperty("access") && view.access.length !== 0 &&
                    <div className="access-employee-list mt-4">
                      <h3>Access Employee List:</h3>
                      <div className="row mt-3" style={{ rowGap: "10px" }} >
                        {view.hasOwnProperty("access") && view.access.map((item, index) => (
                          <div className="col-md-4 col-sm-6" key={item._id}><span className='pr-2'>{index + 1}.</span> <label className='mb-0'>{item?.first_name.concat(" ", item.last_name)}</label></div>
                        ))}
                      </div>
                    </div>}
                </div>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      }
    </>
  )
}

export default PasswordComponent