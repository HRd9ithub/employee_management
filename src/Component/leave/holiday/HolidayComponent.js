import React, { useMemo, useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from "framer-motion";
import { Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel } from "@mui/material";
import { customAxios } from '../../../service/CreateApi';
import Spinner from '../../common/Spinner';
import Error500 from '../../error_pages/Error500';
import Error403 from '../../error_pages/Error403';
import moment from 'moment';
import HolidayModal from './HolidayModal';
import Swal from 'sweetalert2';
import usePagination from '../../../hooks/usePagination';


const HolidayComponent = () => {
    const [isLoading, setisLoading] = useState(false);
    const [records, setRecords] = useState([]);
    const [searchItem, setsearchItem] = useState("");
    const [permission, setpermission] = useState("");
    const [serverError, setServerError] = useState(false);
    const [permissionToggle, setPermissionToggle] = useState(true);

    // pagination state
    const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } = usePagination(25);

    // sort state
    const [order, setOrder] = useState("asc")
    const [orderBy, setOrderBy] = useState("id")

    //get Holi
    const get_holiday_detail = async () => {
        try {
            setisLoading(true);
            setPermissionToggle(true);
            setServerError(false);
            const res = await customAxios().get('/holiday/');
            if (res.data.success) {
                setRecords(res.data.data)
                setpermission(res.data.permissions)
            }
        } catch (error) {
            if (!error.response) {
                setServerError(true)
                toast.error(error.message)
            }else {
                if (error.response.status === 500) {
                    setServerError(true)
                }
                if (error.response.data.message) {
                    toast.error(error.response.data.message)
                }
            }
        } finally {
            setisLoading(false);
            setPermissionToggle(false);
        }
    }

    useEffect(() => {
        get_holiday_detail()
        // eslint-disable-next-line
    }, [])

    // delete function
    const handleDelete = (id) => {
        Swal.fire({
            title: "Delete Holiday",
            text: "Are you sure you want to delete?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#1bcfb4",
            cancelButtonColor: "#d33",
            confirmButtonText: "Delete",
            cancelButtonText: "Cancel",
            width: "450px",
        }).then(async (result) => {
            if (result.isConfirmed) {
                setisLoading(true);
                const res = await customAxios().delete(`/holiday/${id}`);
                if (res.data.success) {
                    get_holiday_detail();
                    toast.success(res.data.message);
                }
            }
        }).catch((error) => {
            setisLoading(false);
            if (!error.response) {
                toast.error(error.message)
            } else {
                if (error.response.data.message) {
                    toast.error(error.response.data.message)
                }
            }
        })
    };

    // memoize filtered items
    const recordsFilter = useMemo(() => {
        return records.filter((item) => {
            return (
                item.name.toLowerCase().includes(searchItem.toLowerCase()) ||
                item.day.toLowerCase().includes(searchItem.toLowerCase()) ||
                moment(item.date).format('DD MMM YYYY').toLowerCase().includes(searchItem.toLowerCase())
            )
        });
    }, [records, searchItem]);

    // sort function
    const handleRequestSort = (name) => {
        const isAsc = (orderBy === name && order === "asc");

        setOrderBy(name)
        setOrder(isAsc ? "desc" : "asc")
    }

    const descedingComparator = (a, b, orderBy) => {
        if (b[orderBy] < a[orderBy]) {
            return -1
        }
        if (b[orderBy] > a[orderBy]) {
            return 1
        }
        return 0
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

    if (isLoading) {
        return <Spinner />;
    } else if (serverError) {
        return <Error500 />;
    } else if ((!permission || permission.permissions.list !== 1) && !permissionToggle) {
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
                <div className=" container-fluid py-4">
                    <div className="background-wrapper bg-white pb-4">
                        <div className=''>
                            <div className='row justify-content-end align-items-center row-std m-0'>
                                <div className="col-12 col-sm-5 d-flex justify-content-between align-items-center">
                                    <div>
                                        <ul id="breadcrumb" className="mb-0">
                                            <li><NavLink to="/" className="ihome">Dashboard</NavLink></li>
                                            <li><NavLink to="" className="ibeaker"><i className="fa-solid fa-play"></i> &nbsp; Holiday</NavLink></li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="col-12 col-sm-7 d-flex justify-content-end" id="two">
                                    <div className="search-full">
                                        <input type="search" className="input-search-full" autoComplete='off' value={searchItem} name="txt" placeholder="Search" onChange={(event) => setsearchItem(event.target.value)} />
                                        <i className="fas fa-search"></i>
                                    </div>
                                    <div className="search-box mr-3">
                                        <form name="search-inner">
                                            <input type="search" className="input-search" autoComplete='off' value={searchItem} name="txt" onChange={(event) => setsearchItem(event.target.value)} />
                                        </form>
                                        <i className="fas fa-search"></i>
                                    </div>
                                    <HolidayModal get_holiday_detail={get_holiday_detail} permission={permission} />
                                </div>
                            </div>
                        </div>

                        {/* table */}
                        <div className="mx-4">
                            <TableContainer >
                                <Table className="common-table-section">
                                    <TableHead className="common-header">
                                        <TableRow>
                                            <TableCell>
                                                Id
                                            </TableCell>
                                            <TableCell>
                                                <TableSortLabel active={orderBy === "name"} direction={orderBy === "name" ? order : "asc"} onClick={() => handleRequestSort("name")}>
                                                    Holiday Name
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell>
                                                <TableSortLabel active={orderBy === "date"} direction={orderBy === "date" ? order : "asc"} onClick={() => handleRequestSort("date")}>
                                                    Date
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell>
                                                <TableSortLabel active={orderBy === "day"} direction={orderBy === "day" ? order : "asc"} onClick={() => handleRequestSort("day")}>
                                                    Day
                                                </TableSortLabel>
                                            </TableCell>
                                            {permission && (permission.permissions.update === 1 || permission.permissions.delete === 1) &&
                                                <TableCell>
                                                    Action
                                                </TableCell>}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {recordsFilter.length !== 0 ? sortRowInformation(recordsFilter, getComparator(order, orderBy)).slice(rowsPerPage * page, rowsPerPage * page + rowsPerPage).map((val, ind) => {
                                            return (
                                                <TableRow key={val._id}>
                                                    <TableCell>{rowsPerPage * page + ind + 1}</TableCell>
                                                    <TableCell>{val.name}</TableCell>
                                                    <TableCell>{moment(val.date).format('DD MMM YYYY')}</TableCell>
                                                    <TableCell>{val.day}</TableCell>
                                                    {permission && (permission.permissions.update === 1 || permission.permissions.delete === 1) &&
                                                        <TableCell>
                                                            <div className='action'>
                                                                <HolidayModal data={val} get_holiday_detail={get_holiday_detail} />
                                                                {permission && permission.permissions.delete === 1 &&
                                                                    <i className="fa-solid fa-trash-can" onClick={() => handleDelete(val._id)}></i>}
                                                            </div>
                                                        </TableCell>
                                                    }
                                                </TableRow>
                                            )
                                        }) :
                                            <TableRow>
                                                <TableCell colSpan={5} align="center">
                                                    No Records Found
                                                </TableCell>
                                            </TableRow>
                                        }
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TablePagination rowsPerPageOptions={[5, 10, 15, 25, 50, 100]}
                                component="div"
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                rowsPerPage={rowsPerPage}
                                count={recordsFilter.length}
                                page={page}>
                            </TablePagination>
                        </div >
                    </div >
                </div>
            </motion.div>
        </>
    )
}
export default HolidayComponent