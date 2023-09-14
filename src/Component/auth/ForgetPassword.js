import axios from "axios";
import { motion } from "framer-motion";
import React from "react";
import { useState } from "react";
import { Form } from "react-bootstrap";
import Spinner from "../common/Spinner";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const ForgetPassword = () => {
  // eslint-disable-next-line
  const [loader, setLoader] = useState(false);
  const [email, setEmail] = useState("");
  const [error, seterror] = useState("");

  // redirect page
  let history = useNavigate();

  // onchange function
  const handleChangeEmail = (e) => {
    setEmail(e.target.value);
  };

  // email validation function
  const handleVlaidateEmail = () => {
    // eslint-disable-next-line
    var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!email) {
      seterror("Please enter an Email Address.");
    } else if (!email.match(mailformat)) {
      seterror("Please enter a valid Email Address.");
    } else {
      seterror("");
    }
  };

  // submit function
  const HandleSubmit = (e) => {
    e.preventDefault();
    handleVlaidateEmail();

    if (!email || error) {
      return false;
    } else {
      setLoader(true)
      axios.post(`${process.env.REACT_APP_API_KEY}/auth/forgotpassword`, { email }).then((response) => {
        if (response.data.success) {
          let { message } = response.data
          // window.open('https://mail.google.com/', "_blank")
          history('/login');
          setLoader(false);
          toast.success(message);
          setEmail("");
        }
      }).catch((error) => {
        console.log("error", error);
        setLoader(false)
        if (!error.response) {
          toast.error(error.message);
        } else {
          toast.error(error.response.data.message);
        }
      });
    }
  };

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
                  <i className="fa-solid fa-user-lock"></i>
                  <h4>Forget Password</h4>
                </div>
                <Form className="pt-1" onSubmit={HandleSubmit}>
                  <Form.Label>{`Enter your Email and we'll send you a link to reset your password `}</Form.Label>
                  <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Control
                      type="text"
                      placeholder="Email Address"
                      className="mt-3"
                      autoFocus
                      value={email}
                      onChange={handleChangeEmail}
                      onKeyUp={handleVlaidateEmail}
                      autoComplete="off"
                    />
                    <Form.Text className="error">{error}</Form.Text>
                  </Form.Group>
                  <div className="my-3 password-btn text-center">
                    <button className="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn" >Send Reset Link</button>
                    <NavLink to='/login'>Back to Login</NavLink>
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

export default ForgetPassword;
