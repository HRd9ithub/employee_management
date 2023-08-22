import React, { useState } from 'react';
import './style/App.scss';
import './style/App.css'
import './style/Responsive.css'
import { useLocation } from 'react-router-dom';
import Navbar from './Component/common/Navbar';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from "./Component/common/Sidebar"
import AppRoute from './Component/routes/AppRoute';

function App() {
  let location = useLocation();
  // eslint-disable-next-line
  const [progress, setProgress] = useState(0)


  // progress bar handle function
  const HandleProgress = (value) => {
    setProgress(value)
  }


  return (
    <>
      {/* top loader bar */}
      {/* <LoadingBar
        color='#2da2e5'
        progress={progress}
        height={3}
        onLoaderFinished={() => HandleProgress(0)}
      /> */}
      <div className='wrapper-container d-flex'>
        <div className='sidebar-wrap'>
          {location.pathname === '/login' || location.pathname === '/password' || location.pathname === '/set_new_password' ? '' : <Sidebar />}
        </div>
        <div className='sidebar-inner'>
          {location.pathname === '/login' || location.pathname === '/password' || location.pathname === '/set_new_password' ? '' : <Navbar />}
          <div className="main-panel">
            <div className="content-wrapper">
              {/* route file */}
              <AppRoute HandleProgress={HandleProgress} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
