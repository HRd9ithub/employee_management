import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Globalcomponent } from '../auth_context/GlobalComponent';
import Spinner from '../common/Spinner';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { emailFormat } from '../common/RegaulrExp';

const Login = () => {
  //initialistate state
  const [data, setData] = useState({
    email: '',
    password: ''
  })
  // error state
  const [emailError, setEmailError] = useState('');
  const [passwordError, setpasswordError] = useState('');
  // toggle state
  const [eyeToggle, setEyeToggle] = useState(false);

  const { onSubmit, loading, Error } = Globalcomponent();


  //onchange function
  const HandleChange = (event) => {
    let { name, value } = event.target;
    setData({ ...data, [name]: value });
  }

  // email validation
  const emailValidation = () => {
    if (!data.email) {
      setEmailError('Email is a required field.')
    } else if (!emailFormat.test(data.email)) {
      setEmailError("Email must be a valid email.")
    } else {
      setEmailError('')
    }
  }

  // password validation
  const passwordValidation = () => {
    if (!data.password) {
      setpasswordError("Password is a required field.")
    } else {
      setpasswordError('')
    }
  }

  // submit function
  const handleSubmit = (e) => {
    e.preventDefault();
    passwordValidation();
    emailValidation();

    if (!data.email || !data.password) {
      return false
    }
    if (emailError || passwordError) {
      return false
    }

    onSubmit(data)

  }

  // password show and hide 
  const passwordToggle = () => {
    setEyeToggle(!eyeToggle)
  }

  return (
    <div className='login-page'>
      <div className="login-wrap container">
        <div className="login-inner-text row h-100 p-3 align-items-center">
          <div className="login-left col-lg-6 col-12 pr-0">
            <div className="login-page-logo text-center">
              <img src='Images/d9_logo_black.png' alt="logo" />
            </div>
            <img src="./Images/hello_dribble.png" className='img-fluid side-img mx-auto' alt="" />
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
                  <h2 className='mt-2 mt-lg-4 mt-xl-4'>Welcome Back!</h2>
                </div>
                <div className="col-12">
                  <h5>Login To Continue</h5>
                </div>
                <div className="col-12">
                  <div className="input-group mb-2 mt-4">
                    <div className="input-group-prepend">
                      <div className="input-group-text">
                        <i className="fa-solid fa-envelope" style={{ color: "#054392" }}></i>
                      </div>
                    </div>
                    <input type="text" className="form-control" aria-label="Text input with checkbox" placeholder='Email' name='email' value={data.email} onChange={HandleChange} autoComplete='off' onBlur={emailValidation} />
                  </div>
                  {emailError && <small className="form-text error text-left mb-2">{emailError}</small>}
                </div>
                <div className="col-12">
                  <div className="input-group mt-2">
                    <div className="input-group-prepend">
                      <div className="input-group-text">
                        <i className="fa-solid fa-lock" style={{ color: "#054392" }}></i>
                      </div>
                    </div>
                    <input type={eyeToggle ? "text" : "password"} className="form-control" aria-label="Text input with radio button" placeholder='Password' name="password" value={data.password} onChange={HandleChange} autoComplete='off' onBlur={passwordValidation} />
                    {eyeToggle ? <span className='eye-icon' onClick={passwordToggle}><VisibilityIcon /></span> :
                            <span className='eye-icon' onClick={passwordToggle}><VisibilityOffIcon /></span>}
                  </div>
                  {passwordError && <small className="form-text error text-left mt-2">{passwordError}</small>}
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
                <div className="col-12 text-right my-3">
                  <NavLink to="/forgot-password" className='forgot-password-link d-block'>Forgot Password?</NavLink>
                </div>
                <div className="col-12 login-button">
                  <button className='d-block w-100 mb-3' onClick={handleSubmit} disabled={loading}>Log In</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      {loading && <Spinner />}
    </div>
  )
}

export default Login;