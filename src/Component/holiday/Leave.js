import React, { useEffect, useMemo, useState, useContext } from 'react'
import { NavLink } from 'react-router-dom'
import Spinner from '../common/Spinner'
import { toast } from 'react-hot-toast'
import LeaveModal from './LeaveModal'
import { motion } from 'framer-motion'
import { HiOutlineMinus } from "react-icons/hi";
import Modal from 'react-bootstrap/Modal';
import GlobalPageRedirect from '../auth_context/GlobalPageRedirect';
import { Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel } from "@mui/material";
import Avatar from '@mui/material/Avatar';
import Error403 from '../error_pages/Error403';
import Error500 from '../error_pages/Error500';
import { AppProvider } from '../context/RouteContext'
import moment from 'moment'
import { customAxios } from '../../service/CreateApi'

const Leave = () => {
    const [show, setShow] = useState(false);
    const [status, setstatus] = useState("");
    const [id, setid] = useState("");
    const [subLoading, setsubLoading] = useState(false);

    let { getCommonApi } = GlobalPageRedirect();

    let { getLeave, leave, Loading, permission, serverError, HandleFilter } = useContext(AppProvider);

    // pagination state
    const [count, setCount] = useState(5)
    const [page, setpage] = useState(0)

    // sort state
    const [order, setOrder] = useState("asc")
    const [orderBy, setOrderBy] = useState("name");

    useEffect(() => {
        getLeave();
        // eslint-disable-next-line
    }, [])

    // status change modal SHOW
    const handlesshowModal = (status, id) => {
        setstatus(status);
        setid(id);
        setShow(true);
    }
    // status change modal hidw
    const handleshideModal = (e) => {
        e.preventDefault();
        setShow(false);
    }

    // status change function
    const handleStatus = async (e) => {
        e.preventDefault();
        try {
            setsubLoading(true);
            const res = await customAxios().patch(`/leave/${id}`, { status })
            if (res.data.success) {
                toast.success(res.data.message);
                setShow(false);
                getLeave();
            }
        } catch (error) {
            if (!error.response) {
                toast.error(error.message);
            } else if (error.response.status === 401) {
                getCommonApi();
            } else {
                if (error.response.data.message) {
                    toast.error(error.response.data.message)
                }
            }
        } finally {
            setsubLoading(false)
        }
    }

    // pagination function
    const onChangePage = (e, page) => {
        setpage(page)
    }

    const onChangeRowsPerPage = (e) => {
        setCount(e.target.value)
    }


    // sort function
    const handleRequestSort = (name) => {
        const isAsc = (orderBy === name && order === "asc");

        setOrderBy(name)
        setOrder(isAsc ? "desc" : "asc")
    }

    const descedingComparator = (a, b, orderBy) => {
        if (orderBy === "leave_type") {
            if (b[orderBy]?.name < a[orderBy]?.name) {
                return -1
            }
            if (b[orderBy]?.name > a[orderBy]?.name) {
                return 1
            }
            return 0
        } else if (orderBy === "name") {
            if (b.user ? b.user.first_name?.concat(" ", b.user.last_name) : b.user < a.user ? a.user.first_name?.concat(" ", a.user.last_name) : a.user) {
                return -1
            }
            if (a.user ? b.user.first_name?.concat(" ", b.user.last_name) : b.user > a.user ? a.user.first_name?.concat(" ", a.user.last_name) : a.user) {
                return 1
            }
            return 0
        } else {
            if (b[orderBy] < a[orderBy]) {
                return -1
            }
            if (b[orderBy] > a[orderBy]) {
                return 1
            }
            return 0
        }
    }

    const getComparator = (order, orderBy) => {
        return order === "desc" ? (a, b) => descedingComparator(a, b, orderBy) : (a, b) => -descedingComparator(a, b, orderBy)
    }

    const sortRowInformation = (array, comparator) => {
        const rowArray = array.map((elem, ind) => [elem, ind])

        rowArray.sort((a, b) => {
            const order = comparator(a[0], b[0])
            if (order !== 0) return order
            return a[1] - b[1]
        })
        return rowArray.map((el) => el[0])
    }

    // eslint-disable-next-line
    const actionToggle = useMemo(() => {
        if (permission) {
            if ((permission && permission.name?.toLowerCase() === "admin") || (permission.permissions.length !== 0 && permission.permissions.update === 1)) {
                if (permission && permission.name?.toLowerCase() === "admin") {
                    let data = leave.find((val) => {
                        return !((val.status !== 'Pending' && val.status !== 'Read') && new Date(val.from_date) < new Date())
                    })
                    if (data) {
                        return true
                    } else {
                        return false
                    }
                } else {
                    let data = leave.find((val) => {
                        return val.status === "Pending" || val.status === "Read"
                    })
                    if (data) {
                        return true
                    }
                }
            } else {
                return false
            }
        }
        // eslint-disable-next-line
    }, [leave]);

    if (Loading) {
        return <Spinner />;
    }

    if (serverError) {
        return <Error500 />;
    }

    if (!permission || (permission.name.toLowerCase() !== "admin" && (permission.permissions.length !== 0 && permission.permissions.list === 0))) {
        return <Error403 />;
    }

    return (
        <>
            <motion.div
                className="box"
                initial={{ opacity: 0, transform: 'translateY(-20px)' }}
                animate={{ opacity: 1, transform: 'translateY(0px)' }}
                transition={{ duration: 0.5 }}
            >
                <div className=" container-fluid pt-4">
                    <div className="background-wrapper bg-white pt-2">
                        <div className=''>
                            <div className='row justify-content-end align-items-center row-std m-0'>
                                <div className="col-12 col-sm-5 d-flex justify-content-between align-items-center">
                                    <div>
                                        <ul id="breadcrumb" className="mb-0">
                                            <li><NavLink to="/" className="ihome">Dashboard</NavLink></li>
                                            <li><NavLink to="" className="ibeaker"><i className="fa-solid fa-play"></i> &nbsp; Leave</NavLink></li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="col-12 col-sm-7 d-flex justify-content-end" id="two">
                                    <div className="search-full">
                                        <input type="search" autoComplete='off' className="input-search-full" name="txt" placeholder="Search" onChange={(e) => HandleFilter(e.target.value)} />
                                        <i className="fas fa-search"></i>
                                    </div>
                                    <div className="search-box mr-3">
                                        <form name="search-inner">
                                            <input type="search" autoComplete='off' className="input-search" name="txt" onChange={(e) => HandleFilter(e.target.value)} />
                                        </form>
                                        <i className="fas fa-search"></i>
                                    </div>
                                    <LeaveModal getLeave={getLeave} permission={permission} />
                                </div>
                            </div>
                        </div>

                        {/* table */}
                        <div className="mx-4">
                            <TableContainer >
                                <Table className="common-table-section">
                                    <TableHead className="common-header">
                                        <TableRow>
                                            {(permission && permission.name?.toLowerCase() === "admin") && <>
                                                <TableCell>
                                                    <TableSortLabel active={orderBy === "name"} direction={orderBy === "name" ? order : "asc"} onClick={() => handleRequestSort("name")}>
                                                        Employee
                                                    </TableSortLabel>
                                                </TableCell>
                                            </>}
                                            <TableCell>
                                                <TableSortLabel active={orderBy === "leaveType"} direction={orderBy === "leaveType" ? order : "asc"} onClick={() => handleRequestSort("leaveType")}>
                                                    Leave Type
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell>
                                                <TableSortLabel active={orderBy === "from_date"} direction={orderBy === "from_date" ? order : "asc"} onClick={() => handleRequestSort("from_date")}>
                                                    from
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell>
                                                <TableSortLabel active={orderBy === "to_date"} direction={orderBy === "to_date" ? order : "asc"} onClick={() => handleRequestSort("to_date")}>
                                                    To
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell>
                                                <TableSortLabel active={orderBy === "duration"} direction={orderBy === "duration" ? order : "asc"} onClick={() => handleRequestSort("duration")}>
                                                    Duration
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell>
                                                <TableSortLabel active={orderBy === "leave_for"} direction={orderBy === "leave_for" ? order : "asc"} onClick={() => handleRequestSort("leave_for")}>
                                                    Leave For
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell>
                                                <TableSortLabel active={orderBy === "reason"} direction={orderBy === "reason" ? order : "asc"} onClick={() => handleRequestSort("reason")}>
                                                    Reason
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell>
                                                <TableSortLabel active={orderBy === "createdAt"} direction={orderBy === "createdAt" ? order : "asc"} onClick={() => handleRequestSort("createdAt")}>
                                                    Applied on
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell>
                                                Status
                                            </TableCell>
                                            {actionToggle &&
                                                <TableCell>
                                                    Action
                                                </TableCell>}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {leave.length !== 0 ? sortRowInformation(leave, getComparator(order, orderBy)).slice(count * page, count * page + count).map((val, ind) => {
                                            return (
                                                <TableRow key={ind}>
                                                    {/* <TableCell>{ind + 1}</TableCell> */}
                                                    {(permission && permission.name?.toLowerCase() === "admin") &&
                                                        <TableCell>
                                                            <div className={`pr-3 d-flex align-items-center name_col ${val.user.status === "Inactive" ? 'user-status-inactive' : ''}`}>
                                                                {val.user ? <>
                                                                    <Avatar alt={val.user.first_name} className='text-capitalize profile-action-icon text-center mr-2' src={val.user.profile_image && `${process.env.REACT_APP_IMAGE_API}/${val.user.profile_image}`} sx={{ width: 30, height: 30 }} />
                                                                    {val.user.first_name.concat(" ", val.user.last_name)}
                                                                </> : <HiOutlineMinus />
                                                                }
                                                            </div>
                                                        </TableCell>
                                                    }
                                                    <TableCell>{val.leaveType ? val.leaveType : <HiOutlineMinus />}</TableCell>
                                                    <TableCell>{moment(val.from_date).format("DD MMM YYYY")}</TableCell>
                                                    <TableCell>{moment(val.to_date).format("DD MMM YYYY")}</TableCell>
                                                    <TableCell>{val.duration}</TableCell>
                                                    <TableCell>{val.leave_for}</TableCell>
                                                    <TableCell>{val.reason}</TableCell>
                                                    <TableCell>{moment(val.createdAt).format("DD MMM YYYY")}</TableCell>
                                                    <TableCell>
                                                        <button className={`${val.status === "Declined" ? "btn-gradient-danger" : val.status === "Approved" ? "btn-gradient-success" : val.status === "Pending" ? "btn-gradient-secondary" : "btn-gradient-info"} btn status-label`} disabled={((val.status !== 'Pending' && val.status !== 'Read') && new Date(val.from_date) < new Date()) || (permission && permission.name?.toLowerCase() !== "admin")} onClick={() => handlesshowModal(val.status, val._id)}>{val.status}</button>
                                                    </TableCell>
                                                    {actionToggle &&
                                                        <TableCell>
                                                            <div className='action'>
                                                                {/* eslint-disable-next-line no-mixed-operators */}
                                                                {((permission && permission.name?.toLowerCase() === "admin") || (permission.permissions.length !== 0 && permission.permissions.update === 1 && val.status !== 'Approved' && val.status !== "Declined")) &&
                                                                    !((val.status !== 'Pending' && val.status !== 'Read') && new Date(val.from_date) < new Date()) &&
                                                                    <LeaveModal data={val} getLeave={getLeave} permission={permission} />}
                                                            </div>
                                                        </TableCell>}
                                                </TableRow>
                                            )
                                        }) :
                                            <TableRow>
                                                <TableCell colSpan={11} align="center">
                                                    No Records Found
                                                </TableCell>
                                            </TableRow>
                                        }
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TablePagination rowsPerPageOptions={[5, 10, 15, 25, 50, 100]}
                                component="div"
                                onPageChange={onChangePage}
                                onRowsPerPageChange={onChangeRowsPerPage}
                                rowsPerPage={count}
                                count={leave.length}
                                page={page}>
                            </TablePagination>
                        </div>
                    </div >
                </div >

                {/* status changes modal * */}
                <Modal show={show} animation={true} size="md" aria-labelledby="example-modal-sizes-title-sm" className='small-modal department-modal' centered>
                    <Modal.Header className='small-modal'>
                        <Modal.Title>Status Change</Modal.Title>
                        <p className='close-modal' onClick={handleshideModal}><i className="fa-solid fa-xmark"></i></p>
                    </Modal.Header>
                    <Modal.Body>
                        <div className=" grid-margin stretch-card mb-lg-0">
                            <div className="card">
                                <div className="card-body">
                                    <form className="forms-sample">
                                        <div className="form-group">
                                            <label htmlFor="status" className='mt-3'>Status</label>
                                            <select className="form-control " id="status" name='status' value={status} onChange={(e) => setstatus(e.target.value)} >
                                                <option value="Pending"> Pending</option>
                                                <option value="Read">Read</option>
                                                <option value="Approved"> Approved</option>
                                                <option value="Declined"> Declined</option>
                                            </select>
                                        </div>
                                        <div className='d-flex justify-content-center modal-button'>
                                            <button type="submit" className="btn btn-gradient-primary mr-2" onClick={handleStatus}>Save</button>
                                            <button className="btn btn-light" onClick={handleshideModal}>Cancel</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </Modal.Body>
                    {subLoading && <Spinner />}
                </Modal>
            </motion.div>
        </>
    )
}
export default Leave
