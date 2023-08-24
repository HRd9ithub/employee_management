import { motion } from 'framer-motion';
import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';

export class Error403 extends Component {
  render() {
    return (
      <motion.div
        className="box"
        initial={{ opacity: 0, transform: 'translateY(-20px)' }}
        animate={{ opacity: 1, transform: 'translateY(0px)' }}
        transition={{ duration: 0.5 }}
      >
        <div id="error-page">
          <div className="content">
            <h2 className="header" data-text="403">
              403
            </h2>
            <h4 data-text="Opps! Page not found">
              Access denied!
            </h4>
            <p>
              You are not authorized to access page.
            </p>
            <div className="btns">
              <NavLink to="/">Back to home</NavLink>
            </div>
          </div>
        </div>
      </motion.div >
    )
  }
}

export default Error403
