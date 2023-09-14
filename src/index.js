import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import { motion } from 'framer-motion'
import { RouteContext } from './Component/context/RouteContext';
import { ToastContainer, Zoom } from 'react-toastify';
import { Toaster } from 'react-hot-toast';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <RouteContext>
      <motion.div
        className="box"
        initial={{ opacity: 0, transform: 'translateY(-20px)' }}
        animate={{ opacity: 1, transform: 'translateY(0px)' }}
        transition={{ duration: 0.5 }}
      >
        <App />
      </motion.div>
    </RouteContext>
    {/* <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={true}
        newestOnTop
        closeOnClick
        rtl={false}
        theme="colored"
        pauseOnFocusLoss
        draggable
        pauseOnHover
        transition={Zoom}
      /> */}
    <Toaster
      position="top-right"
      reverseOrder={false}
    />
  </BrowserRouter>
);

reportWebVitals();