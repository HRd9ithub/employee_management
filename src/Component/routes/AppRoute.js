import React, {  Suspense } from 'react';
import {  Route, Routes } from 'react-router-dom';

import Spinner from '../common/Spinner';
import ProtectedRoute from '../ProtectedRoute';
import Login from '../auth/Login';
import Dashboard from '../Dashboard';
import Employee from '../Employee/Employees/Employee';
import Department from '../Employee/department/Department';
import Designation from '../Employee/designation/Designation';
import UserRole from '../Employee/user_role/UserRole';
import Premissions from '../Employee/premissions/Premissions';
import Calendar from '../holiday/Calendar';
import LeaveType from '../holiday/LeaveType';
import Leave from '../holiday/Leave';
import MailComponent from '../email/MailComponent';
import DocumentComponent from '../document/DocumentComponent';
import TimeSheetComponent from '../time_sheet/TimeSheetComponent';
import Error404 from '../error_pages/Error404';
import ForgetPassword from '../auth/ForgetPassword';
import ResetPassword from '../auth/ResetPassword';
import TimeSheetReport from '../time_sheet/TimeSheetReport';
import EmployeeViewComponent from '../Employee/Employees/view/EmployeeViewComponent';
import EmployeeEditForm from '../Employee/Employees/edit_form/EmployeeEditForm';
import RedirectPage from './RedirectPage';
import HolidayComponent from '../holiday/year_holiday/HolidayComponent';

const AppRoute = ({HandleProgress}) => {
    return (
        <Suspense fallback={<Spinner />}>
            <Routes>
                {/* login route */}
                <Route exact path='/login' element={<RedirectPage Component={Login} /> }></Route>
                <Route exact path='/password' element={<RedirectPage Component={ForgetPassword} />}></Route>
                <Route exact path='/set_new_password' element={<RedirectPage Component={ResetPassword} />}></Route>
                {/* dashboard */}
                <Route exact path='/' element={<ProtectedRoute name="Dashboard"><Dashboard /></ProtectedRoute>}></Route>
                {/* profile path */}
                <Route exact path='/profile/:id' element={<ProtectedRoute name="view"><EmployeeViewComponent HandleProgress={HandleProgress} /></ProtectedRoute>}></Route>
                {/* <Route exact path='/profile' element={<ProtectedRoute name="Dashboard"><UserProfile /></ProtectedRoute>}></Route> */}
                {/* employee route */}
                <Route exact path='/employees' element={<ProtectedRoute><Employee HandleProgress={HandleProgress}  /></ProtectedRoute>}></Route>
                {/* <Route exact path='/employees/add' element={<ProtectedRoute><EmployeeForm HandleProgress={HandleProgress}  /></ProtectedRoute>}></Route> */}
                <Route exact path='/employees/edit/:id' element={<ProtectedRoute><EmployeeEditForm HandleProgress={HandleProgress}  /></ProtectedRoute>}></Route>
                <Route exact path='/employees/view/:id' element={<ProtectedRoute><EmployeeViewComponent HandleProgress={HandleProgress}  /></ProtectedRoute>}></Route>
                <Route exact path='/department' element={<ProtectedRoute><Department HandleProgress={HandleProgress} /></ProtectedRoute>}></Route>
                <Route exact path='/designation' element={<ProtectedRoute><Designation HandleProgress={HandleProgress} /></ProtectedRoute>}></Route>
                <Route exact path='/userrole' element={<ProtectedRoute><UserRole HandleProgress={HandleProgress} /></ProtectedRoute>}></Route>
                <Route exact path='/premission' element={<ProtectedRoute ><Premissions HandleProgress={HandleProgress} /></ProtectedRoute>}></Route>
                {/* leave route */}
                <Route exact path='/holiday' element={<ProtectedRoute ><Calendar HandleProgress={HandleProgress} /></ProtectedRoute>}></Route>
                <Route exact path='/holidays' element={<ProtectedRoute name="Dashboard" ><HolidayComponent  HandleProgress={HandleProgress} /></ProtectedRoute>}></Route>
                <Route exact path='/leavetype' element={<ProtectedRoute ><LeaveType HandleProgress={HandleProgress} /></ProtectedRoute>}></Route>
                <Route exact path='/leave' element={<ProtectedRoute ><Leave HandleProgress={HandleProgress} /></ProtectedRoute>}></Route>
                {/* mail */}
                <Route exact path='/email' element={<ProtectedRoute ><MailComponent HandleProgress={HandleProgress} /></ProtectedRoute>}></Route>
                {/* page component */}
                {/* <Route exact path='/page' element={<ProtectedRoute ><PageComponent HandleProgress={HandleProgress} /></ProtectedRoute>}></Route> */}
                {/* document component */}
                <Route exact path='/documents' element={<ProtectedRoute ><DocumentComponent HandleProgress={HandleProgress} /></ProtectedRoute>}></Route>
                {/* timesheet component */}
                <Route exact path='/timesheet' element={<ProtectedRoute ><TimeSheetComponent HandleProgress={HandleProgress} /></ProtectedRoute>}></Route>
                <Route exact path='/timesheetreport' element={<ProtectedRoute ><TimeSheetReport HandleProgress={HandleProgress} /></ProtectedRoute>}></Route>
                {/*  route not match call this route */}
                <Route path="*" element={<ProtectedRoute ><Error404 /></ProtectedRoute>} />
            </Routes>
        </Suspense>
    );
}

export default AppRoute;


