import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Login from '../auth/Login';
import OtpVerification from '../auth/OtpVerification';
import ForgotPassword from '../auth/ForgotPassword';
import ResetPassword from '../auth/ResetPassword';
import Dashboard from '../Dashboard';
import Employee from '../Employee/Employees/Employee';
import EmployeeViewComponent from '../Employee/Employees/view/EmployeeViewComponent';
import EmployeeEditForm from '../Employee/Employees/edit_form/EmployeeEditForm';
import Project from "../Employee/project/Project";
import Designation from '../Employee/designation/Designation';
import Leave from '../leave/leaves/Leave';
import LeaveType from '../leave/leave_type/LeaveType';
import TimeSheetComponent from '../time_sheet/TimeSheetComponent';
import DocumentComponent from '../document/DocumentComponent';
import UserRole from '../setting/user_role/UserRole';
import WorkReportComponent from '../setting/work_report/WorkReportComponent';
import ReportPreview from '../setting/work_report/reportPreview';
import Error404 from '../error_pages/Error404';
import ActivityComponent from '../activity/ActivityComponent';
import PasswordComponent from '../setting/password/PasswordComponent';
import HolidayComponent from '../leave/holiday/HolidayComponent';
import AttendanceComponent from '../attendance/AttendanceComponent';
import ManageAttendance from '../attendance/ManageAttendance';
import { GetLocalStorage } from '../../service/StoreLocalStorage';
import InvoiceComponent from '../accounting/invoice/InvoiceComponent';
import InvoiceFormComponent from '../accounting/invoice/form/InvoiceFormComponent';

const AppRoute = () => {
    return (
            <Routes>
                {/* login route */}
                <Route exact path='/login' element={<ProtectedRoute authentication={false}><Login /></ProtectedRoute>}></Route>
                <Route exact path='/otp' element={<ProtectedRoute authentication={false}><OtpVerification /></ProtectedRoute>}></Route>
                <Route exact path='/forgot-password' element={<ProtectedRoute authentication={false}><ForgotPassword /></ProtectedRoute>}></Route>
                <Route exact path='/reset-password' element={<ProtectedRoute authentication={false}><ResetPassword /></ProtectedRoute>}></Route>
                {/* dashboard */}
                <Route exact path='/' element={<ProtectedRoute authentication={true}><Dashboard /></ProtectedRoute>}></Route>
                {/* profile path */}
                <Route exact path='/profile/:id' element={GetLocalStorage("token") ? <EmployeeViewComponent /> : <Navigate to="/login" />}></Route>
                {/* employee route */}
                <Route path="/employees">
                    <Route index element={<ProtectedRoute authentication={true}><Employee /></ProtectedRoute>} />
                    <Route path='edit/:id' element={<ProtectedRoute authentication={true}><EmployeeEditForm /></ProtectedRoute>}></Route>
                    <Route path="view/:id" element={<ProtectedRoute authentication={true}><EmployeeViewComponent /></ProtectedRoute>} />
                </Route>
                <Route exact path='/project' element={<ProtectedRoute authentication={true}><Project /></ProtectedRoute>}></Route>
                <Route exact path='/designation' element={<ProtectedRoute authentication={true}><Designation /></ProtectedRoute>}></Route>
                {/* leave route */}
                <Route exact path='/holiday' element={<ProtectedRoute authentication={true} ><HolidayComponent /></ProtectedRoute>}></Route>
                <Route exact path='/leave-type' element={<ProtectedRoute authentication={true} ><LeaveType /></ProtectedRoute>}></Route>
                <Route exact path='/leaves' element={<ProtectedRoute authentication={true} ><Leave /></ProtectedRoute>}></Route>
                {/* document component */}
                <Route exact path='/documents' element={<ProtectedRoute authentication={true} ><DocumentComponent /></ProtectedRoute>}></Route>
                {/* activity component */}
                <Route exact path='/activity' element={<ProtectedRoute authentication={true} ><ActivityComponent /></ProtectedRoute>}></Route>
                {/* timesheet component */}
                <Route exact path='/time-sheet' element={<ProtectedRoute authentication={true} ><TimeSheetComponent /></ProtectedRoute>}></Route>
                {/* setting route */}
                <Route exact path='/user-role' element={<ProtectedRoute authentication={true}><UserRole /></ProtectedRoute>}></Route>
                <Route exact path='/work-report' element={<ProtectedRoute authentication={true} ><WorkReportComponent /></ProtectedRoute>}></Route>
                <Route exact path='/work-report/preview' element={<ProtectedRoute authentication={true} ><ReportPreview /></ProtectedRoute>}></Route>
                <Route exact path='/password' element={<ProtectedRoute authentication={true} ><PasswordComponent /></ProtectedRoute>}></Route>
                {/* attendance route */}
                <Route exact path='/attendance' element={<ProtectedRoute authentication={true} ><AttendanceComponent/></ProtectedRoute>}></Route>
                <Route exact path='/attendance/:id' element={<ProtectedRoute authentication={true} ><ManageAttendance/></ProtectedRoute>}></Route>
                {/* invoice route */}
                <Route path="/invoice">
                    <Route index element={<ProtectedRoute authentication={true}><InvoiceComponent /></ProtectedRoute>} />
                    {/* <Route path='edit/:id' element={<ProtectedRoute authentication={true}><EmployeeEditForm /></ProtectedRoute>}></Route> */}
                    <Route path="create" element={<ProtectedRoute authentication={true}><InvoiceFormComponent /></ProtectedRoute>} /> 
                </Route>       
                {/*  route not match call this route */}
                <Route path="*" element={<Error404 />} />
            </Routes>
    );
}




export default AppRoute;

