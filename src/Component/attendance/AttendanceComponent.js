import React, { useMemo, useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from "framer-motion";
import { Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel } from "@mui/material";
import moment from 'moment';


const AttendanceComponent = () => {
    

    return (
        <>
            <motion.div
                className="box"
                initial={{ opacity: 0, transform: 'translateY(-20px)' }}
                animate={{ opacity: 1, transform: 'translateY(0px)' }}
                transition={{ duration: 0.5 }}
            >
                <div className=" container-fluid pt-4">
                    <div className="background-wrapper bg-white py-4">
                        <div className=''>
                            <div className='row align-items-center row-std m-0'>
                                <div className="col-12 col-sm-5 d-flex justify-content-between align-items-center">
                                    <div>
                                        <ul id="breadcrumb" className="mb-0">
                                            <li><NavLink to="/" className="ihome">Dashboard</NavLink></li>
                                            <li><NavLink to="" className="ibeaker"><i className="fa-solid fa-play"></i> &nbsp; Attendance</NavLink></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* table */}
                        <div className="mx-4 mt-4">
                            <div className="attendance">
                                <div className="attendance-body">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="attendance-list-item p-4">
                                                <div className="attendance-header d-flex justify-content-between align-items-center flex-wrap">
                                                    <h3 className="mb-0">Attendance</h3>
                                                    <h4 class="text-gray mb-0">{moment(new Date()).format('DD MMM YYYY')}</h4>
                                                </div>
                                                <div className="bordered p-3 mt-3">
                                                    <div className="d-flex flex-wrap">
                                                        <h4 className="mb-0 mr-2 text-gray">Punch In Time:</h4>
                                                        <h4 className="mb-0 text-black">Wed, 11th Mar 2023 10.00 AM</h4>
                                                    </div>
                                                </div>
                                                <div className="mt-3 text-center">
                                                    <div className="clock d-flex justify-content-center align-items-center">
                                                        <h2 className="mb-0 text-center">6.20 hrs</h2>
                                                    </div>
                                                    <div className="mt-3">
                                                        <button type="submit" className="btn btn-gradient-primary">Punch Out</button>
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-lg-6 col-md-12 col-sm-6 mt-3">
                                                        <div className="bordered p-3">
                                                            <div className="w-100 d-flex flex-wrap">
                                                                <h4 className="mb-0 mr-2 text-gray">Break Time:</h4>
                                                                <h4 className="mb-0 text-black">1.22 hrs</h4>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-6 col-md-12 col-sm-6 mt-3">
                                                        <div className="bordered p-3">
                                                            <div className="w-100 d-flex flex-wrap">
                                                                <h4 className="mb-0 mr-2 text-gray">Overtime:</h4>
                                                                <h4 className="mb-0 text-black">3.10 hrs</h4>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="attendance-list-item p-4">
                                                <div className="attendance-header d-flex justify-content-between align-items-center mb-3">
                                                    <h3 className="mb-0">Activities</h3>
                                                </div>
                                                <ul>
                                                    <li class="position-relative">
                                                        <div>
                                                            <h5 class="mb-0">Punch In Time</h5>
                                                            <p class="text-gray mb-0">10:00 AM</p>
                                                        </div>
                                                    </li>
                                                    <li class="position-relative">
                                                        <div>
                                                            <h5 class="mb-0">Punch In Time</h5>
                                                            <p class="text-gray mb-0">10:00 AM</p>
                                                        </div>
                                                    </li>
                                                    <li class="position-relative">
                                                        <div>
                                                            <h5 class="mb-0">Punch In Time</h5>
                                                            <p class="text-gray mb-0">10:00 AM</p>
                                                        </div>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div >
                    </div >
                </div>
            </motion.div>
        </>
    )
}
export default AttendanceComponent