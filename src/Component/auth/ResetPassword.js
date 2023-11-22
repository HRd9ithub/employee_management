import axios from 'axios';
import React, { useState } from 'react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import Spinner from '../common/Spinner';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { passwordFormat } from '../common/RegaulrExp';

const ResetPassword = () => {
  // get url for email and token
  const query = new URLSearchParams(useLocation().search);
  let email = query.get("email");
  const token = query.get("token");
  email = email.replace(" ", "+");

  // common header for api
  const request = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
  }

  //initialistate state
  const [isLoading, setisLoading] = useState(false);
  const [data, setData] = useState({
    new_password: '',
    confirm_password: ""
  });

  // error message this state
  const [expire, setExpire] = useState(false);
  const [error, seterror] = useState([]);
  const [expireError, setExpireError] = useState("");
  const [new_password_error, setnew_password_error] = useState("");
  const [confirm_password_error, setconfirm_password_error] = useState('');

  // password show and hide icon change
  const [newPasswordIconToggle, setnewPasswordIconToggle] = useState(false)
  const [confirmPasswordIconToggle, setconfirmPasswordIconToggle] = useState(false)

  // redirect page 
  const history = useNavigate();

  // check link for expire or not
  useEffect(() => {
    const checkLink = async () => {
      setisLoading(true)
      axios.get(`${process.env.REACT_APP_API_KEY}/auth/checklink`, request).then((response) => {

        if (response.data.success) {
          setExpire(false)
          setExpireError("")
          setisLoading(false)
        }
      }).catch((error) => {
        setisLoading(false)
        if (!error.response) {
          toast.error(error.msessage);
        } else if (error.response.data.error) {
          setExpire(true)
          setExpireError(error.response.data.error);
        } else {
          toast.error(error.response.data.message);
        }
      })
    }
    checkLink()
    // eslint-disable-next-line
  }, [])

  // onchange function 
  const HandleChange = (event) => {
    // object destructuring
    const { name, value } = event.target
    setData({ ...data, [name]: value })
  }

  // new password validation
  const newPassswordValidation = () => {
    if (!data.new_password) {
      setnew_password_error('Password is a required field.')
    } else if (!data.new_password.match(passwordFormat)) {
      setnew_password_error("Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character.");
    } else {
      setnew_password_error('')
    }
  }

  // confirm password validation
  const confirmPasswordValidation = () => {
    if (!data.confirm_password) {
      setconfirm_password_error("Confirm Password is a required field.");
    } else if (data.confirm_password !== data.new_password) {
      setconfirm_password_error('Password do not match.');
    } else {
      setconfirm_password_error('');
    }
  }

  // submit function 
  const handleSubmit = (e) => {
    e.preventDefault();
    newPassswordValidation();
    confirmPasswordValidation();
    seterror([]);

    // object destructuring
    const { new_password, confirm_password } = data;

    if (!new_password || !confirm_password || new_password_error || confirm_password_error) {
      return false;
    } else {
      setisLoading(true);
      // reset password api call
      axios.post(`${process.env.REACT_APP_API_KEY}/auth/resetpassword`, { password: new_password, password_confirmation: confirm_password, email }, request).then((response) => {

        if (response.data.success) {
          history('/login')
          toast.success(response.data.message)
          setData({
            new_password: '',
            confirm_password: ""
          })
          setisLoading(false);
        }
      }).catch((error) => {
        setisLoading(false);
        setData({
          new_password: '',
          confirm_password: ""
        })
        if (!error.response) {
          toast.error(error.msessage);
        } else if (error.response.data.error) {
          seterror(error.response.data.error);
        } else {
          toast.error(error.response.data.message);
        }
      })
    }
  }

  // password show and hide 
  const newPassswordToggle = () => {
    setnewPasswordIconToggle(!newPasswordIconToggle)
  }

  // password show and hide 
  const confirmPassswordToggle = () => {
    setconfirmPasswordIconToggle(!confirmPasswordIconToggle)
  }

  return (
    <div className='login-page'>
      {!expire && !isLoading ?
        <div className="login-wrap container">
          <div className="login-inner-text row h-100 p-3 align-items-center">
            <div className="login-left col-lg-6 col-12 pr-0">
              <div className="login-page-logo text-center">
                <img src='Images/d9_logo_black.png' alt="logo" />
              </div>
              <img src="./Images/new-password.png" className='img-fluid side-img mx-auto' alt="" />
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
                    <h2 className='mt-2 mt-lg-4 mt-xl-4'>Set New Password</h2>
                  </div>
                  <div className="col-12">
                    <h5>Use this awesome form for set your password</h5>
                  </div>
                  <div className="col-12">
                    <div className="input-group mb-2 mt-4">
                      <div className="input-group-prepend">
                        <div className="input-group-text">
                          <i className="fa-solid fa-lock" style={{ color: "#054392" }}></i>
                        </div>
                      </div>
                      <input type={newPasswordIconToggle ? "text" : "password"} className="form-control" aria-label="Text input with radio button" placeholder='New Password' name="new_password" value={data.new_password} onChange={HandleChange} onBlur={newPassswordValidation} autoComplete="off" />
                      {newPasswordIconToggle ? <span className='eye-icon' onClick={newPassswordToggle}><VisibilityIcon /></span> :
                        <span className='eye-icon' onClick={newPassswordToggle}><VisibilityOffIcon /></span>}
                    </div>
                    {new_password_error && <small className="form-text error text-left mb-2">{new_password_error}</small>}
                  </div>
                  <div className="col-12">
                    <div className="input-group mt-2">
                      <div className="input-group-prepend">
                        <div className="input-group-text">
                          <i className="fa-solid fa-lock" style={{ color: "#054392" }}></i>
                        </div>
                      </div>
                      <input type={confirmPasswordIconToggle ? "text" : "password"} className="form-control" aria-label="Text input with radio button" placeholder='Confirm Password' name="confirm_password" value={data.confirm_password} onChange={HandleChange} onBlur={confirmPasswordValidation} autoComplete="off" />
                      {confirmPasswordIconToggle ? <span className='eye-icon' onClick={confirmPassswordToggle}><VisibilityIcon /></span> :
                        <span className='eye-icon' onClick={confirmPassswordToggle}><VisibilityOffIcon /></span>}
                    </div>
                    {confirm_password_error && <small className="form-text error text-left mt-2">{confirm_password_error}</small>}
                  </div>
                  {error.length !== 0 &&
                    <div className="col-12">
                      <ol className='mb-0 mt-1 text-left'>
                        {error.map((val) => {
                          return <li className='error' key={val}>{val}</li>
                        })}
                      </ol>
                    </div>
                  }
                  <div className="col-12 login-button my-3">
                    <button className='d-block w-100' disabled={isLoading}>Set New Password</button>
                  </div>
                  <div className="col-12 text-center mb-3">
                    <NavLink to="/login" className='back-to-login'>Back To Login</NavLink>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
        : !isLoading &&
        <div className="row align-items-center px-0 py-4 link_expire">
          <div className="col-12 col-md-4 col-lg-4 col-lg-4 col-xxl-4 text-center">
            <img src="./Images/warning-orange.png" alt="img" />
          </div>
          <div className="col-12 col-md-8 col-lg-8 col-lg-8 col-xxl-8">
            <h2 className="link-expire-content">
              The link you followed has expired.
            </h2>
            <p className="my-3">
              {expireError}
            </p>
            <div className="back-to-login-link-expire">
              <NavLink to="/login" className="btn btn-primary btn-md font-weight-medium auth-form-btn">
                Back To Login
              </NavLink>
            </div>
          </div>
        </div>
      }
      {isLoading && <Spinner />}
    </div>
  )
}

export default ResetPassword