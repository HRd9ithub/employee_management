import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import DocumentModalComponent from './DocumentModalComponent';
import { useEffect } from 'react';
import axios from 'axios';
import Spinner from '../common/Spinner';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { Form } from 'react-bootstrap';
import { useContext } from 'react';
import { AppProvider } from '../context/RouteContext';
import GlobalPageRedirect from '../auth_context/GlobalPageRedirect';
import { GetLocalStorage } from '../../service/StoreLocalStorage';
import { Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel } from "@mui/material";

const DocumentComponent = ({ HandleProgress }) => {
    const [documentData, setDocumentData] = useState([]);
    const [documentDataFilter, setDocumentDataFilter] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toggle, setToggle] = useState(false);

    let { accessData, UserData, handleVisibility, visible } = useContext(AppProvider)

    let { getCommonApi } = GlobalPageRedirect();

    // pagination state
    const [count, setCount] = useState(5)
    const [page, setpage] = useState(0)

    // sort state
    const [order, setOrder] = useState("asc")
    const [orderBy, setOrderBy] = useState("id")

    // get document data in api
    useEffect(() => {
        const getDocument = () => {
            HandleProgress(20)
            setLoading(true)
            HandleProgress(40)
            axios.get(`${process.env.REACT_APP_API_KEY}/important_documents/list`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + GetLocalStorage('token')
                    }
                }
            )
                .then((res) => {
                    HandleProgress(70)
                    setDocumentData(res.data.data);
                    setDocumentDataFilter(res.data.data);
                    setLoading(false);
                    HandleProgress(100)
                })
                .catch((error) => {
                    HandleProgress(100)
                    console.log(error);
                    setLoading(false);
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
                });
        }
        getDocument();
        // eslint-disable-next-line
    }, [toggle]);

    // delete function
    const handleDelete = (id) => {
        let token = GetLocalStorage('token');
        const request = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
        Swal.fire({
            title: 'Delete Document',
            text: "Are you sure want to delete?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#1bcfb4',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!',
            width: '450px',
        }).then(async (result) => {
            if (result.isConfirmed) {
                setLoading(true)
                const res = await axios.post(`${process.env.REACT_APP_API_KEY}/important_documents/delete`, { id: id }, request)
                if (res.data.success) {
                    setToggle(!toggle)
                    toast.success('Deleted Successfully.')
                } else {
                    setLoading(false)
                    toast.error(res.data.message)
                }
            }
        }).catch((error) => {
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
        })
    }

    // search function
    const HandleFilter = (event) => {
        let data = event.target.value;
        let filter_data = documentData.filter((val) => {
            return val.name.toLowerCase().includes(data.toLowerCase()) ||
                val.description.toLowerCase().includes(data.toLowerCase()) ||
                val.id.toString().includes(data.toLowerCase())
        })
        setDocumentDataFilter(filter_data)
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

    return (
        <>
            <motion.div className="box" initial={{ opacity: 0, transform: 'translateY(-20px)' }} animate={{ opacity: 1, transform: 'translateY(0px)' }} transition={{ duration: 0.5 }}>
                <div className=" container-fluid pt-4">
                    <div className="background-wrapper bg-white pt-2">
                        <div className=''>
                            <div className='row justify-content-end align-items-center row-std m-0'>
                                <div className="col-12 d-flex justify-content-between align-items-center">
                                    <div>
                                        <NavLink className="path-header">Documents</NavLink>
                                        <ul id="breadcrumb" className="mb-0">
                                            <li><NavLink to="/" className="ihome">Dashboard</NavLink></li>
                                            <li><NavLink to="/documents" className="ibeaker"><i class="fa-solid fa-play"></i> &nbsp; Documents</NavLink></li>
                                        </ul>
                                    </div>
                                    <div className="d-flex" id="two">
                                        <div className="search-full">
                                            <input type="text" class="input-search-full" name="txt" placeholder="Search" />
                                            <i class="fas fa-search"></i>
                                        </div>
                                        <div class="search-box mr-3">
                                            <form name="search-inner">
                                                <input type="text" class="input-search" name="txt" onmouseout="this.value = ''; this.blur();" />
                                            </form>
                                            <i class="fas fa-search"></i>
                                        </div>
                                        <DocumentModalComponent setToggle={setToggle} toggle={toggle} role={UserData && UserData.role.name} accessData={accessData} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* {table} */}
                        <div>
                            <TableContainer >
                                <Table className="common-table-section">
                                    <TableHead className="common-header">
                                        <TableRow>
                                            <TableCell>
                                                <TableSortLabel active={orderBy === "id"} direction={orderBy === "id" ? order : "asc"} onClick={() => handleRequestSort("id")}>
                                                    Id
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell>
                                                File
                                            </TableCell>
                                            <TableCell>
                                                <TableSortLabel active={orderBy === "name"} direction={orderBy === "name" ? order : "asc"} onClick={() => handleRequestSort("name")}>
                                                    File Name
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell>
                                                <TableSortLabel active={orderBy === "description"} direction={orderBy === "description" ? order : "asc"} onClick={() => handleRequestSort("description")}>
                                                    Description
                                                </TableSortLabel>
                                            </TableCell>
                                            {((UserData && UserData.role.name.toLowerCase() === "admin") || (accessData.length !== 0 && accessData[0].delete !== "0" && accessData[0].update !== "0")) &&
                                                <TableCell>
                                                    Action
                                                </TableCell>}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {documentDataFilter.length !== 0 ? sortRowInformation(documentDataFilter, getComparator(order, orderBy)).slice(count * page, count * page + count).map((val, ind) => {
                                            return (
                                                <TableRow key={ind}>
                                                    <TableCell>{val.id}</TableCell>
                                                    <TableCell>
                                                        <NavLink to={`${process.env.REACT_APP_IMAGE_API}/storage/${val.image}`} target='_blank' >
                                                            <img
                                                                className='mt-1 profile-action-icon'
                                                                style={{ width: '70px', height: '70px' }}
                                                                src={val.image.split(".").pop() !== 'pdf' ? `${process.env.REACT_APP_IMAGE_API}/storage/${val.image}` : '/images/pdf.png'}
                                                                alt="file"
                                                            />
                                                        </NavLink>
                                                    </TableCell>
                                                    <TableCell>{val.name}</TableCell>
                                                    <TableCell>{val.description}</TableCell>
                                                    {((UserData && UserData.role.name.toLowerCase() === "admin") || (accessData.length !== 0 && accessData[0].delete !== "0" && accessData[0].update !== "0")) &&
                                                        <TableCell>
                                                            <div className='action'>
                                                                {(UserData && UserData.role.name.toLowerCase() !== "admin") && (accessData.length !== 0 && accessData[0].update === "0") ? "" : <DocumentModalComponent data={val} setToggle={setToggle} toggle={toggle} role={UserData && UserData.role.name} accessData={accessData} />}
                                                                {(UserData && UserData.role.name.toLowerCase() !== "admin") && (accessData.length !== 0 && accessData[0].delete === "0") ? "" : <i className="fa-solid fa-trash-can" onClick={() => handleDelete(val.id)}></i>}
                                                            </div>
                                                        </TableCell>}
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
                                onPageChange={onChangePage}
                                onRowsPerPageChange={onChangeRowsPerPage}
                                rowsPerPage={count}
                                count={documentDataFilter.length}
                                page={page}>
                            </TablePagination>
                        </div>
                    </div>
                </div>
            </motion.div>
            {loading && <Spinner />}
        </>
    )
}

export default DocumentComponent
