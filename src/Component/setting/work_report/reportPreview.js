import React, { useContext, useEffect } from 'react';
import { AppProvider } from '../../context/RouteContext';
import { NavLink, useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { motion } from "framer-motion";
import moment from 'moment';
import { useState } from 'react';
import toast from 'react-hot-toast';
import Spinner from '../../common/Spinner';
import axios from 'axios';
import fileDownload from 'js-file-download';
import { HiOutlineMinus } from 'react-icons/hi';


const ReportPreview = () => {
    let { reportData, id, summary } = useContext(AppProvider);
    const [isLoading, setisLoading] = useState(false);
    let navigate = useNavigate();

    useEffect(() => {
        if (!id) {
            navigate("/work-report/employee");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const downloadReport = async () => {
        setisLoading(true)
        axios.get(`${process.env.REACT_APP_API_KEY}/report/report-download?id=${id}`, {
            responseType: 'blob',
        }).then((res) => {
            fileDownload(res.data, "report.pdf");
            toast.success("Download successfully.")
            setisLoading(false)
        }).catch((error) => {
            setisLoading(false)
            if (!error.response || !error) {
                toast.error(error?.message || "something went wrong.");
            } else if (error.response.data.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error(error.response.statusText);
            }

        })
    }

    return (
        <>
            <motion.div className="box" initial={{ opacity: 0, transform: "translateY(-20px)" }} animate={{ opacity: 1, transform: "translateY(0px)" }} transition={{ duration: 0.5 }}>
                <div className="container-fluid py-4">
                    <div className="background-wrapper bg-white pb-4">
                        <div className='row justify-content-end align-items-center row-std m-0'>
                            <div className="col-12 col-sm-6 d-flex justify-content-between align-items-center">
                                <div>
                                    <ul id="breadcrumb" className="mb-0">
                                        <li><NavLink to="/" className="ihome">Dashboard</NavLink></li>
                                        <li><NavLink to="/work-report/employee" className="ibeaker"><i className="fa-solid fa-play"></i> &nbsp; Work Report</NavLink></li>
                                        <li><NavLink to="" className="ibeaker"><i className="fa-solid fa-play"></i> &nbsp;Preview</NavLink></li>
                                    </ul>
                                </div>
                            </div>
                            <div className="col-12 col-sm-6 d-flex justify-content-end" id="two">
                                <button className='btn btn-gradient-primary btn-rounded btn-fw text-center mr-2' onClick={downloadReport}>
                                    <i className="fa-solid fa-download"></i>&nbsp; Download
                                </button >
                                <button className='btn btn-gradient-primary btn-rounded btn-fw text-center' onClick={() => navigate("/work-report/employee")} >
                                    <i className="fa-solid fa-arrow-left"></i>&nbsp; Back
                                </button >
                            </div>
                        </div>
                        <div className="d-flex justify-content-start align-content-center flex-wrap px-4 mt-3" style={{ gap: '7px' }}>
                            <div className="summary-report p-3 d-flex justify-content-between align-content-center">
                                <h6 className="mb-0">Total Working Days</h6>
                                <h6 className="mb-0">{summary.dayCount}</h6>
                            </div>
                            <div className="summary-report p-3 d-flex justify-content-between align-content-center">
                                <h6 className="mb-0">Hours</h6>
                                <h6 className="mb-0">{summary.totalHours}</h6>
                            </div>
                            <div className="summary-report p-3 d-flex justify-content-between align-content-center">
                                <h6 className="mb-0">Extra Hours</h6>
                                <h6 className="mb-0">{summary.extraHours}</h6>
                            </div>
                            <div className="summary-report p-3 d-flex justify-content-between align-content-center">
                                <h6 className="mb-0">Holiday</h6>
                                <h6 className="mb-0">{summary.holidayCount}</h6>
                            </div>
                            <div className="summary-report p-3 d-flex justify-content-between align-content-center">
                                <h6 className="mb-0">Full Leave</h6>
                                <h6 className="mb-0">{summary.fullLeave}</h6>
                            </div>
                            <div className="summary-report p-3 d-flex justify-content-between align-content-center">
                                <h6 className="mb-0">Half Leave</h6>
                                <h6 className="mb-0">{summary.halfLeave}</h6>
                            </div>
                        </div>
                        {/* table */}
                        <div className="mx-4">
                            <TableContainer >
                                <Table className="common-table-section preview-table-responsive">
                                    <TableHead className="common-header">
                                        <TableRow>
                                            <TableCell>
                                                Date
                                            </TableCell>
                                            <TableCell>
                                                Total Hours
                                            </TableCell>
                                            <TableCell>
                                                Extra Hours
                                            </TableCell>
                                            <TableCell>
                                                Description
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {reportData.length !== 0 ?
                                            reportData.map((val, ind) => {
                                                return (
                                                    <TableRow key={ind} >
                                                        {!val.userId && val.name !== "Leave" && <TableCell colSpan={4} align="center" className="Holiday_column">{moment(val.date).format("DD MMM YYYY").concat(" - ", val.name)}</TableCell>}
                                                        {!val.userId && val.name === "Leave" && <TableCell colSpan={4} align="center" className="Leave_column">{moment(val.date).format("DD MMM YYYY").concat(" - ", val.name)}({val.leave_for})</TableCell>}
                                                        {val.userId && <TableCell style={{ width: "15%" }}>{moment(val.date).format("DD MMM YYYY")}</TableCell>}
                                                        {val.userId && <TableCell style={{ width: "15%" }}>{val.totalHours}{val.leave_for && <span className="text-red"> ({val.leave_for})</span>}</TableCell>}
                                                        {val.userId && <TableCell style={{ width: "15%" }}>{val.extraTotalHours ? val.extraTotalHours : <HiOutlineMinus />}</TableCell>}
                                                        {val.userId && <TableCell>
                                                            {val.work?.map((currElem, ind) => {
                                                                return <div className="card-body table_section" key={currElem._id}>
                                                                    <p style={{ fontWeight: "bold" }} className='mb-0'>{ind + 1}. {currElem.project?.name}</p>
                                                                    <div className='w-100 text-wrap report-description-preview' dangerouslySetInnerHTML={{ __html: currElem.description }}></div>
                                                                </div>
                                                            })}
                                                            {val.extraWork?.map((currElem, ind) => {
                                                                return <div className="card-body table_section" key={currElem._id}>
                                                                    {ind === 0 && <p style={{ fontWeight: "bold" }} className='mb-0 text-info'>Extra Work Detail: </p>}
                                                                    <p style={{ fontWeight: "bold" }} className='mb-0'>{ind + 1}. {currElem.project?.name}</p>
                                                                    <div className='w-100 text-wrap report-description-preview' dangerouslySetInnerHTML={{ __html: currElem.description }}></div>
                                                                </div>
                                                            })}
                                                        </TableCell>}
                                                    </TableRow>
                                                )
                                            })
                                            :
                                            <TableRow>
                                                <TableCell colSpan={7} align="center">
                                                    No Records Found
                                                </TableCell>
                                            </TableRow>
                                        }
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </div>
                    </div>
                </div>
            </motion.div>
            {isLoading && <Spinner />}
        </>
    )
}

export default ReportPreview