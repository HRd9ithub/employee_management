import React from 'react'

const LoginNew = () => {
  return (
    <div className='login-page'>
      <div className="login-wrap">
        <div className="login-inner-text row">
          <div className="login-left col-lg-6 col-12 pr-0">
            <div className="login-page-logo">
              <img src='Images/d9_logo_black.png' alt="logo" />
            </div>
            <img src="./Images/Hello_Dribbble.jpg" className='img-fluid side-img' alt="" />
          </div>
          <div className="login-right col-lg-6 col-12 pl-0 pr-5">
            <div className="container">
              <div className="row">
                <div className="col-12">
                  <div className="login-page-logo-none">
                    <img src='Images/d9.png' alt="logo" />
                  </div>
                </div>
                <div className="col-12">
                  <h2>Welcome Back!</h2>
                </div>
                <div className="col-12">
                  <h5>Login to Continue</h5>
                </div>
                <div className="col-12">
                  <div class="input-group mb-3">
                    <div class="input-group-prepend">
                      <div class="input-group-text">
                        <i class="fa-solid fa-user" style={{ color: "#054392" }}></i>
                      </div>
                    </div>
                    <input type="text" class="form-control" aria-label="Text input with checkbox" />
                  </div>
                </div>
                <div className="col-12">
                  <div class="input-group">
                    <div class="input-group-prepend">
                      <div class="input-group-text">
                        <i class="fa-solid fa-lock" style={{ color: "#32374c" }}></i>
                      </div>
                    </div>
                    <input type="text" class="form-control" aria-label="Text input with radio button" />
                  </div>
                </div>
                <div className="col-12 login-button">
                  <button >LOGIN</button>
                  <span>FORGET PASSWORD?</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginNew