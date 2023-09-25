import React from 'react';
import './style/App.scss';
import './style/App.css'
import './style/Responsive.css'
import { useLocation} from 'react-router-dom';
import Navbar from './Component/common/Navbar';
import Sidebar from "./Component/common/Sidebar"
import AppRoute from './Component/routes/AppRoute';
import socketIO from "socket.io-client";
import { useEffect } from 'react';
import GlobalPageRedirect from './Component/auth_context/GlobalPageRedirect';
import IdleTimeOutHandler from './service/IdleTimeOutHandler ';
const socket = socketIO.connect(process.env.REACT_APP_IMAGE_API);


function App() {

  let { getCommonApi } = GlobalPageRedirect();
  let location = useLocation();

  useEffect(() => {
    socket.on("receive", (data) => {
      if (data.isAuth) {
        getCommonApi()
      }
    })
    // eslint-disable-next-line
  }, [socket])

  return (
    <>
      <div className='wrapper-container d-flex'>
        <IdleTimeOutHandler/>
        <div className='sidebar-wrap'>
          {location.pathname === '/login' || location.pathname === '/password' || location.pathname === '/set_new_password' ? '' : <Sidebar />}
        </div>
        <div className='sidebar-inner'>
          {location.pathname === '/login' || location.pathname === '/password' || location.pathname === '/set_new_password' ? '' : <Navbar socket={socket} />}
          <div className="main-panel">
            <div className="content-wrapper">
              {/* route file */}
              <AppRoute socket={socket} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
