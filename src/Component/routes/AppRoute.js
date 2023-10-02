import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

import Spinner from '../common/Spinner';
import ProtectedRoute from '../ProtectedRoute';
import Login from '../auth/Login';
import OtpVerification from '../auth/OtpVerification';
import ForgotPassword from '../auth/ForgotPassword';
import Dashboard from '../Dashboard';
import Employee from '../Employee/Employees/Employee';
import Designation from '../Employee/designation/Designation';
import UserRole from '../Employee/user_role/UserRole';
import Calendar from '../holiday/Calendar';
import LeaveType from '../holiday/LeaveType';
import Leave from '../holiday/Leave';
import DocumentComponent from '../document/DocumentComponent';
import TimeSheetComponent from '../time_sheet/TimeSheetComponent';
import WorkReportComponent from '../time_sheet/WorkReportComponent';
import Error404 from '../error_pages/Error404';
import ForgetPassword from '../auth/ForgetPassword';
import ResetPassword from '../auth/ResetPassword';
import SetNewPassword from '../auth/SetNewPassword';
import EmployeeViewComponent from '../Employee/Employees/view/EmployeeViewComponent';
import EmployeeEditForm from '../Employee/Employees/edit_form/EmployeeEditForm';
import RedirectPage from './RedirectPage';
import LoginNew from '../auth/LoginNew';
import Project from "../Employee/department/Project"

const AppRoute = () => {

    return (
        <Suspense fallback={<Spinner />}>
            <Routes>
                {/* login route */}
                <Route exact path='/login' element={<RedirectPage ><LoginNew/></RedirectPage>}></Route>
                <Route exact path='/otp' element={<OtpVerification />}></Route>
                <Route exact path='/forgot-password' element={<RedirectPage ><ForgotPassword /></RedirectPage>}></Route>
                {/* <Route exact path='/set_new_password' element={<RedirectPage><ResetPassword /></RedirectPage>}></Route> */}
                <Route exact path='/set_new_password' element={<RedirectPage><SetNewPassword /></RedirectPage>}></Route>
                {/* dashboard */}
                <Route exact path='/' element={<ProtectedRoute><Dashboard /></ProtectedRoute>}></Route>
                {/* profile path */}
                <Route exact path='/profile/:id' element={<ProtectedRoute><EmployeeViewComponent /></ProtectedRoute>}></Route>
                {/* employee route */}
                <Route exact path='/employees' element={<ProtectedRoute><Employee /></ProtectedRoute>}></Route>
                <Route exact path='/employees/edit/:id' element={<ProtectedRoute><EmployeeEditForm /></ProtectedRoute>}></Route>
                <Route exact path='/employees/view/:id' element={<ProtectedRoute><EmployeeViewComponent /></ProtectedRoute>}></Route>
                <Route exact path='/project' element={<ProtectedRoute><Project/></ProtectedRoute>}></Route>
                <Route exact path='/designation' element={<ProtectedRoute><Designation /></ProtectedRoute>}></Route>
                <Route exact path='/userrole' element={<ProtectedRoute><UserRole /></ProtectedRoute>}></Route>
                {/* leave route */}
                <Route exact path='/holiday' element={<ProtectedRoute ><Calendar /></ProtectedRoute>}></Route>
                <Route exact path='/leavetype' element={<ProtectedRoute ><LeaveType /></ProtectedRoute>}></Route>
                <Route exact path='/leave' element={<ProtectedRoute ><Leave /></ProtectedRoute>}></Route>
                {/* document component */}
                <Route exact path='/documents' element={<ProtectedRoute ><DocumentComponent /></ProtectedRoute>}></Route>
                {/* timesheet component */}
                <Route exact path='/timesheet' element={<ProtectedRoute ><TimeSheetComponent /></ProtectedRoute>}></Route>
                <Route exact path='/workreport' element={<ProtectedRoute ><WorkReportComponent /></ProtectedRoute>}></Route>
                {/*  route not match call this route */}
                <Route path="*" element={<ProtectedRoute ><Error404 /></ProtectedRoute>} />
            </Routes>
        </Suspense>
    );
}




export default AppRoute;

