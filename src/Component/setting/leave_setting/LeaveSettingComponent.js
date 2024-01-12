import { motion } from 'framer-motion';
import React, { useLayoutEffect, useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom';
import LeaveSettingModal from './LeaveSettingModal';
import { Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel } from "@mui/material";
import { customAxios } from '../../../service/CreateApi';
import toast from 'react-hot-toast';
import Spinner from '../../common/Spinner';
import Error500 from '../../error_pages/Error500';
import Error403 from '../../error_pages/Error403';

const LeaveSettingComponent = () => {
    const [records, setRecords] = useState([]);
    const [isLoading, setisLoading] = useState(false);
    const [permission, setpermission] = useState("");
    const [serverError, setServerError] = useState(false);
    const [searchItem, setsearchItem] = useState("");
    const [permissionToggle, setPermissionToggle] = useState(true);

    // pagination state
    const [count, setCount] = useState(5)
    const [page, setpage] = useState(0)

    // sort state
    const [order, setOrder] = useState("asc")
    const [orderBy, setOrderBy] = useState("")

    /*--------------------
     get leave setting data
    ----------------------*/
    const getLeaveSetting = async () => {
        setServerError(false)
        setisLoading(true);
        setPermissionToggle(true);

        customAxios().get(`/leave-setting`).then((res) => {
            if (res.data.success) {
                const { data, permissions } = res.data;
                setpermission(permissions);
                setRecords(data);
                setisLoading(false);
            }
        }).catch((error) => {
            setisLoading(false);
            if (!error.response) {
                setServerError(true)
                toast.error(error.message);
            } else {
                if (error.response.status === 500) {
                    setServerError(true)
                }
                if (error.response.data.message) {
                    toast.error(error.response.data.message)
                }
            }
        }).finally(() => setPermissionToggle(false))
    }

    useLayoutEffect(() => {
        getLeaveSetting();
    }, [])

    /*--------------------
     pagination and sort table
    ----------------------*/

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
        if (orderBy === "name") {
            if (b.first_name?.concat(" ", b.last_name) < a.first_name?.concat(" ", a.last_name)) {
                return -1
            }
            if (b.first_name?.concat(" ", b.last_name) > a.first_name?.concat(" ", a.last_name)) {
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

    /*--------------------
        Search filter
    ----------------------*/
    const recordsFilter = useMemo(() => {
        return records.filter((item) => {
            return (
                item.leavetype?.toLowerCase().includes(searchItem.toLowerCase()) ||
                item.totalLeave.toString().toLowerCase().includes(searchItem.toLowerCase())
            )
        })
    }, [records, searchItem]);

    //  search onchange funcation
    const handleSearch = (event) => {
        setsearchItem(event.target.value);
    }

    if (isLoading) {
        return <Spinner />;
    } else if (serverError) {
        return <Error500 />;
    } else if ((!permission || permission.name.toLowerCase() !== "admin") && !permissionToggle) {
        return <Error403 />;
    }

    return (
        <>
            <motion.div className="box" initial={{ opacity: 0, transform: "translateY(-20px)" }} animate={{ opacity: 1, transform: "translateY(0px)" }} transition={{ duration: 0.5 }}>
                <div className="container-fluid py-4">
                    <div className="background-wrapper bg-white pb-4">
                        <div>
                            <div className='row justify-content-end align-items-center row-std m-0'>
                                <div className="col-12 col-sm-5 col-xl-3 d-flex justify-content-between align-items-center">
                                    <div>
                                        <ul id="breadcrumb" className="mb-0">
                                            <li><NavLink to="/" className="ihome">Dashboard</NavLink></li>
                                            <li><NavLink to="" className="ibeaker"><i className="fa-solid fa-play"></i> &nbsp; Leave Setting</NavLink></li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="col-12 col-sm-7 col-xl-9 d-flex justify-content-end" id="two">
                                    <div className="d-flex justify-content-end align-items-center w-100" style={{ gap: '15px' }}>
                                        <div className="search-full pr-0">
                                            <input tye="search" className="input-search-full" autoComplete='off' placeholder="Search" value={searchItem} onChange={handleSearch}/>
                                            <i className="fas fa-search"></i>
                                        </div>
                                        <div className="search-box mr-3">
                                            <form name="search-inner">
                                                <input type="search" className="input-search" autoComplete='off' value={searchItem} onChange={handleSearch}/>
                                            </form>
                                            <i className="fas fa-search"></i>
                                        </div>
                                        <LeaveSettingModal permission={permission} getLeaveSetting={getLeaveSetting} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mx-4 pt-3">
                            <TableContainer >
                                <Table className="common-table-section expanted-table">
                                    <TableHead className="common-header">
                                        <TableRow>
                                            <TableCell>
                                                Id
                                            </TableCell>
                                            <TableCell>
                                                <TableSortLabel active={orderBy === "leavetype"} direction={orderBy === "leavetype" ? order : "asc"} onClick={() => handleRequestSort("leavetype")}>
                                                    Leave Type
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell>
                                                <TableSortLabel active={orderBy === "totalLeave"} direction={orderBy === "totalLeave" ? order : "asc"} onClick={() => handleRequestSort("totalLeave")}>
                                                    Total Leave
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell>
                                                Action
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {recordsFilter.length !== 0 ? sortRowInformation(recordsFilter, getComparator(order, orderBy)).slice(count * page, count * page + count).map((val, ind) => {
                                            return (
                                                <TableRow key={val._id}>
                                                    <TableCell>{ind + 1}</TableCell>
                                                    <TableCell>{val.leavetype}</TableCell>
                                                    <TableCell>{val.totalLeave}</TableCell>
                                                    <TableCell>
                                                        <div className='action'>
                                                            <LeaveSettingModal data={val} permission={permission} getLeaveSetting={getLeaveSetting} />
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        }) :
                                            <TableRow>
                                                <TableCell colSpan={10} align="center">
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
                                count={recordsFilter.length}
                                page={page}>

                            </TablePagination>
                        </div>
                    </div>
                </div>
            </motion.div>
        </>
    )
}

export default LeaveSettingComponent;
