import React, { useContext, useEffect, useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'
import axios from 'axios'
import Spinner from '../common/Spinner'
import { toast } from 'react-toastify'
import { Form } from 'react-bootstrap';
import LeaveModal from './LeaveModal'
import { motion } from 'framer-motion'
import { AppProvider } from '../context/RouteContext'
import { HiOutlineMinus } from "react-icons/hi";
import Modal from 'react-bootstrap/Modal';
import GlobalPageRedirect from '../auth_context/GlobalPageRedirect'
import { GetLocalStorage } from '../../service/StoreLocalStorage'
import { Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel } from "@mui/material";

const Leave = () => {
    let { accessData, UserData, getLeave, records, setLoading, Loading, handleVisibility, visible } = useContext(AppProvider);
    const [show, setShow] = useState(false);
    const [status, setstatus] = useState("");
    const [id, setid] = useState("");
    const [leaveRecord, setleaveRecord] = useState([]);
    const [leaveRecordFilter, setleaveRecordFilter] = useState([]);
    const [Action, setAction] = useState(false);

    let { getCommonApi } = GlobalPageRedirect();

    // pagination state
    const [count, setCount] = useState(5)
    const [page, setpage] = useState(0)

    // sort state
    const [order, setOrder] = useState("asc")
    const [orderBy, setOrderBy] = useState("name")

    useEffect(() => {
        getLeave();
        // eslint-disable-next-line
    }, [])

    useEffect(() => {
        if (UserData?.role.name.toLowerCase() !== "admin") {
            setleaveRecord(records.filter((val) => val.user?.id === UserData.id))
            setleaveRecordFilter(records.filter((val) => val.user?.id === UserData.id))
        } else {
            setleaveRecord(records);
            setleaveRecordFilter(records);
        }
        // action button show or not 
        let data = leaveRecordFilter.filter((val) => {
            return (val.status === 'Pending' && val.status === "Read" && new Date(val.from_date) > new Date()) || (UserData && (UserData.role.name.toLowerCase() !== "admin" || (val.status === 'Pending' && val.status === "Read")))
        })
        data.length !== 0 ? setAction(true) : setAction(false)
        // eslint-disable-next-line
    }, [records])

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

    // search filter function
    const HandleFilter = (event) => {
        let data = event.target.value;
        let filter_data = leaveRecord.filter((val) => {
            return (val.user?.first_name && val.user.first_name.concat(" ", val.user.last_name).toLowerCase().includes(data.toLowerCase())) ||
                val.leave_type?.name.toLowerCase().includes(data.toLowerCase()) ||
                val.from_date.toString().includes(data.toLowerCase()) ||
                val.to_date.toString().includes(data.toLowerCase()) ||
                val.day.toString().includes(data.toLowerCase()) ||
                val.leave_status.toLowerCase().includes(data.toLowerCase()) ||
                val.description.toLowerCase().includes(data.toLowerCase()) ||
                val.status.toLowerCase().includes(data.toLowerCase())
        })
        setleaveRecordFilter(filter_data)
    }

    // delete function
    // const handleDelete = (id) => {
    //     let token = GetLocalStorage('token');
    //     const request = {
    //         headers: {
    //             Authorization: `Bearer ${token}`
    //         }
    //     }
    //     Swal.fire({
    //         title: 'Delete Leave',
    //         text: "Are you sure want to delete?",
    //         icon: 'warning',
    //         showCancelButton: true,
    //         confirmButtonColor: '#1bcfb4',
    //         cancelButtonColor: '#d33',
    //         confirmButtonText: 'Yes, delete it!',
    //         cancelButtonText: 'No, cancel!',
    //         width: '450px',
    //     }).then(async (result) => {
    //         if (result.isConfirmed) {
    //             setLoading(true)
    //             const res = await axios.post(`${process.env.REACT_APP_API_KEY}/leave/delete`, { id: id }, request)
    //             if (res.data.success) {
    //                 getLeave()
    //                 toast.success('Successfully Deleted a leave.')
    //             } else {
    //                 setLoading(false)
    //                 toast.error(res.data.message)
    //             }
    //         }
    //     }).catch((error) => {
    //         setLoading(false)
    //         console.log('error', error)
    //         if (error.response.status === 401) {
    //             getCommonApi();
    //         } else {
    //             if (error.response.data.message) {
    //                 toast.error(error.response.data.message)
    //             } else {
    //                 if (typeof error.response.data.error === "string") {
    //                     toast.error(error.response.data.error)
    //                 }
    //             }
    //         }
    //     })
    // }

    // status change function
    const handleStatus = async (e) => {
        e.preventDefault();
        try {
            setLoading(true)
            let token = GetLocalStorage('token');
            const request = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
            const res = await axios.post(`${process.env.REACT_APP_API_KEY}/leave/status`, { id: id, status }, request)
            if (res.data.success) {
                toast.success('Successfully edited a leave status.');
                setShow(false);
                getLeave();
            } else {
                setLoading(false)
                toast.error(res.data.message)
            }
        } catch (error) {
            setLoading(false)
            console.log('error', error)
            if (error.response.status === 401) {
                getCommonApi();
            } else {
                if (error.response.data.message) {
                    toast.error(error.response.data.message)
                } else {
                    if (typeof error.response.data.error === "string") {
                        toast.error(error.response.data.error)
                    }
                }
            }
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
            if (b.user ? b.user.first_name?.concat(" ", b.last_name) : b.user < a.user ? a.user.first_name?.concat(" ", a.last_name) : a.user) {
                return -1
            }
            if (b.user ? b.user.first_name?.concat(" ", b.last_name) : b.user > a.user ? a.user.first_name?.concat(" ", a.last_name) : a.user) {
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
        if (UserData && UserData.role.name.toLowerCase() === "admin") {
            setAction(true)
        } else {
            if (accessData.length !== 0 && accessData[0].update !== '0') {
                leaveRecordFilter.forEach((val) => {
                    if (val.status === 'Pending' || val.status === "Read") {
                        setAction(true)
                    }else{
                        setAction(false)
                    }
                })
            }
        }
        // eslint-disable-next-line
    }, [leaveRecordFilter,UserData]);

    return (
        <>
            <motion.div
                className="box"
                initial={{ opacity: 0, transform: 'translateY(-20px)' }}
                animate={{ opacity: 1, transform: 'translateY(0px)' }}
                transition={{ duration: 0.5 }}
            >
                <div className=''>
                    <div className='container-fluid '>
                        <div className="row breadcrumb-btn">
                            <div className="col-10">
                                <ul id="breadcrumb" className="mb-0">
                                    <li><a href="/" className="ihome"><span className="icon icon-home"> </span></a></li>
                                    <li><a href="/leave" className="ibeaker"><i className="fa-solid fa-user icon"></i> Leave</a></li>
                                </ul>
                            </div>
                            <div className="col-2">
                                <div className=' add-employee-btn'>
                                    <LeaveModal getLeave={getLeave} UserData={UserData && UserData.role} accessData={accessData} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="background-wrapper bg-white pt-5">
                        <div className='container-fluid pr-5'>
                            <div className='row justify-content-end row-std inner-pages'>
                                {/* search box */}
                                <div className={`col-md-3 col-sm-4 col-3 p-0 text-end `} id="two">
                                    <Form.Control type="text" className={`${visible ? "open" : "close-btn"}`} id="exampleInputUsername1" placeholder=" &#xf002; &nbsp; Search " size="lg" onChange={HandleFilter} style={{ fontFamily: 'font_awesome', fontWeight: '500' }} />
                                    <div className="magnifierContainer">
                                        <i className={`fa-solid fa-magnifying-glass material-icons`} onClick={handleVisibility}></i>
                                    </div>
                                </div>

                            </div>
                        </div >
                        <div>
                            {/* table */}
                            <TableContainer >
                                <Table className="common-table-section">
                                <TableHead className="common-header">
                                    <TableRow>
                                        {/* <TableCell>
                                            <TableSortLabel active={orderBy === "id"} direction={orderBy === "id" ? order : "asc"} onClick={() => handleRequestSort("id")}>
                                                Id
                                            </TableSortLabel>
                                        </TableCell> */}
                                        <TableCell>
                                            Profile
                                        </TableCell>
                                        <TableCell>
                                            <TableSortLabel active={orderBy === "name"} direction={orderBy === "name" ? order : "asc"} onClick={() => handleRequestSort("name")}>
                                                Employee
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell>
                                            <TableSortLabel active={orderBy === "leave_type"} direction={orderBy === "leave_type" ? order : "asc"} onClick={() => handleRequestSort("leave_type")}>
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
                                            <TableSortLabel active={orderBy === "day"} direction={orderBy === "day" ? order : "asc"} onClick={() => handleRequestSort("day")}>
                                                Duration
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell>
                                            <TableSortLabel active={orderBy === "leave_status"} direction={orderBy === "leave_status" ? order : "asc"} onClick={() => handleRequestSort("leave_status")}>
                                                Leave For
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell>
                                            <TableSortLabel active={orderBy === "description"} direction={orderBy === "description" ? order : "asc"} onClick={() => handleRequestSort("description")}>
                                                Reason
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell>
                                            Status
                                        </TableCell>
                                        {(Action || leaveRecordFilter.length === 0) &&
                                            <TableCell>
                                                Action
                                            </TableCell>}
                                    </TableRow>
                                </TableHead>
                                    <TableBody>
                                    {leaveRecordFilter.length !== 0 ? sortRowInformation(leaveRecordFilter, getComparator(order, orderBy)).slice(count * page, count * page + count).map((val, ind) => {
                                        return (
                                            <TableRow key={ind}>
                                                {/* <TableCell>{val.id}</TableCell> */}
                                                <TableCell>{val.user &&
                                                    <NavLink className={'pr-3'} to={`${process.env.REACT_APP_IMAGE_API}/storage/${val.user.profile_image}`} target="_blank">
                                                        <img className="profile-action-icon text-center" src={val.user.profile_image && `${process.env.REACT_APP_IMAGE_API}/storage/${val.user.profile_image}`} alt="Profile_image" />
                                                    </NavLink>}</TableCell>
                                                <TableCell>
                                                        {val.user ? val.user.first_name.concat(" ", val.user.last_name) : <HiOutlineMinus />}
                                                </TableCell>
                                                <TableCell>{val.leave_type ? val.leave_type.name : <HiOutlineMinus />}</TableCell>
                                                <TableCell>{val.from_date}</TableCell>
                                                <TableCell>{val.to_date}</TableCell>
                                                <TableCell>{val.day}</TableCell>
                                                <TableCell>{val.leave_status}</TableCell>
                                                <TableCell>{val.description}</TableCell>
                                                <TableCell>
                                                    <button className={`${val.status === "Declined" ? "btn-gradient-danger" : val.status === "Approved" ? "btn-gradient-success" : val.status === "Pending" ? "btn-gradient-secondary" : "btn-gradient-info"} btn status-label`} disabled={((val.status !== 'Pending' && val.status !== 'Read') && new Date(val.from_date) < new Date()) || (UserData && UserData.role.name !== "Admin")} onClick={() => handlesshowModal(val.status, val.id)}>{val.status}</button>
                                                </TableCell>
                                                {Action &&
                                                    <TableCell>
                                                        <div className='action'>
                                                            {/* eslint-disable-next-line no-mixed-operators */}
                                                            {((val.status !== 'Pending' && val.status !== "Read") && new Date(val.from_date) < new Date()) || (UserData && UserData.role.name.toLowerCase() !== "admin" && (accessData.length !== 0 && accessData[0].update === '0' || val.status !== 'Pending' && val.status !== "Read")) ? "" : <LeaveModal data={val} getLeave={getLeave} UserData={UserData && UserData.role} accessData={accessData} />}
                                                            {/* {(UserData && UserData.role.name.toLowerCase() !== "admin") && (accessData.length !== 0 && accessData[0].delete === "0") ? "" : <i className="fa-solid fa-trash-can" onClick={() => handleDelete(val.id)}></i>} */}
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
                                count={leaveRecordFilter.length}
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
                                        <div className='d-flex justify-content-end modal-button'>
                                            <button type="submit" className="btn btn-gradient-primary mr-2" onClick={handleStatus}>Save</button>
                                            <button className="btn btn-light" onClick={handleshideModal}>Cancel</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                        {(Loading && show) && <Spinner />}
                    </Modal.Body>
                </Modal>
            </motion.div>
            {Loading && <Spinner />}
        </>
    )
}
export default Leave
