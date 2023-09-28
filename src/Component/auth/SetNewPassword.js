import React, { useState } from 'react';
import {NavLink} from 'react-router-dom';

const SetNewPassword = () => {

  return (
    <div className='login-page'>
      <div className="login-wrap container">
        <div className="login-inner-text row h-100 p-3 align-items-center">
          <div className="login-left col-lg-6 col-12 pr-0">
            <div className="login-page-logo text-center">
              <img src='Images/d9_logo_black.png' alt="logo" />
            </div>
            <img src="./Images/new-password.png" className='img-fluid side-img mx-auto' alt=""/>
          </div>
          <div className="login-right col-lg-6 col-12 pl-0">
            <div className="row">
              <div className="col-12">
                <div className="login-page-logo-none">
                  <img src='Images/d9.png' alt="logo" />
                </div>
              </div>
              <div className="col-12">
                <h2 className='mt-2 mt-lg-4 mt-xl-4'>Set New Password</h2>
              </div>
              <div className="col-12">
                <h5>Use this awesome form for set your password</h5>
              </div>
              <div className="col-12">
                <div className="input-group mb-3 mt-4">
                  <div className="input-group-prepend">
                    <div className="input-group-text">
                    <i className="fa-solid fa-lock" style={{ color: "#054392" }}></i>
                    </div>
                  </div>
                  <input type="text" className="form-control" aria-label="Text input with radio button" placeholder='New Password'/>
                </div>
              </div>
              <div className="col-12">
                <div className="input-group mb-3">
                  <div className="input-group-prepend">
                    <div className="input-group-text">
                    <i className="fa-solid fa-lock" style={{ color: "#054392" }}></i>
                    </div>
                  </div>
                  <input type="text" className="form-control" aria-label="Text input with radio button" placeholder='Confirm Password'/>
                </div>
              </div>
              <div className="col-12 login-button">
                <button className='d-block w-100'>Set New Password</button>
              </div>
              <div className="col-12 text-center my-3">
                <NavLink to="/login" className='back-to-login'>Back To Login</NavLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SetNewPassword