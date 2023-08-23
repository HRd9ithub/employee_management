import React, { useContext, useEffect } from "react";
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppProvider } from "../context/RouteContext";
import { HiOutlineMinus } from "react-icons/hi";
import Spinners from "../common/Spinner";
import { Form } from "react-bootstrap";
import GlobalPageRedirect from "../auth_context/GlobalPageRedirect";
import { GetLocalStorage } from "../../service/StoreLocalStorage";
import { Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel } from "@mui/material";

const TimeSheetComponent = ({ HandleProgress }) => {
    const [data, setData] = useState([]);
    const [dataFilter, setDataFilter] = useState([]);
    // const [singleData, setsingleData] = useState([]);
    const [Loader, setLoader] = useState(true);
    // const [ToggleBtn, setToggleBtn] = useState(false);   

    let { getCommonApi } = GlobalPageRedirect()

    let { UserData} = useContext(AppProvider);

    // pagination state
    const [count, setCount] = useState(5)
    const [page, setpage] = useState(0)

    // sort state
    const [order, setOrder] = useState("asc")
    const [orderBy, setOrderBy] = useState("date")

    // time management in button click
    // const handleTime = () => {
    //     setLoader(true)
    //     // setToggleBtn(true);
    //     let Hours = new Date().getHours();
    //     let Minutes = new Date().getMinutes();
    //     let login_time = Hours + ":" + Minutes;
    //     let logout_time = Hours + ":" + Minutes;

    //     if (singleData.length !== 0) {
    //         if (singleData[singleData.length - 1].logout_time) {
    //             if (singleData[singleData.length - 1].login_time > singleData[singleData.length - 1].logout_time) {
    //                 addLogoutTime(logout_time)
    //             } else {
    //                 addLoginTime(login_time)
    //             }
    //         } else {
    //             addLogoutTime(logout_time)
    //         }
    //     } else {
    //         addLoginTime(login_time)
    //     }
    // };

    // add login time function
    // const addLoginTime = (login_time) => {
    //     axios.post(`${process.env.REACT_APP_API_KEY}/timesheet/logintime`, { login_time }, {
    //         headers: {
    //             Authorization: `Bearer ${GetLocalStorage("token")}`,
    //         },
    //     }).then((res) => {
    //         if (res.data.success) {
    //             getSingleData()
    //             getTimesheet();
    //             toast.success("Login time add successfully.");
    //         }
    //     }).catch((error) => {
    //         console.log("error", error)
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

    // add logout time function
    // const addLogoutTime = (logout_time) => {
    //     axios.post(`${process.env.REACT_APP_API_KEY}/timesheet/logout_time`, { logout_time }, {
    //         headers: {
    //             Authorization: `Bearer ${GetLocalStorage("token")}`,
    //         },
    //     }).then((res) => {
    //         if (res.data.success) {
    //             getSingleData();
    //             getTimesheet();
    //             handleLogout();
    //         }
    //     }).catch((error) => {
    //         console.log("err", error)
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

    // get timesheet data
    const getTimesheet = async () => {
        HandleProgress(20);
        setLoader(true)
        try {
            const request = {
                headers: {
                    Authorization: `Bearer ${GetLocalStorage("token")}`,
                },
            };
            HandleProgress(50);
            const result = await axios.get(`${process.env.REACT_APP_API_KEY}/timesheet/list`, request);
            HandleProgress(70);
            if (result.data.success) {
                if (UserData.role.name.toLowerCase() !== "admin") {
                    const value = result.data.data.filter((val) => {
                        return val.user_id === UserData.id;
                    });
                    setData(value);
                    setDataFilter(value);
                } else {
                    setData(result.data.data);
                    setDataFilter(result.data.data);
                }
            }
        } catch (error) {
            console.log("TimeSheetComponent page all data get api === >>> ", error);
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
        } finally {
            HandleProgress(100);
            setLoader(false)
        }
    };

    // single data get
    // const getSingleData = async () => {
    //     try {
    //         const request = {
    //             headers: {
    //                 Authorization: `Bearer ${GetLocalStorage("token")}`,
    //             },
    //         };
    //         const result = await axios.get(`${process.env.REACT_APP_API_KEY}/timesheet/user_time_list`, request);
    //         if (result.data.success) {
    //             let { data } = result.data;
    //             // setsingleData(data);
    //         }
    //     } catch (error) {
    //         console.log("TimeSheetComponent page singleData get api === >>> ", error);
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
    //     } finally {
    //         // setToggleBtn(false);
    //     }
    // };

    useEffect(() => {
        // getSingleData();
        getTimesheet();
        // eslint-disable-next-line
    }, []);


    // Search filter
    const HandleFilter = (event) => {
        let { value } = event.target;

        const list = data.filter((val, ind) => {
            return (
                val.user?.first_name?.concat(" ", val.user.last_name).toLowerCase().includes(value.toLowerCase()) ||
                val.date.toString().includes(value) ||
                val.login_time?.toString().includes(value) ||
                val.logout_time?.toString().includes(value) ||
                val.count_time?.toString().includes(value)
                // val.id.toString().includes(value) 
            );
        });
        if(value){
            setDataFilter(list);
        }else{
            setDataFilter(data)
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
        if (orderBy === "name") {
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

    return (
        <>
            <motion.div className="box" initial={{ opacity: 0, transform: "translateY(-20px)" }} animate={{ opacity: 1, transform: "translateY(0px)" }} transition={{ duration: 0.5 }}>
                <div className=''>
                    <div className='container-fluid '>
                        <div className="row breadcrumb-btn">
                            <div className="col-10">
                                <ul id="breadcrumb" className="mb-0">
                                    <li><NavLink to="/" className="ihome"><span className="icon icon-home"> </span></NavLink></li>
                                    <li><NavLink to="/timesheet" className="ibeaker"><i className="fa-solid fa-user icon"></i> Time Sheet</NavLink></li>
                                </ul>
                            </div>
                            <div className="col-2">
                            </div>
                        </div>
                    </div>
                    <div className="background-wrapper bg-white pt-5">
                        <div className='container-fluid pr-5'>
                            <div className='row justify-content-end row-std inner-pages'>
                                {/* search box */}
                                <div className={`col-md-3 col-sm-4 col-2 p-0 text-end `} id="two">
                                    <Form.Control type="text" className="open" id="exampleInputUsername1" placeholder=" &#xf002; &nbsp; Search " size="lg" onChange={HandleFilter} style={{ fontFamily: 'font_awesome', fontWeight: '500' }} />
                                </div>
                            </div>
                        </div>
                    <div>
                    <TableContainer >
                        <Table className="common-table-section">
                            <TableHead className="common-header">
                                <TableRow>
                                    {/* <TableCell>
                                        <TableSortLabel active={orderBy === "id"} direction={orderBy === "id" ? order : "asc"} onClick={() => handleRequestSort("id")}>
                                            Id
                                        </TableSortLabel>
                                    </TableCell> */}
                                    {UserData && UserData.role?.name.toLowerCase() === "admin" &&
                                    <TableCell>
                                        <TableSortLabel active={orderBy === "name"} direction={orderBy === "name" ? order : "asc"} onClick={() => handleRequestSort("name")}>
                                            Employee
                                        </TableSortLabel>
                                    </TableCell>}
                                    <TableCell>
                                        <TableSortLabel active={orderBy === "date"} direction={orderBy === "date" ? order : "asc"} onClick={() => handleRequestSort("date")}>
                                            Date
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell>
                                        <TableSortLabel active={orderBy === "login_time"} direction={orderBy === "login_time" ? order : "asc"} onClick={() => handleRequestSort("login_time")}>
                                            Login Time
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell>
                                        <TableSortLabel active={orderBy === "logout_time"} direction={orderBy === "logout_time" ? order : "asc"} onClick={() => handleRequestSort("logout_time")}>
                                            Logout Time
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell>
                                        <TableSortLabel active={orderBy === "count_time"} direction={orderBy === "count_time" ? order : "asc"} onClick={() => handleRequestSort("count_time")}>
                                            Total Hours
                                        </TableSortLabel>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {dataFilter.length !== 0 ? sortRowInformation(dataFilter, getComparator(order, orderBy)).slice(count * page, count * page + count).map((val, ind) => {
                                    return (
                                        <TableRow key={ind}>
                                            {/* <TableCell>{val.id}</TableCell> */}
                                            {UserData && UserData.role?.name.toLowerCase() === "admin" &&
                                            <TableCell>{val.user ? val.user.first_name.concat(" ", val.user.last_name) : <HiOutlineMinus />}</TableCell>}
                                            <TableCell>{val.date}</TableCell>
                                            <TableCell>{val.login_time}</TableCell>
                                            <TableCell>{val.logout_time ? val.logout_time : <HiOutlineMinus />}</TableCell>
                                            <TableCell>{val.count_time ? val.count_time : (<HiOutlineMinus />)}</TableCell>
                                        </TableRow>
                                    )
                                }) :
                                        <TableRow>
                                            <TableCell colSpan={6} align="center">
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
                </div>
                </div>
            </motion.div>
            {(Loader ) && <Spinners />}
        </>
    );
};

export default TimeSheetComponent;
