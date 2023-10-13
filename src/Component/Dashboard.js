import React, { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import { FaUsers } from "react-icons/fa";
import CoPresentIcon from '@mui/icons-material/CoPresent';
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
import Spinner from './common/Spinner';
import ApprovalIcon from '@mui/icons-material/Approval';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import NoAccountsIcon from '@mui/icons-material/NoAccounts';
import { dateFormat } from '../helper/dateFormat';
import ConfettiExplosion from 'react-confetti-explosion';
import {customAxios} from '../service/CreateApi';


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
                         if(birthDayFilter){
                           let data = JSON.parse(localStorage.getItem("employeeBirthday"));
                           if(!data){
                                setanimateLoader(true);
                                localStorage.setItem("employeeBirthday",true);
                           }
                         }else{
                              localStorage.removeItem("employeeBirthday");
                         }
                         // setreportBy(reportBy)
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

     useEffect(() => {
          // datefilter(new Date());
          const startOfMonth = moment().startOf('month').format('YYYY-MM-DD');
          const endOfMonth = moment().endOf('month').format('YYYY-MM-DD');
          // const startOfDate = moment().startOf('month').format('DD-MM');
          // const endOfDate = moment().endOf('month').format('DD-MM');
          if (holidayfilter.length !== 0) {
               let data = holidayfilter.filter((val) => {
                    return val.date >= startOfMonth && val.date <= endOfMonth
               })
               setHoliday(data)
          }
          if (birthDay.length !== 0) {
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
                    navigate('/leave')
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

     var bdcApi = "https://api.bigdatacloud.net/data/reverse-geocode-client"

     // eslint-disable-next-line
     const getLoau = () => {
          navigator.geolocation.getCurrentPosition(
               (position) => {
                    bdcApi = bdcApi
                         + "?latitude=" + position.coords.latitude
                         + "&longitude=" + position.coords.longitude
                         + "&localityLanguage=en";
                    getApi(bdcApi);

               },
               (err) => { getApi(bdcApi); },
               {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
               });
     }

     const getApi = async (bdcApi) => {
          try {
               axios.get(bdcApi).then((data) => console.log(data))
          } catch (error) {
               console.log(error)
          }
     }


     return (
          <>
               <motion.div className="box" initial={{ opacity: 0, transform: "translateY(-20px)" }} animate={{ opacity: 1, transform: "translateY(0px)" }} transition={{ duration: 0.5 }}>
                    {!isLoading && <div className=''>
                         <div className='container-fluid inner-pages py-3'>
                              <div className='row p-3 align-items-center row-std'>
                                   <div className='col-12 employee-path px-2' id="one">
                                        <h2 className='page-title pb-2' style={{ borderBottom: "2px solid" }}>Dashboard</h2>
                                   </div>
                              </div>
                              <div className="row mt-3">
                                   {UserData && UserData?.role && UserData.role.name.toLowerCase() === "admin" && <>
                                        <div className={`mb-4 mt-lg-0 mt-xl-0 mt-2 position-relative box-dashboard col-lg-3 col-md-6`} onClick={() => navigate("/employees")}>
                                             <NavLink className="common-box-dashboard total-employee nav-link">
                                                  <img src={require("../assets/images/dashboard/circle.png")} className="card-img-absolute" alt="circle" />
                                                  <div className="common-info-dashboard">
                                                       <h2>{totalEmployee}</h2>
                                                       <FaUsers />
                                                  </div>
                                                  <h4 className="mt-2">Total Employees</h4>
                                             </NavLink>
                                        </div>
                                        <div className={`mb-4 mt-lg-0 mt-xl-0 mt-2 position-relative box-dashboard col-lg-3 col-md-6`} onClick={() => navigate("/employees")}>
                                             <NavLink className="common-box-dashboard Present nav-link">
                                                  <img src={require("../assets/images/dashboard/circle.png")} className="card-img-absolute" alt="circle" />
                                                  <div className="common-info-dashboard">
                                                       <h2>{presentToday}</h2>
                                                       <CoPresentIcon />
                                                  </div>
                                                  <h4 className="mt-2">Present Today</h4>
                                             </NavLink>
                                        </div>
                                        <div className={`mb-4 mt-lg-0 mt-xl-0 mt-2 position-relative box-dashboard col-lg-3 col-md-6`} onClick={() => navigate("/leave")}>
                                             <NavLink className="common-box-dashboard Today nav-link">
                                                  <img src={require("../assets/images/dashboard/circle.png")} className="card-img-absolute" alt="circle" />
                                                  <div className="common-info-dashboard">
                                                       <h2>{todayLeave.length}</h2>
                                                       <NoAccountsIcon />
                                                  </div>
                                                  <h4 className="mt-2">Absent Today</h4>
                                             </NavLink>
                                        </div>
                                        <div className="mb-4 mt-lg-0 mt-xl-0 mt-2 position-relative box-dashboard col-lg-3 col-md-6">
                                             <NavLink className="common-box-dashboard employee-active nav-link" onClick={allStatusChange}>
                                                  <img src={require("../assets/images/dashboard/circle.png")} className="card-img-absolute" alt="circle" />
                                                  <div className="common-info-dashboard">
                                                       <h2>{leaveRequest}</h2>
                                                       <ApprovalIcon />
                                                  </div>
                                                  <h4 className="mt-2">Leave Requests</h4>
                                             </NavLink>
                                        </div>
                                   </>}
                                   <div className={`mb-3 mt-lg-0 mt-xl-0 mt-2 position-relative box-dashboard col-lg-3 col-md-6`} onClick={() => UserData?.role && UserData.role.name.toLowerCase() === "admin" && navigate("/leave")}>
                                        <NavLink className="common-box-dashboard on-leave-today nav-link" style={{
                                        cursor : UserData?.role && UserData.role.name.toLowerCase() !== "admin" && "default"
                                   }}>
                                             <img src={require("../assets/images/dashboard/circle.png")} className="card-img-absolute" alt="circle" />
                                             <div className="common-info-dashboard">
                                                  <h4>On Leave Today</h4>
                                                  <FactCheckIcon />
                                             </div>

                                             <div className='d-flex justify-content-start align-items-center flex-wrap mt-3'>
                                                  {todayLeave.map((val, ind) => {
                                                       return <h5 className='mr-4' key={val._id}>{ind + 1}. {val.user.first_name.concat(" ", val.user.last_name)}</h5>
                                                  })}
                                                  {todayLeave.length === 0 && totalEmployee !== 0 && <h5 className='mr-4'>All present today</h5>}
                                                  {totalEmployee === 0 && <h5 className='mr-4'>No employee yet</h5>}
                                             </div>
                                        </NavLink>
                                   </div>
                              </div>

                              <div className='row'>
                                   <div className='col-md-6 mt-3 box-dashboard'>
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
                                   <div className='col-md-6 mt-3 box-dashboard'>
                                        <div className='my-chart'>
                                             <div className='my-chart-head text-center'>Holiday</div>
                                             {/* <div className='my-chart-head text-center'>Bookmarks</div> */}
                                             <div className='p-3'>
                                                  <ul>
                                                       {holiday.map((val) => {
                                                            return <li key={val._id} className='my-2' style={{background: '#ff3a3a'}}><h4 className='my-1'>{dateFormat(val.date)} - {val.name}</h4></li>
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
                              </div>
                         </div>
                    </div>}
               </motion.div>
               {isLoading && <Spinner />}
               {!isLoading && animateLoader &&
                    <div className="animate-celebration">
                         <div className="animate-celebration-content">
                              <img src="./Images/birthday-emoji.png" alt="img"/>
                              <h2 className='text-center my-3'>Happy Birthday</h2>
                              <p className='mb-0 text-center'>The warmest wishes to a great member of our team. May your special day be full of happiness, fun and cheer!</p>
                         </div>
                         <ConfettiExplosion duration={25000} force={0.5} particleCount={250} width={4000} height={4000} />
                    </div>}
          </>
     )
}

export default Dashboard
