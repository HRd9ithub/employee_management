import React from 'react';
import { useLocation} from 'react-router-dom';
import Navbar from './Component/common/Navbar';
import Sidebar from "./Component/common/Sidebar"
import AppRoute from './Component/routes/AppRoute';
// import IdleTimeOutHandler from './service/IdleTimeOutHandler ';
import { GetLocalStorage } from './service/StoreLocalStorage';
import './style/App.scss';
import './style/App.css'
import './style/Responsive.css';
import "bootstrap/dist/js/bootstrap";

function App() {

  const {pathname,key} = useLocation();
  
  // show or hide sidebar and navbar 
  const checkRoute = () => {
    const Root = ['/login','/forgot-password','/reset-password','/otp'];

    return !(Root.includes(pathname) || (key === "default" && !GetLocalStorage("token")))
  }

  return (
    <>
      <div className='wrapper-container d-flex'>
        {/* <IdleTimeOutHandler/> */}
        <div className='sidebar-wrap'>
          {checkRoute() && <Sidebar />}
        </div>
        <div className='sidebar-inner'>
          {checkRoute() && <Navbar />}
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
