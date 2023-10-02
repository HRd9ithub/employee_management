import React from 'react';
import './style/App.scss';
import './style/App.css'
import './style/Responsive.css'
import { useLocation} from 'react-router-dom';
import Navbar from './Component/common/Navbar';
import Sidebar from "./Component/common/Sidebar"
import AppRoute from './Component/routes/AppRoute';
import IdleTimeOutHandler from './service/IdleTimeOutHandler ';

function App() {

  let location = useLocation();

  return (
    <>
      <div className='wrapper-container d-flex'>
        <IdleTimeOutHandler/>
        <div className='sidebar-wrap'>
          {location.key === "default" || location.pathname === '/login' || location.pathname === '/forgot-password' || location.pathname === '/reset-password' || location.pathname === '/otp'? '' : <Sidebar />}
        </div>
        <div className='sidebar-inner'>
          {location.key === "default" || location.pathname === '/login' || location.pathname === '/forgot-password' || location.pathname === '/reset-password'  || location.pathname === '/otp'? '' : <Navbar />}
          {/* {location.pathname === '/login' || location.pathname === '/password' || location.pathname === '/set_new_password' ? '' : <Navbar />} */}
          <div className="main-panel">
            <div className="content-wrapper">
              {/* route file */}
              <AppRoute />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
