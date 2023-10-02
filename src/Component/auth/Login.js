import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Form } from 'react-bootstrap';
import Spinner from '../common/Spinner';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Globalcomponent } from '../auth_context/GlobalComponent';
import { motion } from 'framer-motion'

const Login = () => {
  // eslint-disable-next-line
  var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

  const [data, setData] = useState({
    email: '',
    password: ''
  })
  const [emailError, setEmailError] = useState('')
  const [passwordError, setpasswordError] = useState('')
  const [IconToggle, setIconToggle] = useState(false)
  const [otp, setOtp] = useState(new Array(4).fill(""));
  const [Otperror, setOtperror] = useState('');
  let { pageToggle, onSubmit, loader, onSubmitOtp, Error, HandleResend } = Globalcomponent();

  //onchange function
  const HandleChange = (event) => {
    let { name, value } = event.target;
    setData({ ...data, [name]: value })
  }

  // submit function
  const handleSubmit = (e) => {
    e.preventDefault();
    handlePasswordVlidate();
    handleNameVlidate();

    if (!data.email || !data.password) {
      return false
    }
    if (emailError || passwordError) {
      return false
    } else {
      onSubmit(data)
    }
  }

  // otp submit function
  const handleOTP = (e) => {
    e.preventDefault();
    otpVlidate();
    if (!otp.join("")) {
      return false
    }
    if (!Otperror) {
      onSubmitOtp(data.email, otp.join(""));
    }
  }

  // validation otp
  const otpVlidate = () => {
    if (!otp.join("")) {
      setOtperror('OTP is a required field.')
    } else if (!otp.join("").match(/^[0-9]+$/)) {
      setOtperror("OTP must be a number.")
    } else if (otp.join("").length !== 4) {
      setOtperror('OTP must be at least 4 characters.')
    } else {
      setOtperror('')
    }
  }

  // email validation
  const handleNameVlidate = () => {
    if (!data.email) {
      setEmailError('Email is a required field.')
    } else if (!data.email.match(mailformat)) {
      setEmailError("Email must be a valid email.")
    } else {
      setEmailError('')
    }
  }

  // password validation
  const handlePasswordVlidate = () => {
    if (!data.password) {
      setpasswordError("Password is a required field.")
    } else {
      setpasswordError('')
    }
  }


  // otp onchange function
  const handlechange = (element, index) => {

    if (isNaN(element.value)) return false;

    setOtp([...otp.map((data, ind) => ind === index ? element.value : data)]);
  }

  // otp keyup function
  const inputfocus = (elmnt, input, index) => {
    let inputs = document.querySelectorAll(".otp-input")
    if ((elmnt.key === "Delete" || elmnt.key === "Backspace") && index !== 0) {
      inputs[index].previousElementSibling.focus();
    } else {
      inputs[index].focus();
    }
    if (!inputs[index].value || index === 3) {
      return false
    } else {
      input.nextSibling.focus();
    }
  }


  return (
    <>
      <motion.div
        className="box login-wrapper"
        initial={{ opacity: 0, transform: 'translateY(-20px)' }}
        animate={{ opacity: 1, transform: 'translateY(0px)' }}
        transition={{ duration: 0.5 }}
      >
        <div className="d-flex align-items-center auth px-0">
          <div className=" w-100 mx-0">
            <div className=" mx-auto">
              {!pageToggle ?
                <div className="auth-form-light text-left py-2  px-sm-4">
                  <div className="brand-logo-login py-3">
                    <img src='Images/d9.png' alt="logo" />
                  </div>
                  <div className="brand-txt text-center">
                    <h4>Hello! let's get started</h4>
                    <h6 className="font-weight-light">Sign in to continue.</h6>
                  </div>
                  <Form className="pt-2" onSubmit={handleSubmit}>
                    <Form.Group className=" search-field">
                      <div>
                        <Form.Control type="text" placeholder="Enter email address" size="lg" className="h-auto" name='email' value={data.email} onChange={HandleChange} onBlur={handleNameVlidate} autoComplete='off' autoFocus />
                        {emailError && <Form.Text className='error'>{emailError}</Form.Text>}
                      </div>
                    </Form.Group>
                    <Form.Group className=" search-field position-relative">
                      <div>
                        <Form.Control type={`${IconToggle ? 'text' : 'password'}`} placeholder="Password" size="lg" className="h-auto" name='password' value={data.password} onChange={HandleChange} onBlur={handlePasswordVlidate} autoComplete='off' />
                        {passwordError && <Form.Text className='error'>{passwordError}</Form.Text>}
                        {IconToggle ? <span className='eye-icon' onClick={() => setIconToggle(false)}><VisibilityIcon /></span> :
                          <span className='eye-icon' onClick={() => setIconToggle(true)}><VisibilityOffIcon /></span>}
                      </div>
                    </Form.Group>
                    <div className="d-flex justify-content-end align-items-center">
                      <NavLink to="/password" className="auth-link text-black">Forgot Password?</NavLink>
                    </div>
                    <ol>
                      {Error.map((val) => {
                        return <li className='error' key={val}>{val}</li>
                      })}
                    </ol>
                    <div className="mt-3 login-btn">
                      <button className="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn"  >
                        SIGN IN</button>
                    </div>
                  </Form>
                </div>
                :
                <div className="auth-form-light  otp-form text-left py-2 px-sm-4">
                  <div className='company-logo check-email-icon'>
                    <i className="fa-solid fa-envelope-open-text"></i>
                    <h4>Otp Verification</h4>
                  </div>
                  <Form className="pt-1 text-center" onSubmit={handleOTP}>
                    <Form.Label>{`For your security, we have sent the code to your email: ${data.email.slice(0, 2)}******@gmail.com.`}</Form.Label>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                      <div className='input-field'>
                        {otp.map((data, index) => {
                          return <input type='text' maxLength={1}
                            name='otp' key={index + 1} value={data} onChange={e => handlechange(e.target, index)}
                            onKeyUp={e => inputfocus(e, e.target, index)} className='otp-input'
                            autoFocus={index === 0}
                            inputMode='numeric'
                            onBlur={otpVlidate}
                          />
                        })}
                      </div>
                      <Form.Text className="error">
                        {Otperror}
                      </Form.Text>
                    </Form.Group>
                    <ol>
                      {Error.map((val) => {
                        return <li className='error' key={val}>{val}</li>
                      })}
                    </ol>
                    <div className="my-3 password-btn">
                      <button className="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn" >
                        Verify</button>
                    </div>
                    <Form.Label>Didn't receive? <NavLink onClick={() => HandleResend(data.email)}>Resend OTP</NavLink></Form.Label>
                  </Form>
                </div>
              }
            </div>
          </div>
        </div>
      </motion.div>
      {loader && <Spinner />}
    </>
  )
}

export default Login
