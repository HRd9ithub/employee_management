import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { NavLink, useNavigate } from "react-router-dom";
import Spinner from '../common/Spinner';
import { customAxios } from '../../service/CreateApi';

const ForgotPassword = () => {
  // eslint-disable-next-line
  // var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  var mailformat = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  //initialistate state
  const [isLoading, setisLoading] = useState(false);
  const [email, setEmail] = useState("");
  // error state
  const [error, setError] = useState("");

  // redirect page
  let history = useNavigate();

  // onchange function
  const handleChange = (event) => {
    setEmail(event.target.value);
  }

  // email validation
  const emailValidation = () => {
    if (!email) {
      setError('Email is a required field.');
    } else if (!mailformat.test(email)) {
      setError("Email must be a valid email.");
    } else {
      setError('');
    }
  }

  // submit function 
  const handleSubmit = async (e) => {
    e.preventDefault();
    emailValidation();

    if (!email || error) {
      return false;
    } else {
      try {
        setisLoading(true);
        const response = await customAxios().post("/auth/forgotpassword", { email });
        if (response.data.success) {
          let { message } = response.data
          history('/login');
          setisLoading(false);
          toast.success(message);
          setEmail("");
        }
      } catch (error) {
        setEmail("");
        setisLoading(false)
        if (!error.response) {
          toast.error(error.message);
        } else {
          toast.error(error.response.data.message);
        }
      }
    }
  }

  return (
    <div className='login-page'>
      <div className="login-wrap container">
        <div className="login-inner-text row h-100 p-3 align-items-center">
          <div className="login-left col-lg-6 col-12 pr-0">
            <div className="login-page-logo text-center">
              <img src='Images/d9_logo_black.png' alt="logo" />
            </div>
            <img src="./Images/forgot-password.png" className='img-fluid side-img mx-auto' alt="" />
          </div>
          <div className="login-right col-lg-6 col-12 pl-0">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-12">
                  <div className="login-page-logo-none">
                    <img src='Images/d9.png' alt="logo" />
                  </div>
                </div>
                <div className="col-12">
                  <h2 className='mt-2 mt-lg-4 mt-xl-4'>Forgot Password!</h2>
                </div>
                <div className="col-12">
                  <h5>Enter your Email and we'll send you a link to reset your password</h5>
                </div>
                <div className="col-12">
                  <div className="input-group mb-2 mt-4">
                    <div className="input-group-prepend">
                      <div className="input-group-text">
                        <i className="fa-solid fa-envelope" style={{ color: "#054392" }}></i>
                      </div>
                    </div>
                    <input type="text" className="form-control" aria-label="Text input with checkbox" placeholder='Email' name='email' value={email} onChange={handleChange} onBlur={emailValidation} autoComplete='off' />
                  </div>
                  {error && <small className="form-text error text-left mt-2">{error}</small>}
                </div>
                <div className="col-12 login-button my-3">
                  <button className='d-block w-100'>Reset Password</button>
                </div>
                <div className="col-12 text-center mb-3">
                  <NavLink to="/login" className='back-to-login'>Back To Login</NavLink>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      {isLoading && <Spinner />}
    </div>
  )
}

export default ForgotPassword