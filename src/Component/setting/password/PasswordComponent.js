import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from "framer-motion";
import AddPasswordForm from './AddPasswordForm';
import Modal from "react-bootstrap/Modal";

const PasswordComponent = () => {

  const [show, setShow] = useState(false);
  const [urlCopy, seturlCopy] = useState(false);
  const [emailCopy, setemailCopy] = useState(false);
  const [passwordCopy, setpasswordCopy] = useState(false);

  // *show modal
  const showModal = () => {
    setShow(true);
  }

  // *hide modal
  const hideModal = (event) => {
    event && event.preventDefault();

    setShow(false);
  }



  // outside click close sidebar use
  useEffect(() => {
    const toggleSidebars = (e) => {
      seturlCopy(false);
      setemailCopy(false);
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
        state === "url" ? seturlCopy(true) : state === "email" ? setemailCopy(true) : setpasswordCopy(true)
      }
      console.log('Content copied to clipboard');
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  }, [])

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
                <AddPasswordForm />
              </div>
            </div>
            <div className="row mx-4 mt-3 mb-2">
              <div className="col-md-4 password-info-box" onClick={showModal}>
                <h5>Github</h5>
                <hr className='mt-1 mb-2' />
                <p>https://github.com/</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* modal  */}
      <Modal show={show} animation={true} size="md" aria-labelledby="example-modal-sizes-title-sm" className='small-modal department-modal password-modal' centered>
        <Modal.Header className='small-modal'>
          <Modal.Title>Preview</Modal.Title>
          <p className='close-modal' onClick={hideModal}><i className="fa-solid fa-xmark"></i></p>
        </Modal.Header>
        <Modal.Body>
          <div className=" grid-margin stretch-card inner-pages mb-lg-0" >
            <div className='card'>
              <div className="card-body">
                <h3>Github</h3>
                <div className='password-auth-info'>
                  <div>
                    <label >URL</label>
                    <div className='position-relative auth-box'>
                      <p>Hardik.d9ithub@gmail.com</p>
                      {!urlCopy ? <i className="fa-solid fa-copy" onClick={() => textCopy("url", "hello")}></i> :
                        <i className="fa-solid fa-check"></i>}
                    </div>
                  </div>
                  <div className='mt-3' >
                    <label >Email</label>
                    <div className='position-relative auth-box'>
                      <p>Hardik.d9ithub@gmail.com</p>
                      {!emailCopy ?
                        <i className="fa-solid fa-copy" onClick={() => textCopy("email", "text")}></i> :
                        <i className="fa-solid fa-check"></i>}
                    </div>
                  </div>
                  <div className='mt-3' >
                    <label >Password</label>
                    <div className='position-relative auth-box'>
                      <p>Hardik.d9ithub@gmail.com</p>
                      {!passwordCopy ?
                        <i className="fa-solid fa-copy" onClick={() => textCopy("password", "password")}></i> :
                        <i className="fa-solid fa-check"></i>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  )
}

export default PasswordComponent