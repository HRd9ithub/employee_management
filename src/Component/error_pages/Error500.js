import { motion } from 'framer-motion';
import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';

export class Error500 extends Component {
  render() {
    return (
      <motion.div
        className="box"
        initial={{ opacity: 0, transform: 'translateY(-20px)' }}
        animate={{ opacity: 1, transform: 'translateY(0px)' }}
        transition={{ duration: 0.5 }}
      >
        <div id="error-page" className="mx-4 my-3">
          <div className="content">
            <h2 className="header" data-text="500">
              500
            </h2>
            <h4 data-text="Opps! Page not found">
              Internal server Error
            </h4>
            <p className='error-para--line'>
              Something goes wrong with our servers, please try again later.
            </p>
            <div className="btns">
              <NavLink to="/">Back Home</NavLink>
            </div>
          </div>
        </div>
      </motion.div >
    )
  }
}

export default Error500
