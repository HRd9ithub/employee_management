import React from 'react'
import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import axios from 'axios'
import Spinner from '../common/Spinner'
import DataTable from 'react-data-table-component'
import Empty from '../Employee/Empty'
import Swal from 'sweetalert2'
import { toast } from 'react-toastify'
import { Form } from 'react-bootstrap';
import PageModalComponent from './PageModalComponent'
import Error404 from '../error_pages/Error404'
import { motion } from 'framer-motion'
import { useContext } from 'react'
import { AppProvider } from '../context/RouteContext'
import GlobalPageRedirect from '../auth_context/GlobalPageRedirect';
import { GetLocalStorage } from '../../service/StoreLocalStorage'

const PageComponent = ({ HandleProgress }) => {
    const [loader, setloader] = useState(false);
    const [records, setRecords] = useState([]);
    const [recordsFilter, setRecordsFilter] = useState([]);
    const [toggle, setToggle] = useState(false);

    const { UserData, accessData, getPage, handleVisibility, visible } = useContext(AppProvider);

    let { getCommonApi } = GlobalPageRedirect();

    // table column data
    const column = [
        {
            name: 'Id',
            selector: (row, ind) => row.id,
            sortable: true
        },
        {
            name: 'Page',
            selector: row => row.name,
            sortable: true,
        },
        {
            name: 'Action',
            sortable: false,
            cell: (row) => <div className='d-flex'>
                <PageModalComponent data={row} getPageData={getPageData} accessData={accessData} user={UserData && UserData.role.name} records={records} />
                <button data-action="delete" className='action-icon delete' onClick={() => handleDelete(row.id)} disabled={(UserData && UserData.role.name.toLowerCase() !== 'admin') || (accessData.length !== 0 && accessData[0].delete === "0")} >
                    <i className="fa-solid fa-trash-can"></i>
                </button>
            </div>,
        }
    ]

    // custom style table
    const customStyles = {
        headRow: {
            style: {
                backgroundColor: '#f2edf3',
                marginTop: '10px',
                textTransform: "capitalize",
                fontSize: '15px'
            }
        },
        cells: {
            style: {
                fontSize: '15px'
            }
        },
    }

    // get page name deatil
    const getPageData = async () => {
        try {
            HandleProgress(20)
            setloader(true)
            let token = GetLocalStorage('token');
            const request = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
            }
            HandleProgress(50)
            const res = await axios.get(`${process.env.REACT_APP_API_KEY}/page/list`, request)
            HandleProgress(70)
            if (res.data.success) {
                setRecords(res.data.data)
                setRecordsFilter(res.data.data)
            }
        } catch (error) {
            console.log(error, "<<< === PageComponent page  get api")
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
            HandleProgress(100)
            setloader(false)
        }
    }

    useEffect(() => {
        // call function get page data
        getPageData();
        // eslint-disable-next-line
    }, [toggle])

    // search filter function
    const HandleFilter = (event) => {
        let data = event.target.value;
        let filter_data = records.filter((val) => {
            return val.name.toLowerCase().includes(data.toLowerCase())
        })
        setRecordsFilter(filter_data)
    }

    // delete function
    const handleDelete = (id) => {
        let token = GetLocalStorage('token');
        const request = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
        Swal.fire({
            title: 'Delete Leave Type',
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
                setloader(true)
                const res = await axios.post(`${process.env.REACT_APP_API_KEY}/page/delete`, { id: id }, request)
                if (res.data.success) {
                    setToggle(!toggle)
                    getPage("page")
                    toast.success('Successfully Deleted a page.')
                } else {
                    setloader(false)
                    toast.error(res.data.message)
                }
            }
        }).catch((error) => {
            setloader(false)
            console.log('PageComponent page delete api === >>>> ', error)
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


    // display table or error page
    if ((UserData && UserData.role.name.toLowerCase() === 'admin') || (accessData.length !== 0 && accessData[0].list === "1")) {
        return (
            <>
                <motion.div
                    className="box"
                    initial={{ opacity: 0, transform: 'translateY(-20px)' }}
                    animate={{ opacity: 1, transform: 'translateY(0px)' }}
                    transition={{ duration: 0.5 }}
                >
                    <div className='employee-content'>
                        <div className='container-fluid inner-pages'>
                            <div className='row align-items-center row-std'>
                                <div className='col-md-7 col-sm-6 col-8 employee-path' id="one">
                                    <h1 className='page-title'>Pages</h1>
                                    <ul className='path employee-path'>
                                        <li className='path-title'><NavLink to='/'>Dashboard</NavLink></li>
                                        <li className='path-title active'><NavLink to='/page'>Pages</NavLink></li>
                                    </ul>
                                </div>
                                {/* search box */}
                                <div className={`col-md-3 col-sm-4 col-3 p-0 text-end `} id="two">
                                    <Form.Control type="text" className={`${visible ? "open" : "close-btn"}`} id="exampleInputUsername1" placeholder=" &#xf002; &nbsp; Search " size="lg" onChange={HandleFilter} style={{ fontFamily: 'font_awesome', fontWeight: '500' }} />
                                    <div className="magnifierContainer">
                                        <i className={`fa-solid fa-magnifying-glass material-icons`} onClick={handleVisibility}></i>
                                    </div>
                                </div>
                                <div className="col-md-2 col-sm-2 col-1 p-0" id="three">
                                    <div className=' add-employee-btn'>
                                        <PageModalComponent accessData={accessData} user={UserData && UserData.role.name} getPageData={getPageData} records={records} />
                                    </div>
                                </div>
                            </div>

                        </div>
                        <div>
                            <DataTable
                                columns={column}
                                data={recordsFilter}
                                highlightOnHover
                                pagination
                                paginationPerPage={5}
                                customStyles={customStyles}
                                noDataComponent={<Empty />}
                                paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
                            >
                            </DataTable>
                        </div>
                    </div>

                </motion.div>
                {loader && <Spinner />}
            </>
        )
    } else {
        return <Error404 />
    }
}
export default PageComponent
