import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from "framer-motion";
import AddPasswordForm from './AddPasswordForm';
import Modal from "react-bootstrap/Modal";
import { customAxios } from '../../../service/CreateApi';
import toast from 'react-hot-toast';
import GlobalPageRedirect from '../../auth_context/GlobalPageRedirect';
import Spinner from '../../common/Spinner';
import Error500 from '../../error_pages/Error500';
import Error403 from '../../error_pages/Error403';
import { Dropdown } from 'react-bootstrap';
import { decryptPassword } from '../../../service/passwordEncrypt';
import Swal from 'sweetalert2';

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

  let { getCommonApi } = GlobalPageRedirect();

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
        if (error.response.status === 401) {
          getCommonApi();
        } else {
          if (error.response.status === 500) {
            setServerError(true)
          }
          if (error.response.data.message) {
            toast.error(error.response.data.message)
          }
        }
      }
    })
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
      } else if (error.response.status === 401) {
        getCommonApi();
      } else {
        if (error.response.data.message) {
          toast.error(error.response.data.message)
        }
      }
    })
  };

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

  if (isLoading) {
    return <Spinner />;
  } else if (serverError) {
    return <Error500 />;
  } else if (!permission || (permission.name.toLowerCase() !== "admin" && (permission.permissions.length !== 0 && permission.permissions.list === 0))) {
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
        <div className=" container-fluid pt-4">
          <div className="background-wrapper bg-white pt-4">
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
                {permission && (permission.name.toLowerCase() === "admin" || (permission.permissions.length !== 0 && permission.permissions.create === 1)) && <AddPasswordForm getPasswordRecord={getPasswordRecord} />}
              </div>
            </div>
            {records.length !== 0 ?
              <div className="row justify-content-start align-items-center row-std m-0 pb-3">
                {records.map((item) => {
                  return (
                    <div className="col-md-4 mt-3" key={item._id} > {/** onClick={showModal} */}
                      <div className="password-info-box">
                        <div className="d-flex justify-content-between position-relative w-100">
                          <h5>{item.title}</h5>
                          <i className="fa-solid fa-ellipsis-vertical" style={{ cursor: "pointer" }} data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></i>
                          <div className="dropdown-menu password-action--dropdown">
                            <Dropdown.Item className="dropdown-item" onClick={() => showModal(item)} ><i className="fa-solid fa-eye"></i><label>View</label></Dropdown.Item>
                            {permission && (permission.name.toLowerCase() === "admin" || (permission.permissions.length !== 0 && permission.permissions.update === 1)) && <>
                              <div className="dropdown-divider"></div>
                              <AddPasswordForm data={item} getPasswordRecord={getPasswordRecord} />
                            </>}
                            {permission && (permission.name.toLowerCase() === "admin" || (permission.permissions.length !== 0 && permission.permissions.delete === 1)) && <>
                              <div className="dropdown-divider"></div>
                              <Dropdown.Item className="dropdown-item" onClick={() => handleDelete(item._id)}><i className="fa-solid fa-trash-can"></i><label>Delete</label></Dropdown.Item>
                            </>}
                          </div>
                        </div>
                        <hr className='mt-1 mb-2' />
                        <p>{item.url}</p>
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
                        <p>{decryptPassword(view.password)}</p>
                        {!passwordCopy ?
                          <i className="fa-solid fa-copy" onClick={() => textCopy("password", decryptPassword(view.password))}></i> :
                          <i className="fa-solid fa-check"></i>}
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
                    <div className="col-md-12 mt-2">
                      <label >Note</label>
                      <div className='position-relative auth-box'>
                        <p>{view.note}</p>
                      </div>
                    </div>
                  </div>
                </div>
                {permission?.name.toLowerCase() === "admin" && view.hasOwnProperty("access") && view.access.length !== 0 &&
                  <div className="access-employee-list mt-4">
                    <h3>Access Employee List:</h3>
                    <div className="row mt-3">
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
    </>
  )
}

export default PasswordComponent