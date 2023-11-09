import React from 'react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import GlobalPageRedirect from '../../../auth_context/GlobalPageRedirect';
import Spinner from '../../../common/Spinner';
import { Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel } from "@mui/material";
import moment from 'moment';
import DateRangePicker from 'react-bootstrap-daterangepicker';
import 'bootstrap-daterangepicker/daterangepicker.css';
import { useNavigate } from 'react-router-dom';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { customAxios } from '../../../../service/CreateApi';
import ranges from '../../../../helper/calcendarOption';


const LoginInfo = ({ userId }) => {
    let date_today = new Date();
    let history = useNavigate();


    let { getCommonApi } = GlobalPageRedirect();
    const [loader, setLoader] = useState(false)
    const [dataFilter, setDataFilter] = useState([]);
    const [startDate, setStartDate] = useState(new Date(date_today.getFullYear(), date_today.getMonth(), 1));
    const [endDate, setendtDate] = useState(new Date());

    // pagination state
    const [count, setCount] = useState(5)
    const [page, setpage] = useState(0)

    // sort state
    const [order, setOrder] = useState("desc")
    const [orderBy, setOrderBy] = useState("createdAt")

    const getLoginInfo = async (start ,end) => {
        try {
            setLoader(true);
            const response = await customAxios().post('/user/loginInfo', { id: userId ,startDate : start || startDate,endDate : end || endDate});

            if (response.data.success) {
                setDataFilter(response.data.data)
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
            setLoader(false)
        }
    }

    useEffect(() => {
        getLoginInfo();
        // eslint-disable-next-line
    }, [])

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

    const handleCallback = (start, end, label) => {
        setStartDate(start._d)
        setendtDate(end._d)
        getLoginInfo(start._d, end._d)
    }
   
    return (
        <div>

            {/* table */}
            <div>
                <div className='col-12 col-md-4 col-lg-4 col-xl-4 col-xxl-4 ml-auto px-0'>
                    <div className="form-group mb-0 position-relative">
                        <DateRangePicker initialSettings={{ startDate: startDate, endDate: endDate ,ranges: ranges, maxDate: new Date()}} onCallback={handleCallback} ><input className="form-control mt-3" /></DateRangePicker>
                        <CalendarMonthIcon className="range_icon"/>
                    </div>
                </div>
                <TableContainer >
                    <Table className="common-table-section">
                        <TableHead className="common-header">
                            <TableRow>
                                <TableCell>
                                    Id
                                </TableCell>
                                <TableCell>
                                    <TableSortLabel active={orderBy === "createdAt"} direction={orderBy === "createdAt" ? order : "asc"} onClick={() => handleRequestSort("createdAt")}>
                                        Date & Time
                                    </TableSortLabel>
                                </TableCell>
                                {/* <TableCell>
                                    <TableSortLabel active={orderBy === "createdAt"} direction={orderBy === "createdAt" ? order : "asc"} onClick={() => handleRequestSort("createdAt")}>
                                        Time
                                    </TableSortLabel>
                                </TableCell> */}
                                <TableCell>
                                    <TableSortLabel active={orderBy === "ip"} direction={orderBy === "ip" ? order : "asc"} onClick={() => handleRequestSort("ip")}>
                                        IP
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell>
                                    <TableSortLabel active={orderBy === "device"} direction={orderBy === "device" ? order : "asc"} onClick={() => handleRequestSort("device")}>
                                        Device
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell>
                                    <TableSortLabel active={orderBy === "device_name"} direction={orderBy === "device_name" ? order : "asc"} onClick={() => handleRequestSort("device_name")}>
                                        Device Name
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell>
                                    <TableSortLabel active={orderBy === "browser_name"} direction={orderBy === "browser_name" ? order : "asc"} onClick={() => handleRequestSort("browser_name")}>
                                        Browser Name
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell>
                                    <TableSortLabel active={orderBy === "city"} direction={orderBy === "city" ? order : "asc"} onClick={() => handleRequestSort("city")}>
                                        City
                                    </TableSortLabel>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {dataFilter.length !== 0 ? sortRowInformation(dataFilter, getComparator(order, orderBy)).slice(count * page, count * page + count).map((val, ind) => {
                                return (
                                    <TableRow key={ind}>
                                        <TableCell>{ind + 1}</TableCell>
                                        <TableCell>{moment(val.createdAt).format("DD MMM YYYY hh:mm:ss A")}</TableCell>
                                        {/* <TableCell>{moment(val.createdAt).format("hh:mm:ss A")}</TableCell> */}
                                        <TableCell>{val.ip}</TableCell>
                                        <TableCell>{val.device}</TableCell>
                                        <TableCell>{val.device_name ? val.device_name : "-"}</TableCell>
                                        <TableCell>{val.browser_name}</TableCell>
                                        <TableCell>{val.city}</TableCell>
                                    </TableRow>
                                )
                            }) :
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
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
                    count={dataFilter.length}
                    page={page}>
                </TablePagination>
            </div>
            <div className="submit-section d-flex justify-content-end py-3">
                    <button className="btn btn-light" onClick={() => history("/employees")}>Back</button>
                </div>
            {loader && <Spinner />}
        </div>
    )
}

export default LoginInfo