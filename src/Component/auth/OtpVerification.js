import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Globalcomponent } from '../auth_context/GlobalComponent';
import { GetLocalStorage, RemoveLocalStorage } from '../../service/StoreLocalStorage';
import Spinner from '../common/Spinner';

const OtpVerification = () => {
  //initialistate state
  const [otp, setOtp] = useState("");
  const [Otperror, setOtperror] = useState('');

  let email = GetLocalStorage("email");

  let { onSubmitOtp, Error, HandleResend, loader } = Globalcomponent();

  let history = useNavigate();
  // onchange function
  const handleChange = (event) => {
    setOtp(event.target.value);
  }

  // otp validation
  const otpValidation = () => {
    let reg = /^[0-9]+$/;
    if (!otp) {
      setOtperror('OTP is a required field.')
    } else if (!reg.test(otp)) {
      setOtperror("OTP must be a number.")
    } else if (otp.length !== 4) {
      setOtperror('OTP must be at least 4 characters.')
    } else {
      setOtperror('')
    }
  }

  // otp submit function
  const handleSubmit = (e) => {
    e.preventDefault();
    otpValidation();

    if (!otp || Otperror) {
      return false;
    }

    onSubmitOtp(email, otp);

  }

  // email encrypt 
  const obscureEmail = (email) => {
    const [name, domain] = email.split('@');
    return `${name[0]}${name[1]}${new Array(name.length).join('*')}@${domain}`;
  };

  // Back to login page
  const backToLogin = () => {
    RemoveLocalStorage("email")
  }

  return (
    <div className='login-page'>
      <div className="login-wrap container">
        <div className="login-inner-text row h-100 p-3 align-items-center">
          <div className="login-left col-lg-6 col-12 pr-0">
            <div className="login-page-logo text-center">
              <img src='Images/d9_logo_black.png' alt="logo" />
            </div>
            <img src="./Images/otp-2.png" className='img-fluid side-img mx-auto' alt="" />
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
                  <h2 className='mt-2 mt-lg-4 mt-xl-4'>Otp Verification</h2>
                </div>
                <div className="col-12">
                  <h5>For your security, we have sent the code to your email {obscureEmail(email)}.</h5>
                </div>
                <div className="col-12">
                  <div className="input-group mb-2 mt-4">
                    <div className="input-group-prepend">
                      <div className="input-group-text">
                        <i className="fa-solid fa-key" style={{ color: "#054392" }}></i>
                      </div>
                    </div>
                    <input type="text" className="form-control" aria-label="Text input with checkbox" placeholder='Verification Code' value={otp} name="otp" onChange={handleChange} onBlur={otpValidation} inputMode='numeric' maxLength={4} />
                  </div>
                  {Otperror && <small className="form-text error text-left">{Otperror}</small>}
                </div>
                {Error.length !== 0 &&
                  <div className="col-12">
                    <ol className='mb-0 mt-1 text-left'>
                      {Error.map((val) => {
                        return <li className='error' key={val}>{val}</li>
                      })}
                    </ol>
                  </div>
                }
                <div className="col-12 text-right mt-2 text-secondary-dark-200">
                  Didn't Get? &nbsp;
                  <NavLink className='forgot-password-link' onClick={() => HandleResend(email)}>Resend Code</NavLink>
                </div>
                <div className="col-12 login-button my-3">
                  <button className='d-block w-100'>Verify</button>
                </div>
                <div className="col-12 text-center">
                  <NavLink to="/login" className='back-to-login' onClick={backToLogin}>Back To Login</NavLink>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      {loader && <Spinner />}
    </div>
  )
}

export default OtpVerification