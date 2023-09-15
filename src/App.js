import React from 'react';
import './style/App.scss';
import './style/App.css'
import './style/Responsive.css'
import { useLocation } from 'react-router-dom';
import Navbar from './Component/common/Navbar';
import Sidebar from "./Component/common/Sidebar"
import AppRoute from './Component/routes/AppRoute';

function App() {
  let location = useLocation();

  return (
    <>
      <div className='wrapper-container d-flex'>
        <div className='sidebar-wrap'>
          {location.pathname === '/login' || location.pathname === '/password' || location.pathname === '/set_new_password' ? '' : <Sidebar />}
        </div>
        <div className='sidebar-inner'>
          {location.pathname === '/login' || location.pathname === '/password' || location.pathname === '/set_new_password' ? '' : <Navbar />}
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
