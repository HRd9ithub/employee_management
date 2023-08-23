import React, { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import { FaUsers, FaUserAlt } from "react-icons/fa";
import DatePickers from "react-datepicker";
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import GlobalPageRedirect from './auth_context/GlobalPageRedirect';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { AppProvider } from './context/RouteContext';
import { GetLocalStorage } from '../service/StoreLocalStorage';
import { subDays } from 'date-fns';
import { HiOutlineMinus } from "react-icons/hi";

const Dashboard = () => {
     const [startDate, setstartDate] = useState("");
     const [totalEmployee, settotalEmployee] = useState("");
     // eslint-disable-next-line
     const [totalEmployeeActive, settotalEmployeeActive] = useState("");
     const [presentToday, setpresentToday] = useState("");
     const [todayLeave, settodayLeave] = useState([]);
     const [holiday, setHoliday] = useState([])
     const [holidayfilter, setHolidayfilter] = useState([])
     // eslint-disable-next-line
     const [activity, setActivity] = useState([])

     let { getCommonApi } = GlobalPageRedirect();

     let { UserData, leaveNotification } = useContext(AppProvider)

     let navigate = useNavigate();

     // calcedar date change function
     const handleChange = date => {
          setstartDate(date);
          datefilter(date)
     };

     useEffect(() => {
          const getData = async () => {
               try {
                    // setloader(true);
                    let token = GetLocalStorage("token");
                    const request = {
                         headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`,
                         },
                    };
                    const res = await axios.get(`${process.env.REACT_APP_API_KEY}/dashboard`, request);

                    if (res.data.success) {
                         settotalEmployee(res.data.data.totalEmployee)
                         settotalEmployeeActive(res.data.data.totalEmployeeActive)
                         setpresentToday(res.data.data.presentToday)
                         settodayLeave(res.data.data.todayLeave);
                    }
               } catch (error) {
                    console.log(error, " <<< ==== error ");
                    if (error.response.status === 401) {
                         getCommonApi();
                    } else {
                         if (error.response.data.message) {
                              toast.error(error.response.data.message)
                         } else {
                              if (typeof error.response.data.error === "string") {
                                   toast.error(error.response.data.error)
                              }
                         }
                    }
               } finally {
                    // setloader(false);
               }
          }
          const get_holiday_detail = async () => {
               try {
                    let token = GetLocalStorage("token");
                    const request = {
                         headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`
                         },
                    }
                    const res = await axios.get(`${process.env.REACT_APP_API_KEY}/holiday_calendar/list`, request)
                    if (res.data.success) {
                         setHoliday(res.data.data)
                         setHolidayfilter(res.data.data);
                    }
               } catch (error) {
                    console.log('error', error)
                    if (error.response.status === 401) {
                         getCommonApi();
                    } else {
                         if (error.response.data.message) {
                              toast.error(error.response.data.message)
                         } else {
                              if (typeof error.response.data.error === "string") {
                                   toast.error(error.response.data.error)
                              }
                         }
                    }
               }
          }
          const getTime = async () => {
               try {
                    const request = {
                         headers: {
                              Authorization: `Bearer ${GetLocalStorage("token")}`,
                         },
                    };
                    const result = await axios.get(`${process.env.REACT_APP_API_KEY}/timesheet/list`, request);
                    if (result.data.success) {
                         setActivity(result.data.data.filter((elem) => elem.date === moment(new Date()).format("YYYY-MM-DD")).sort((a, b) => new Date(b.date.concat(",", b.login_time)) - new Date(a.date.concat(",", a.login_time))).sort((a, b) => new Date(b.date.concat(",", b.logout_time)) - new Date(a.date.concat(",", a.logout_time))));
                    }
               } catch (error) {
                    console.log("TimeSheetComponent page all data get api === >>> ", error);
                    if (error.response.status === 401) {
                         getCommonApi();
                    } else {
                         if (error.response.data.message) {
                              toast.error(error.response.data.message)
                         } else {
                              if (typeof error.response.data.error === "string") {
                                   toast.error(error.response.data.error)
                              }
                         }
                    }
               }
          }
          if (GetLocalStorage("token")) {
               getData();
               get_holiday_detail();
               getTime();
          }
          // eslint-disable-next-line
     }, [])

     useEffect(() => {
          if (holidayfilter.length !== 0) {
               datefilter(new Date());
          }
          // eslint-disable-next-line
     }, [holidayfilter])

     const datefilter = (date) => {
          let data = holidayfilter.filter((val) => {
               return val.date === moment(date).format("YYYY-MM-DD")
          })
          setHoliday(data)
     }

     return (
          <>
               <motion.div className="box pt-3" initial={{ opacity: 0, transform: "translateY(-20px)" }} animate={{ opacity: 1, transform: "translateY(0px)" }} transition={{ duration: 0.5 }}>
                    <div className='employee-content '>
                         <div className='container-fluid inner-pages py-3'>
                              <div className='row p-3 align-items-center row-std'>
                                   <div className='col-12 employee-path' id="one">
                                        <h2 className='page-title pb-2' style={{ borderBottom: "2px solid" }}>Dashboard</h2>
                                   </div>
                              </div>
                              <div className="row mt-3">
                                   <div className={`mb-2 position-relative box-dashboard ${UserData.role && UserData.role.name.toLowerCase() === "admin" ? "col-lg-3 col-md-6" : "col-md-4"}`} onClick={() => UserData.role && UserData.role.name.toLowerCase() === "admin" && navigate("/employees")}>
                                        <NavLink className="common-box-dashboard total-employee nav-link">
                                             <img src={require("../assets/images/dashboard/circle.png")} className="card-img-absolute" alt="circle" />
                                             <div className="common-info-dashboard">
                                                  <h2>{totalEmployee}</h2>
                                                  <FaUsers />
                                             </div>
                                             <h4 className="mt-2">Total Employees</h4>
                                        </NavLink>
                                   </div>
                                   {UserData.role && UserData.role.name.toLowerCase() === "admin" && <>
                                        <div className="col-lg-3 col-md-6  mb-2 position-relative box-dashboard" onClick={() => navigate("/leave")}>
                                             <NavLink className="common-box-dashboard employee-active nav-link">
                                                  <img src={require("../assets/images/dashboard/circle.png")} className="card-img-absolute" alt="circle" />
                                                  <div className="common-info-dashboard">
                                                       <h2>{leaveNotification.length}</h2>
                                                       <i className="fa-solid fa-image-portrait"></i>

                                                  </div>
                                                  <h4 className="mt-2">Leave Requests</h4>
                                             </NavLink>
                                        </div>
                                        <div className={`mb-2 position-relative box-dashboard ${UserData.role && UserData.role.name.toLowerCase() === "admin" ? "col-lg-3 col-md-6" : "col-md-4"}`}  onClick={() => navigate("/timesheet")}>
                                        <NavLink className="common-box-dashboard Present nav-link">
                                             <img src={require("../assets/images/dashboard/circle.png")} className="card-img-absolute" alt="circle" />
                                             <div className="common-info-dashboard">
                                                  <h2>{presentToday}</h2>
                                                  <FaUserAlt />
                                             </div>
                                             <h4 className="mt-2">Present Today</h4>
                                        </NavLink>
                                   </div>
                                   <div className={`mb-2 position-relative box-dashboard ${UserData.role && UserData.role.name.toLowerCase() === "admin" ? "col-lg-3 col-md-6" : "col-md-4"}`}  onClick={() => navigate("/leave")}>
                                        <NavLink className="common-box-dashboard Today nav-link">
                                             <img src={require("../assets/images/dashboard/circle.png")} className="card-img-absolute" alt="circle" />
                                             <div className="common-info-dashboard">
                                                  <h2>{todayLeave.length}</h2>
                                                  <i className="fa-solid fa-bookmark"></i>
                                             </div>
                                             <h4 className="mt-2">Absent Today</h4>
                                        </NavLink>
                                   </div></>}
                              </div>

                              <div className='row'>
                                   <div className='col-md-5 mt-3 box-dashboard'>
                                        <div className="dashboard-custom-date-picker shadow">
                                             {(() => {
                                                  let highlight = [];

                                                  for (let index = 0; index < holidayfilter.length; index++) {
                                                       highlight.push(subDays(new Date(`${holidayfilter[index].date}`), 0));
                                                  }
                                                  return (
                                                       <DatePickers inline selected={startDate} onChange={handleChange} highlightDates={highlight}/>
                                                  );
                                             })()}
                                        </div>
                                   </div> 
                                   <div className='col-md-7 pl-md-0 box-dashboard'>
                                        <div className='col-md-12 px-0 mt-3 d-flex align-items-center justify-content-center'>
                                             <div className='my-chart'>
                                                  <div className='my-chart-head text-center'>List of Holiday</div>
                                                  <div className='p-3'>

                                                       <ul>
                                                            {holiday.map((val) => {
                                                                 return <li key={val.id}>{val.name}</li>
                                                            })}
                                                       </ul>
                                                       {holiday.length === 0 && 
                                                       <ul>
                                                            No Holiday !
                                                       </ul>}
                                                  </div>
                                             </div>
                                        </div>
                                        <div className='col-md-12 px-0 mt-3 d-flex align-items-center justify-content-center'>
                                             <div className='my-chart'>
                                                  <div className='my-chart-head text-center'>On Leave Today</div>
                                                  <div className='p-3'>
                                                       {/* <ul>
                                                            {todayLeave?.map((val) => {
                                                            return (
                                                                 <div className="text-capitalize d-flex align-items-center" key={val.id}>
                                                                      <NavLink className={'pr-3'} to={`${process.env.REACT_APP_IMAGE_API}/storage/${val.user?.profile_image}`} target="_blank">
                                                                            eslint-disable-next-line 
                                                                           <img className="profile-action-icon text-center" src={val.user?.profile_image && `${process.env.REACT_APP_IMAGE_API}/storage/${val.user?.profile_image}`} alt="Profile image" />
                                                                      </NavLink>
                                                                      {val.user ? val.user?.first_name.concat(" ", val.user?.last_name) : <HiOutlineMinus/>}
                                                                 </div>
                                                            )
                                                       })}
                                                  </ul>  */}
                                                  {todayLeave.length === 0 && totalEmployee !== 0 && presentToday === totalEmployee &&
                                                       <ul>
                                                            <li> Wow! Everyone is Present Today.</li>
                                                       </ul>}
                                             </div>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
                    </div>
               </motion.div>
          </>
     )
}

export default Dashboard
