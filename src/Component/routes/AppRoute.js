import React, { Suspense } from 'react';
import { Route, Routes} from 'react-router-dom';

import Spinner from '../common/Spinner';
import ProtectedRoute from './ProtectedRoute';
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
import ResetPassword from '../auth/ResetPassword';
import EmployeeViewComponent from '../Employee/Employees/view/EmployeeViewComponent';
import EmployeeEditForm from '../Employee/Employees/edit_form/EmployeeEditForm';
import Project from "../Employee/project/Project";
import ReportPreview from '../time_sheet/reportPreview';

const AppRoute = () => {
    return (
        <Suspense fallback={<Spinner />}>
            <Routes>
                {/* login route */}
                <Route exact path='/login' element={<ProtectedRoute authentication={false}><Login/></ProtectedRoute>}></Route>
                <Route exact path='/otp' element={<ProtectedRoute authentication={false}><OtpVerification /></ProtectedRoute>}></Route>
                <Route exact path='/forgot-password' element={<ForgotPassword />}></Route>
                <Route exact path='/reset-password' element={<ResetPassword />}></Route>
                {/* dashboard */}
                <Route exact path='/' element={<ProtectedRoute authentication={true}><Dashboard /></ProtectedRoute>}></Route>
                {/* profile path */}
                <Route exact path='/profile/:id' element={<ProtectedRoute authentication={true}><EmployeeViewComponent /></ProtectedRoute>}></Route>
                {/* employee route */}
                <Route exact path='/employees' element={<ProtectedRoute authentication={true}><Employee /></ProtectedRoute>}></Route>
                <Route exact path='/employees/edit/:id' element={<ProtectedRoute authentication={true}><EmployeeEditForm /></ProtectedRoute>}></Route>
                <Route exact path='/employees/view/:id' element={<ProtectedRoute authentication={true}><EmployeeViewComponent /></ProtectedRoute>}></Route>
                <Route exact path='/project' element={<ProtectedRoute authentication={true}><Project/></ProtectedRoute>}></Route>
                <Route exact path='/designation' element={<ProtectedRoute authentication={true}><Designation /></ProtectedRoute>}></Route>
                <Route exact path='/user-role' element={<ProtectedRoute authentication={true}><UserRole /></ProtectedRoute>}></Route>
                {/* leave route */}
                <Route exact path='/holiday' element={<ProtectedRoute authentication={true} ><Calendar /></ProtectedRoute>}></Route>
                <Route exact path='/leave-type' element={<ProtectedRoute authentication={true} ><LeaveType /></ProtectedRoute>}></Route>
                <Route exact path='/leave' element={<ProtectedRoute authentication={true} ><Leave /></ProtectedRoute>}></Route>
                {/* document component */}
                <Route exact path='/documents' element={<ProtectedRoute authentication={true} ><DocumentComponent /></ProtectedRoute>}></Route>
                {/* timesheet component */}
                <Route exact path='/time-sheet' element={<ProtectedRoute authentication={true} ><TimeSheetComponent /></ProtectedRoute>}></Route>
                <Route exact path='/work-report' element={<ProtectedRoute authentication={true} ><WorkReportComponent /></ProtectedRoute>}></Route>
                <Route exact path='/report-preview' element={<ProtectedRoute authentication={true} ><ReportPreview/></ProtectedRoute>}></Route>
                {/*  route not match call this route */}
                <Route path="*" element={<Error404 />} />
            </Routes>
        </Suspense>
    );
}




export default AppRoute;

