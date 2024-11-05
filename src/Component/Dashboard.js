import React, { useContext, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DatePickers from "react-datepicker";
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import { NavLink, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import moment from 'moment';
import { AppProvider } from './context/RouteContext';
import { GetLocalStorage, SetLocalStorage } from '../service/StoreLocalStorage';
import { subDays } from 'date-fns';
import Spinner from './common/Spinner';
import { dateFormat } from '../helper/dateFormat';
import ConfettiExplosion from 'react-confetti-explosion';
import { customAxios } from '../service/CreateApi';

const Dashboard = () => {
     const userId = GetLocalStorage("user_id");
     const [isLoading, setisLoading] = useState(false)
     const [animateLoader, setanimateLoader] = useState(false)
     const [startDate, setstartDate] = useState("");
     const [totalEmployee, settotalEmployee] = useState(0);
     const [inActiveEmployee, setInActiveEmployee] = useState(0);
     const [leaveRequest, setleaveRequest] = useState(0);
     const [leaveRequestData, setleaveRequestData] = useState([]);
     const [presentToday, setpresentToday] = useState(0);
     const [absentTodayCount, setabsentTodayCount] = useState(0);
     const [halfLeaveToday, sethalfLeaveToday] = useState(0);
     const [todayLeave, settodayLeave] = useState([]);
     const [holiday, setHoliday] = useState([])
     const [holidayfilter, setHolidayfilter] = useState([])
     const [birthDay, setBirthDay] = useState([])
     const [birthDayFilter, setBirthDayFilter] = useState([])
     const [monthDayArray, setmonthDayArray] = useState([])
     const [birthDayToggle, setBirtDayToggle] = useState(true);

     let { UserData, setStartDate, setendtDate, setuser_id } = useContext(AppProvider)

     let navigate = useNavigate();

     // calcedar date change function
     const handleChange = date => {
          if (moment(startDate).format("DD-MM-YYYY") === moment(date).format("DD-MM-YYYY")) {
               setBirtDayToggle(!birthDayToggle)
          } else {
               setBirtDayToggle(true)
          }
          datefilter(date);
          birthFilter(date)
          setstartDate(date);
     };

     useEffect(() => {
          const getData = async () => {
               try {
                    setisLoading(true);
                    const res = await customAxios().get('/dashboard');

                    if (res.data.success) {
                         let { totalEmployee, leaveRequest, leaveRequestData, inActiveEmployee, presentToday, absentToday, holidayDay, birthDay, absentTodayCount, halfLeaveToday } = res.data
                         settotalEmployee(totalEmployee)
                         setpresentToday(presentToday)
                         settodayLeave(absentToday);
                         setInActiveEmployee(inActiveEmployee);
                         setBirthDay(birthDay);
                         setHolidayfilter(holidayDay);
                         setabsentTodayCount(absentTodayCount);
                         sethalfLeaveToday(halfLeaveToday);
                         setleaveRequest(leaveRequest);
                         setleaveRequestData(leaveRequestData);
                         let birthDayFilter = birthDay.find((item) => {
                              return moment(item.date_of_birth).format("DD-MM") === moment(new Date()).format("DD-MM")
                         });
                         let monthDay = birthDay.map((item) => {
                              return moment(item.date_of_birth).format("DD-MM")
                         });
                         setmonthDayArray(monthDay);
                         if (birthDayFilter && GetLocalStorage("user_id") === birthDayFilter?._id) {
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
               return moment(val.date_of_birth).format("DD-MM") === moment(date).format("DD-MM")
          })
          setBirthDayFilter(birth)
     }


     const isHighlighted = (date) => {
          // Replace this condition with your own logic for highlighting dates
          return monthDayArray.includes(moment(date).format("DD-MM"))
     };

     const dayClassNames = (date) => {
          return isHighlighted(date) ? 'highlighted-birth-date' : null;
     };

     // box onclick
     const pageRedirect = (value) => {
          setuser_id("");
          localStorage.setItem("leave_for", value);
          navigate("/leaves");
          const firstDate = (value === "Full" && absentTodayCount !== 0) || (value === "Half" && halfLeaveToday !== 0)
          const lastDate = (value === "Full" && absentTodayCount !== 0) || (value === "Half" && halfLeaveToday !== 0)

          const filterLeaveData = todayLeave.filter((val) => value === "Full" ? !val.leave_for : val.leave_for);
          // getLeave(new Date(), new Date());
          const { minDate, maxDate } = filterLeaveData.reduce(
               (acc, obj) => {
                    return {
                         minDate: acc.minDate < obj.from_date ? acc.minDate : obj.from_date,
                         maxDate: acc.maxDate > obj.to_date ? acc.maxDate : obj.to_date
                    };
               },
               { minDate: firstDate ? filterLeaveData[0].from_date : new Date(), maxDate: lastDate ? filterLeaveData[0].to_date : new Date() }
          );
          setStartDate(new Date(minDate));
          setendtDate(new Date(maxDate));
     }

     const leaveRequestClick = () => {
          setuser_id("");
          navigate("/leaves");
          localStorage.setItem("status", "Pending");
          if (leaveRequestData.length !== 0) {
               // Use reduce to find the maximum start and end dates
               const { minStartDate, maxEndDate } = leaveRequestData.reduce((acc, cur) => {
                    return {
                         minStartDate: cur.from_date < acc.minStartDate ? cur.from_date : acc.minStartDate,
                         maxEndDate: cur.to_date > acc.maxEndDate ? cur.to_date : acc.maxEndDate
                    };
               }, { minStartDate: leaveRequestData[0].from_date, maxEndDate: leaveRequestData[0].to_date });

               // Output the maximum start and end dates
               setStartDate(new Date(minStartDate));
               setendtDate(new Date(maxEndDate));
          } else {
               setStartDate(moment().clone().startOf('month'));
               setendtDate(moment().clone().endOf('month'));
          }
     }

     const handleArrowClick = () => {
          // Your logic here
          setBirthDayFilter([]);
          setHoliday([])
     };

     useEffect(() => {
          const navigation_previous = document.querySelector(".react-datepicker__navigation--previous");
          const navigation_next = document.querySelector(".react-datepicker__navigation--next");
          navigation_previous?.addEventListener("click", handleArrowClick);
          navigation_next?.addEventListener("click", handleArrowClick);
     })

     return (
          <>
               <motion.div className="box" initial={{ opacity: 0, transform: "translateY(-20px)" }} animate={{ opacity: 1, transform: "translateY(0px)" }} transition={{ duration: 0.5 }}>
                    {!isLoading && <div className=''>
                         <div className='container-fluid inner-pages py-3'>
                              {/* Summary part of dashboard */}
                              {UserData && UserData?.role && UserData.role.name.toLowerCase() === "admin" && <>
                                   <div className="row mt-3">
                                        <div className="mb-4 mt-lg-0 mt-xl-0 mt-2 position-relative box-dashboard col-xl-3 col-md-4 col-sm-6" onClick={() => navigate("/employees")}>
                                             <NavLink className="common-box-dashboard position-relative h-100 total-employee nav-link">
                                                  <img src={require("../assets/images/dashboard/circle.png")} className="card-img-absolute" alt="circle" />
                                                  <div className="common-info-dashboard">
                                                       <h3 className="mb-0">Total Employees</h3>
                                                       <h3 className="mb-0">{totalEmployee}</h3>
                                                  </div>
                                             </NavLink>
                                        </div>
                                        <div className="mb-4 mt-lg-0 mt-xl-0 mt-2 position-relative box-dashboard col-xl-3 col-md-4 col-sm-6" onClick={() => {
                                             SetLocalStorage("status", "Inactive")
                                             navigate("/employees");
                                        }}>
                                             <NavLink className="common-box-dashboard position-relative h-100 inactive-employee nav-link">
                                                  <img src={require("../assets/images/dashboard/circle.png")} className="card-img-absolute" alt="circle" />
                                                  <div className="common-info-dashboard">
                                                       <h3 className="mb-0">Inactive Employee</h3>
                                                       <h3 className="mb-0">{inActiveEmployee}</h3>
                                                  </div>
                                             </NavLink>
                                        </div>
                                        <div className="mb-4 mt-lg-0 mt-xl-0 mt-2 position-relative box-dashboard col-xl-3 col-md-4 col-sm-6" onClick={() => {
                                             SetLocalStorage("status", "Active")
                                             navigate("/employees");
                                        }}>
                                             <NavLink className="common-box-dashboard position-relative h-100 Present nav-link">
                                                  <img src={require("../assets/images/dashboard/circle.png")} className="card-img-absolute" alt="circle" />
                                                  <div className="common-info-dashboard">
                                                       <h3 className="mb-0">Present Today</h3>
                                                       <h3 className="mb-0">{presentToday}</h3>
                                                  </div>
                                             </NavLink>
                                        </div>
                                        <div className="mb-4 mt-lg-0 mt-xl-0 mt-2 position-relative box-dashboard col-xl-3 col-md-4 col-sm-6" onClick={() => pageRedirect("Full")}>
                                             <NavLink className="common-box-dashboard position-relative h-100 Today nav-link">
                                                  <img src={require("../assets/images/dashboard/circle.png")} className="card-img-absolute" alt="circle" />
                                                  <div className="common-info-dashboard">
                                                       <h3 className="mb-0">Absent Today</h3>
                                                       <h3 className="mb-0">{absentTodayCount}</h3>
                                                  </div>
                                             </NavLink>
                                        </div>
                                        <div className="mb-4 mt-lg-0 mt-xl-0 mt-2 position-relative box-dashboard col-xl-3 col-md-4 col-sm-6" onClick={() => pageRedirect("Half")}>
                                             <NavLink className="common-box-dashboard position-relative h-100 employee-active nav-link">
                                                  <img src={require("../assets/images/dashboard/circle.png")} className="card-img-absolute" alt="circle" />
                                                  <div className="common-info-dashboard">
                                                       <h3 className="mb-0">Half Leave</h3>
                                                       <h3 className="mb-0">{halfLeaveToday}</h3>
                                                  </div>
                                             </NavLink>
                                        </div>
                                        <div className="mb-4 mt-lg-0 mt-xl-0 mt-2 position-relative box-dashboard col-xl-3 col-md-4 col-sm-6" onClick={leaveRequestClick}>
                                             <NavLink className="common-box-dashboard position-relative h-100 leave-request nav-link">
                                                  <img src={require("../assets/images/dashboard/circle.png")} className="card-img-absolute" alt="circle" />
                                                  <div className="common-info-dashboard">
                                                       <h3 className="mb-0">Leave Request</h3>
                                                       <h3 className="mb-0">{leaveRequest}</h3>
                                                  </div>
                                             </NavLink>
                                        </div>
                                   </div>
                              </>
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
                                                  birthDay.forEach((val) => {
                                                       const monthDay = moment(val.date).format("MM-DD");
                                                       const year = new Date().getFullYear();
                                                       const date = year.toString().concat("-", monthDay)
                                                       highlight.push(subDays(new Date(date), 0));
                                                  })
                                                  return (
                                                       <DatePickers inline selected={startDate} onSelect={handleChange} highlightDates={highlight} dayClassName={dayClassNames} />
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
                                                  </ul>
                                                  {holiday.length === 0 && <h3 className='text-center' style={{ 'color': '#a3aab1' }}>No Records Found !</h3>}
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
                                                            return <li key={val._id} className='my-2' ><h4 className='my-1'>{ind + 1}. {val.user.first_name.concat(" ", val.user.last_name)}{val.leave_for && " - " + val.leave_for}</h4></li>
                                                       })}
                                                       {todayLeave.length === 0 && totalEmployee !== 0 && <h3 className='text-center' style={{ 'color': '#a3aab1' }}>All present today</h3>}
                                                  </ul>
                                                  {totalEmployee === 0 &&
                                                       <h3 className='text-center' style={{ 'color': '#a3aab1' }}>No employee yet</h3>}
                                             </div>
                                        </div>
                                   </div>
                                   {birthDayToggle && birthDayFilter.length !== 0 &&
                                        <div className='col-lg-4 col-md-6 mt-3 box-dashboard'>
                                             <div className='my-chart'>
                                                  <div className='my-chart-head text-center'>Birthday</div>
                                                  <div className='p-3'>
                                                       <ul>
                                                            {birthDayFilter.map((val) => {
                                                                 return <li key={val._id} className='my-2'><h4 className='my-1'>{val._id === userId ? "Wish you a very happy birthday!" : val.first_name?.concat(" ", val.last_name)}</h4></li>
                                                            })}
                                                       </ul>
                                                       {birthDayFilter.length === 0 &&
                                                            <h3 className='text-center' style={{ 'color': '#a3aab1' }}>No Records Found !</h3>}
                                                  </div>
                                             </div>
                                        </div>}
                              </div>
                         </div>
                    </div>}
               </motion.div>
               {isLoading && <Spinner />}
               {/* birthday animation */}
               {!isLoading && animateLoader &&
                    <div className="animate-celebration">
                         <div className="animate-celebration-content">
                              <img src="/Images/birthday-emoji.png" alt="img" />
                              <h2 className='text-center my-3'>Happy Birthday</h2>
                              <p className='mb-0 text-center'>The warmest wishes to a great member of our team. May your special day be full of happiness, fun and cheer!</p>
                         </div>
                         <ConfettiExplosion duration={25000} force={0.5} particleCount={250} width={4000} height={4000} />
                    </div>}
          </>
     )
}

export default Dashboard
