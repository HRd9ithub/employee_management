import React from 'react'
import { NavLink } from 'react-router-dom'

const LoginNew = () => {
  return (
    <div className='login-page'>
      <div className="login-wrap container">
        <div className="login-inner-text row h-100 p-3 align-items-center">
          <div className="login-left col-lg-6 col-12 pr-0">
            <div className="login-page-logo text-center">
              <img src='Images/d9_logo_black.png' alt="logo" />
            </div>
            <img src="./Images/hello_dribble.png" className='img-fluid side-img mx-auto' alt=""/>
          </div>
          <div className="login-right col-lg-6 col-12 pl-0">
            <div className="row">
              <div className="col-12">
                <div className="login-page-logo-none">
                  <img src='Images/d9.png' alt="logo" />
                </div>
              </div>
              <div className="col-12">
                <h2 className='mt-2 mt-lg-4 mt-xl-4'>Welcome Back!</h2>
              </div>
              <div className="col-12">
                <h5>Login To Continue</h5>
              </div>
              <div className="col-12">
                <div className="input-group mb-3 mt-4">
                  <div className="input-group-prepend">
                    <div className="input-group-text">
                      <i className="fa-solid fa-envelope" style={{ color: "#054392" }}></i>
                    </div>
                  </div>
                  <input type="text" className="form-control" aria-label="Text input with checkbox" placeholder='Email'/>
                </div>
              </div>
              <div className="col-12">
                <div className="input-group">
                  <div className="input-group-prepend">
                    <div className="input-group-text">
                      <i className="fa-solid fa-lock" style={{ color: "#054392" }}></i>
                    </div>
                  </div>
                  <input type="text" className="form-control" aria-label="Text input with radio button" placeholder='Password'/>
                </div>
              </div>
              <div className="col-12 text-right my-3">
                <NavLink to="/password" className='forgot-password-link d-block'>Forgot Password?</NavLink>
              </div>
              <div className="col-12 login-button">
                <button className='d-block w-100 mb-3'>Log In</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginNew