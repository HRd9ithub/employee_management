import React, { useContext, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DatePickers from "react-datepicker";
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import { NavLink, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import GlobalPageRedirect from './auth_context/GlobalPageRedirect';
import moment from 'moment';
import { AppProvider } from './context/RouteContext';
import { GetLocalStorage } from '../service/StoreLocalStorage';
import { subDays } from 'date-fns';
import Spinner from './common/Spinner';
import { dateFormat } from '../helper/dateFormat';
import ConfettiExplosion from 'react-confetti-explosion';
import { customAxios } from '../service/CreateApi';

const Dashboard = () => {
     let userId = GetLocalStorage("user_id");
     const [isLoading, setisLoading] = useState(false)
     const [animateLoader, setanimateLoader] = useState(false)
     const [startDate, setstartDate] = useState("");
     const [totalEmployee, settotalEmployee] = useState("");
     const [leaveRequest, setleaveRequest] = useState("");
     const [presentToday, setpresentToday] = useState("");
     const [todayLeave, settodayLeave] = useState([]);
     const [holiday, setHoliday] = useState([])
     const [holidayfilter, setHolidayfilter] = useState([])
     const [birthDay, setBirthDay] = useState([])
     const [birthDayFilter, setBirthDayFilter] = useState([])

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
                    setisLoading(true);
                    const res = await customAxios().get('/dashboard');

                    if (res.data.success) {
                         let { totalEmployee, leaveRequest, presentToday, absentToday, holidayDay, birthDay } = res.data
                         settotalEmployee(totalEmployee)
                         setpresentToday(presentToday)
                         settodayLeave(absentToday);
                         setBirthDay(birthDay);
                         setHolidayfilter(holidayDay);
                         setleaveRequest(leaveRequest);
                         let birthDayFilter = birthDay.find((item) => {
                              return item._id === userId && moment(item.date_of_birth).format("DD-MM") === moment(new Date()).format("DD-MM")
                         });
                         if (birthDayFilter) {
                              let data = JSON.parse(localStorage.getItem("employeeBirthday"));
                              if (!data) {
                                   setanimateLoader(true);
                                   localStorage.setItem("employeeBirthday", true);
                              }
                         } else {
                              localStorage.removeItem("employeeBirthday");
                         }
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
                    setisLoading(false);
                    setTimeout(() => {
                         setanimateLoader(false)
                    }, [15000])
               }
          }
          if (GetLocalStorage("token")) {
               getData();
          }
          // eslint-disable-next-line
     }, [])

     // * ======== Default get holiday and BirthDate data  ========
     useEffect(() => {
          const startOfMonth = moment(new Date()).format('YYYY-MM-DD');
          const endOfMonth = moment().endOf('month').format('YYYY-MM-DD');

          if (holidayfilter.length !== 0) {
               let data = holidayfilter.filter((val) => {
                    return val.date >= startOfMonth && val.date <= endOfMonth
               })
               setHoliday(data)
          }
          if (birthDay.length !== 0) {
               birthFilter(new Date())
          }
          // eslint-disable-next-line
     }, [holidayfilter])

     // Filtering the date of Holiday
     const datefilter = (date) => {
          let data = holidayfilter.filter((val) => {
               return val.date === moment(date).format("YYYY-MM-DD")
          })

          setHoliday(data)
     }

     // Filtering the date of birth
     const birthFilter = (date) => {
          let birth = birthDay.filter((val) => {
               return moment(val.date_of_birth).format("DD-MM") === moment(date).format("DD-MM") && val._id !== userId
          })
          setBirthDayFilter(birth)
     }

     // view all click
     const allStatusChange = async () => {
          try {
               setisLoading(true);
               const res = await customAxios().post('/leave/status')
               if (res.data.success) {
                    navigate('/leaves')
                    setisLoading(false)
               }
          } catch (error) {
               setisLoading(false)
               if (!error.response) {
                    toast.error(error.message)
               } else if (error.response.status === 401) {
                    getCommonApi();
               } else {
                    if (error.response.data.message) {
                         toast.error(error.response.data.message)
                    }
               }
          }
     }

     return (
          <>
               <motion.div className="box" initial={{ opacity: 0, transform: "translateY(-20px)" }} animate={{ opacity: 1, transform: "translateY(0px)" }} transition={{ duration: 0.5 }}>
                    {!isLoading && <div className=''>
                         <div className='container-fluid inner-pages py-3'>
                              {/* Summary part of dashboard */}
                              {UserData && UserData?.role && UserData.role.name.toLowerCase() === "admin" &&
                                   <div className="row mt-3">
                                        <div className={`mb-4 mt-lg-0 mt-xl-0 mt-2 position-relative box-dashboard col-lg-3 col-md-6`} onClick={() => navigate("/employees")}>
                                             <NavLink className="common-box-dashboard position-relative h-100 total-employee nav-link">
                                                  <img src={require("../assets/images/dashboard/circle.png")} className="card-img-absolute" alt="circle" />
                                                  <div className="common-info-dashboard">
                                                       <h3 className="mb-0">Total Employees</h3>
                                                       <h3 className="mb-0">{totalEmployee}</h3>
                                                  </div>
                                             </NavLink>
                                        </div>
                                        <div className={`mb-4 mt-lg-0 mt-xl-0 mt-2 position-relative box-dashboard col-lg-3 col-md-6`} onClick={() => navigate("/employees")}>
                                             <NavLink className="common-box-dashboard position-relative h-100 Present nav-link">
                                                  <img src={require("../assets/images/dashboard/circle.png")} className="card-img-absolute" alt="circle" />
                                                  <div className="common-info-dashboard">
                                                       <h3 className="mb-0">Present Today</h3>
                                                       <h3 className="mb-0">{presentToday}</h3>
                                                  </div>
                                             </NavLink>
                                        </div>
                                        <div className={`mb-4 mt-lg-0 mt-xl-0 mt-2 position-relative box-dashboard col-lg-3 col-md-6`} onClick={() => navigate("/leaves")}>
                                             <NavLink className="common-box-dashboard position-relative h-100 Today nav-link">
                                                  <img src={require("../assets/images/dashboard/circle.png")} className="card-img-absolute" alt="circle" />
                                                  <div className="common-info-dashboard">
                                                       <h3 className="mb-0">Absent Today</h3>
                                                       <h3 className="mb-0">{todayLeave.length}</h3>
                                                  </div>
                                             </NavLink>
                                        </div>
                                        <div className="mb-4 mt-lg-0 mt-xl-0 mt-2 position-relative box-dashboard col-lg-3 col-md-6">
                                             <NavLink className="common-box-dashboard position-relative h-100 employee-active nav-link" onClick={allStatusChange}>
                                                  <img src={require("../assets/images/dashboard/circle.png")} className="card-img-absolute" alt="circle" />
                                                  <div className="common-info-dashboard">
                                                       <h3 className="mb-0">Leave Request</h3>
                                                       <h3 className="mb-0">{leaveRequest}</h3>
                                                  </div>
                                             </NavLink>
                                        </div>
                                   </div>
                              }

                              <div className='row'>
                                   {/* calcendar display */}
                                   <div className='col-lg-4 col-md-6 mt-3 box-dashboard'>
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
                                   {/* holiday box */}
                                   <div className='col-lg-4 col-md-6 mt-3 box-dashboard'>
                                        <div className='my-chart'>
                                             <div className='my-chart-head text-center'>Holiday</div>
                                             <div className='p-3'>
                                                  <ul>
                                                       {holiday.map((val) => {
                                                            return <li key={val._id} className='my-2' style={{ background: '#ff3a3a' }}><h4 className='my-1'>{dateFormat(val.date)} - {val.name}</h4></li>
                                                       })}
                                                       {birthDayFilter.map((val) => {
                                                            return <li key={val._id} className='my-2'><h4 className='my-1'>Happy Birthday {val.first_name?.concat(" ", val.last_name)}</h4></li>
                                                       })}
                                                  </ul>
                                                  {holiday.length === 0 && birthDayFilter.length === 0 &&
                                                       <h3 className='text-center' style={{ 'color': '#a3aab1' }}>No Records Found !</h3>}
                                             </div>
                                        </div>
                                   </div>
                                   {/* leave box */}
                                   <div className='col-lg-4 col-md-6 mt-3 box-dashboard'>
                                        <div className='my-chart'>
                                             <div className='my-chart-head text-center'>Leave</div>
                                             <div className='p-3'>
                                                  <ul>
                                                       {todayLeave.map((val, ind) => {
                                                            return <li key={val._id} className='my-2' ><h4 className='my-1'>{ind + 1}. {val.user.first_name.concat(" ", val.user.last_name)}</h4></li>
                                                       })}
                                                       {todayLeave.length === 0 && totalEmployee !== 0 && <h3 className='text-center' style={{ 'color': '#a3aab1' }}>All present today</h3>}
                                                  </ul>
                                                  {totalEmployee === 0 &&
                                                       <h3 className='text-center' style={{ 'color': '#a3aab1' }}>No employee yet</h3>}
                                             </div>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>}
               </motion.div>
               {isLoading && <Spinner />}
               {/* birthday animation */}
               {!isLoading && animateLoader &&
                    <div className="animate-celebration">
                         <div className="animate-celebration-content">
                              <img src="./Images/birthday-emoji.png" alt="img" />
                              <h2 className='text-center my-3'>Happy Birthday</h2>
                              <p className='mb-0 text-center'>The warmest wishes to a great member of our team. May your special day be full of happiness, fun and cheer!</p>
                         </div>
                         <ConfettiExplosion duration={25000} force={0.5} particleCount={250} width={4000} height={4000} />
                    </div>}
          </>
     )
}

export default Dashboard
