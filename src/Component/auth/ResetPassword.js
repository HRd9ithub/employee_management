import { motion } from "framer-motion";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useState } from "react";
import { Form } from "react-bootstrap";
import { toast } from "react-toastify";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import Spinner from "../common/Spinner";

const ResetPassword = () => {
  const query = new URLSearchParams(useLocation().search);
  let email = query.get("email");
  let token = query.get("token");

  const [loader, setLoader] = useState(false);
  const [error, seterror] = useState([]);

  const [data, setData] = useState({
    new_password: '',
    confirm_password: ""
  })
  // error message this state
  const [new_password_error, setnew_password_error] = useState("");
  const [confirm_password_error, setconfirm_password_error] = useState('');

  // password show and hide icon change
  const [newPasswordIconToggle, setnewPasswordIconToggle] = useState(false)
  const [confirmPasswordIconToggle, setconfirmPasswordIconToggle] = useState(false)


  // redirect page 
  const history = useNavigate()

  // onchange function 
  const HandleChange = (event) => {
    // object destructuring
    let { name, value } = event.target
    setData({ ...data, [name]: value })
  }

  // submit function 
  const handleSubmit = (e) => {
    e.preventDefault();
    handleValidateNewPassword();
    handleValidateConfirmPassword();
    seterror([]);

    // object destructuring
    let { new_password, confirm_password } = data;

    if (!new_password || !confirm_password || new_password_error || confirm_password_error) {
      return false;
    } else {
      setLoader(true);
      // reset password api call
      axios.post(`${process.env.REACT_APP_API_KEY}/resetpassword`, { password: new_password, password_confirmation: confirm_password, email, token }).then((response) => {

        if (response.data.success) {
          history('/login')
          toast.success("Your password has been reset successfully.")
          setData({
            new_password: '',
            confirm_password: ""
          })
          setLoader(false);
        }
      }).catch((error) => {
        console.log('error', error);
        setLoader(false)
        if (error.response.data.error) {
          seterror(error.response.data.error);
        } else {
          toast.error(error.response.data.message);
        }
      })
    }
  }

  // new password validation
  const handleValidateNewPassword = () => {
    if (!data.new_password) {
      setnew_password_error('Please enter a password.')
    } else if (!data.new_password.match(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/)) {
      setnew_password_error("Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character.");
    } else {
      setnew_password_error('')
    }
  }

  // confirm password validation
  const handleValidateConfirmPassword = () => {
    if (!data.confirm_password) {
      setconfirm_password_error("Please enter a Confirm Password.");
    } else if (data.confirm_password !== data.new_password) {
      setconfirm_password_error('Password do not match.');
    } else {
      setconfirm_password_error('');
    }
  }

  return (
    <>
      <motion.div
        className="box login-wrapper"
        initial={{ opacity: 0, transform: "translateY(-20px)" }}
        animate={{ opacity: 1, transform: "translateY(0px)" }}
        transition={{ duration: 0.5 }}
      >
        <div className="d-flex align-items-center auth px-0">
          <div className=" w-100 mx-0">
            <div className=" mx-auto">
              <div className="auth-form-light text-left py-2 px-sm-4">
                <div className="company-logo check-email-icon">
                  <i className="fa-solid fa-lock"></i>
                  <h4>Reset Password</h4>
                </div>
                <Form className="pt-1" onSubmit={handleSubmit}>
                  <Form.Group className=" search-field position-relative">
                    <Form.Control
                      type={`${newPasswordIconToggle ? 'text' : 'password'}`}
                      placeholder="New Password"
                      className="mt-3"
                      name="new_password"
                      value={data.new_password}
                      onChange={HandleChange}
                      onKeyUp={handleValidateNewPassword}
                      onFocus={handleValidateNewPassword}
                      autoComplete="off"
                    />
                    <Form.Text className="error">{new_password_error}</Form.Text>
                    {newPasswordIconToggle ? <span className='eye-icon' onClick={() => setnewPasswordIconToggle(false)}><VisibilityIcon /></span> :
                      <span className='eye-icon' onClick={() => setnewPasswordIconToggle(true)}><VisibilityOffIcon /></span>}
                  </Form.Group>
                  <Form.Group className="search-field position-relative">
                    <Form.Control
                      type={`${confirmPasswordIconToggle ? 'text' : 'password'}`}
                      placeholder="Confirm Password"
                      className="mt-3"
                      name="confirm_password"
                      value={data.confirm_password}
                      onChange={HandleChange}
                      onKeyUp={handleValidateConfirmPassword}
                      autoComplete="off"
                    />
                    <Form.Text className="error">{confirm_password_error}</Form.Text>
                    {confirmPasswordIconToggle ? <span className='eye-icon' onClick={() => setconfirmPasswordIconToggle(false)}><VisibilityIcon /></span> :
                      <span className='eye-icon' onClick={() => setconfirmPasswordIconToggle(true)}><VisibilityOffIcon /></span>}
                  </Form.Group>
                  <ol>
                    {error.map((val) => {
                      return <li className="error" key={val} >{val}</li>
                    })}
                  </ol>
                  <div className="my-3 password-btn">
                    <button className="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn">
                      Reset Password
                    </button>
                  </div>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      {loader && <Spinner />}
    </>
  );
};

export default ResetPassword;
