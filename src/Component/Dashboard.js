import React, { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import { FaUsers, FaUserAlt } from "react-icons/fa";
import DatePickers from "react-datepicker";
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import GlobalPageRedirect from './auth_context/GlobalPageRedirect';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { AppProvider } from './context/RouteContext';
import { GetLocalStorage } from '../service/StoreLocalStorage';
import { subDays } from 'date-fns';
import { HiOutlineMinus } from "react-icons/hi";
import Spinner from './common/Spinner';
import Avatar from '@mui/material/Avatar';


const Dashboard = () => {
     const [loader, setLoader] = useState(false)
     const [startDate, setstartDate] = useState("");
     const [totalEmployee, settotalEmployee] = useState("");
     const [leaveRequest, setleaveRequest] = useState("");
     const [presentToday, setpresentToday] = useState("");
     const [todayLeave, settodayLeave] = useState([]);
     const [holiday, setHoliday] = useState([])
     const [holidayfilter, setHolidayfilter] = useState([])
     const [birthDay, setBirthDay] = useState([])
     const [birthDayFilter, setBirthDayFilter] = useState([])
     const [reportBy, setreportBy] = useState([])

     let { getCommonApi } = GlobalPageRedirect();

     let { UserData } = useContext(AppProvider)

     let navigate = useNavigate();

     // calcedar date change function
     const handleChange = date => {
          setstartDate(date);
          datefilter(date)
          birthFilter(date)
     };

     useEffect(() => {
          const getData = async () => {
               try {
                    setLoader(true);
                    let token = GetLocalStorage("token");
                    const request = {
                         headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`,
                         },
                    };
                    const res = await axios.get(`${process.env.REACT_APP_API_KEY}/dashboard`, request);

                    if (res.data.success) {
                         let { totalEmployee, leaveRequest, presentToday, absentToday, holidayDay, birthDay, reportBy } = res.data
                         settotalEmployee(totalEmployee)
                         setpresentToday(presentToday)
                         settodayLeave(absentToday);
                         setBirthDay(birthDay);
                         setHolidayfilter(holidayDay)
                         setleaveRequest(leaveRequest)
                         setreportBy(reportBy)
                    }
               } catch (error) {
                    if (!error.response) {
                         toast.error(error.message)
                    } else if (error.response.status === 401) {
                         getCommonApi();
                    } else if (error.response.data.message) {
                         toast.error(error.response.data.message)
                    }
               } finally {
                    setLoader(false);
               }
          }
          if (GetLocalStorage("token")) {
               getData();
          }
          // eslint-disable-next-line
     }, [])

     useEffect(() => {
          // datefilter(new Date());
          const startOfMonth = moment().startOf('month').format('YYYY-MM-DD');
          const endOfMonth = moment().endOf('month').format('YYYY-MM-DD');
          // const startOfDate = moment().startOf('month').format('DD-MM');
          // const endOfDate = moment().endOf('month').format('DD-MM');
          if (holidayfilter.length !== 0) {
               let data = holidayfilter.filter((val) => {
                    return val.date >= startOfMonth &&  val.date <= endOfMonth
               })
               setHoliday(data)
          }
          if(birthDay.length !== 0){
               // let birth = birthDay.filter((val) => {
               //      return moment(val.date_of_birth).format("DD-MM") >= startOfDate && moment(val.date_of_birth).format("DD-MM") <= endOfDate
               // })
               // setBirthDayFilter(birth)
               birthFilter(new Date())
          }
          // eslint-disable-next-line
     }, [holidayfilter])

     const datefilter = (date) => {
          let data = holidayfilter.filter((val) => {
               return val.date === moment(date).format("YYYY-MM-DD")
          })
      
          setHoliday(data)
     }

     const birthFilter = (date) => {
          let birth = birthDay.filter((val) => {
               return moment(val.date_of_birth).format("DD-MM") === moment(date).format("DD-MM")
          })
          setBirthDayFilter(birth)
     }

     return (
          <>
               <motion.div className="box" initial={{ opacity: 0, transform: "translateY(-20px)" }} animate={{ opacity: 1, transform: "translateY(0px)" }} transition={{ duration: 0.5 }}>
                    <div className=''>
                         <div className='container-fluid inner-pages py-3'>
                              <div className='row p-3 align-items-center row-std'>
                                   <div className='col-12 employee-path px-2' id="one">
                                        <h2 className='page-title pb-2' style={{ borderBottom: "2px solid" }}>Dashboard</h2>
                                   </div>
                              </div>
                              {UserData && UserData?.role && UserData.role.name.toLowerCase() === "admin" && <>
                                   <div className="row mt-3">
                                        <div className={`mb-2 position-relative box-dashboard col-lg-3 col-md-6`} onClick={() => navigate("/employees")}>
                                             <NavLink className="common-box-dashboard total-employee nav-link">
                                                  <img src={require("../assets/images/dashboard/circle.png")} className="card-img-absolute" alt="circle" />
                                                  <div className="common-info-dashboard">
                                                       <h2>{totalEmployee}</h2>
                                                       <FaUsers />
                                                  </div>
                                                  <h4 className="mt-2">Total Employees</h4>
                                             </NavLink>
                                        </div>
                                        <div className="col-lg-3 col-md-6  mb-2 position-relative box-dashboard" onClick={() => navigate("/leave")}>
                                             <NavLink className="common-box-dashboard employee-active nav-link">
                                                  <img src={require("../assets/images/dashboard/circle.png")} className="card-img-absolute" alt="circle" />
                                                  <div className="common-info-dashboard">
                                                       <h2>{leaveRequest}</h2>
                                                       <i className="fa-solid fa-image-portrait"></i>

                                                  </div>
                                                  <h4 className="mt-2">Leave Requests</h4>
                                             </NavLink>
                                        </div>
                                        <div className={`mb-2 position-relative box-dashboard col-lg-3 col-md-6`} onClick={() => navigate("/timesheet")}>
                                             <NavLink className="common-box-dashboard Present nav-link">
                                                  <img src={require("../assets/images/dashboard/circle.png")} className="card-img-absolute" alt="circle" />
                                                  <div className="common-info-dashboard">
                                                       <h2>{presentToday}</h2>
                                                       <FaUserAlt />
                                                  </div>
                                                  <h4 className="mt-2">Present Today</h4>
                                             </NavLink>
                                        </div>
                                        <div className={`mb-2 position-relative box-dashboard col-lg-3 col-md-6`} onClick={() => navigate("/leave")}>
                                             <NavLink className="common-box-dashboard Today nav-link">
                                                  <img src={require("../assets/images/dashboard/circle.png")} className="card-img-absolute" alt="circle" />
                                                  <div className="common-info-dashboard">
                                                       <h2>{todayLeave.length}</h2>
                                                       <i className="fa-solid fa-bookmark"></i>
                                                  </div>
                                                  <h4 className="mt-2">Absent Today</h4>
                                             </NavLink>
                                        </div>
                                   </div>
                              </>}

                              {UserData && UserData?.role && UserData.role.name.toLowerCase() !== "admin" &&
                                   reportBy.length !== 0 &&
                                   <div className={`mb-2 position-relative box-dashboard col-md-4`} >
                                        <div className="common-box-dashboard total-employee nav-link">
                                             <h4 className="mt-2">Report By</h4>
                                             <img src={require("../assets/images/dashboard/circle.png")} className="card-img-absolute" alt="circle" />
                                             <ol className="common-info-dashboard d-flex flex-column">
                                                  {reportBy.map((val) => {
                                                       return <li key={val._id} style={{ fontSize: "15px" }}>{val.first_name?.concat(" ", val.last_name)}</li>
                                                  })}
                                             </ol>
                                        </div>
                                   </div>
                              }

                              <div className='row'>
                                   <div className='col-md-5 mt-3 box-dashboard'>
                                        <div className="dashboard-custom-date-picker shadow">
                                             {(() => {
                                                  let highlight = [];

                                                  holidayfilter.forEach((val) => {
                                                       highlight.push(subDays(new Date(val.date), 0));
                                                  })
                                                  return (
                                                       <DatePickers inline selected={startDate} onChange={handleChange} highlightDates={highlight} />
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
                                                                 return <li key={val._id} className='my-2'>{val.name}</li>
                                                            })}
                                                            {birthDayFilter.map((val) => {
                                                                 return <li key={val._id} className='my-2'>Happy Birthday {val.first_name?.concat(" ", val.last_name)}</li>
                                                            })}
                                                       </ul>
                                                       {holiday.length === 0 && birthDayFilter.length === 0 &&
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
                                                       <ul>
                                                            {todayLeave?.map((val) => {
                                                                 return (
                                                                      <div className="text-capitalize d-flex align-items-center" key={val._id}>
                                                                           <NavLink className={'pr-3'} to={`${process.env.REACT_APP_IMAGE_API}/${val.user?.profile_image}`} target="_blank">
                                                                                <Avatar alt={val.user?.first_name} src={val.user?.profile_image && `${process.env.REACT_APP_IMAGE_API}/${val.user?.profile_image}`} sx={{ width: 34, height: 34 }} />
                                                                           </NavLink>
                                                                           {val.user ? val.user?.first_name.concat(" ", val.user?.last_name) : <HiOutlineMinus />}
                                                                      </div>
                                                                 )
                                                            })}
                                                       </ul>
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
               {loader && <Spinner />}
          </>
     )
}

export default Dashboard
