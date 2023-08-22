import React, { useEffect, useState } from 'react';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import axios from 'axios';
import Spinner from '../../common/Spinner';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { useContext } from 'react';
import { AppProvider } from '../../context/RouteContext';
import GlobalPageRedirect from '../../auth_context/GlobalPageRedirect';
import { GetLocalStorage } from '../../../service/StoreLocalStorage';

const Premissions = ({ HandleProgress }) => {

    const [loader, setloader] = useState(true)
    const [list, setlist] = useState([])
    let allDetail = []

    let { getCommonApi } = GlobalPageRedirect();

    let { getPremission, Permission, PageData, UserData } = useContext(AppProvider)

    useEffect(() => {
        // get user role detail
        const getuserRole = async () => {
            HandleProgress(20)
            try {
                let token = GetLocalStorage('token');
                const request = {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                }
                HandleProgress(50)
                const res = await axios.get(`${process.env.REACT_APP_API_KEY}/role/list`, request)
                HandleProgress(70)
                if (res.data.success) {
                    const role = res.data.data.filter((val) => {
                        return val.name.toLowerCase() !== 'admin'
                    })
                    HandleProgress(100)
                    setlist(role)
                }
            } catch (error) {
                HandleProgress(100)
                console.log(error, " <<<< =============  user role get error in premission page")
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

        setTimeout(() => {
            setloader(false)
            HandleProgress(100)
        }, 2000)

        getuserRole();
        // eslint-disable-next-line
    }, [])

    // onchange function
    const InputEvent = (val, page, role, action) => {
        HandleProgress(20);
        setloader(true);
        let data = { page_id: page, role_id: role, [action]: val === true ? '1' : '0' }
        let token = GetLocalStorage('token');
        // params in header and body in api
        const request = {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
        }
        HandleProgress(50)
        axios.post(`${process.env.REACT_APP_API_KEY}/permission/add`, data, request)
            .then((data) => {
                HandleProgress(70)
                if (data.data.success) {
                    getPremission()
                    HandleProgress(100)
                    setloader(false);
                    if (val) {
                        toast.success('Successfully added a Permission.')
                    } else {
                        toast.success('Successfully deleted a Permission.')
                    }
                } else {
                    setloader(false);
                    HandleProgress(100)
                    toast.error("Something went wrong, Please check your details and try again.")
                }
            }).catch((error) => {
                setloader(false);
                HandleProgress(100)
                console.log('err', error)
                if (error.response.status === 401) {
                    getCommonApi();
                } else {
                    if (error.response.data.message) {
                        toast.error(error.response.data.message)
                    } else {
                        toast.error(error.message);
                    }
                }
            })
    }

    // eslint-disable-next-line
    PageData.map((val, ind) => {
        allDetail.push({ page_name: val.name, page_id: val.id, role_id: [] })
        // eslint-disable-next-line
        list.map((elem, index) => {
            allDetail[ind].role_id.push({ id: elem.id, list: '0', create: '0', update: '0', delete: '0', list_name: 'list', create_name: 'create', update_name: 'update', delete_name: 'delete' })
            // eslint-disable-next-line
            Permission.map((curElem) => {
                if (val.id === curElem.page_id && elem.id === curElem.role_id) {
                    if (curElem.list === '1') {
                        allDetail[ind].role_id[index].list = '1'
                    }
                    if (curElem.create === '1') {
                        allDetail[ind].role_id[index].create = '1'
                    }
                    if (curElem.update === '1') {
                        allDetail[ind].role_id[index].update = '1'
                    }
                    if (curElem.delete === '1') {
                        allDetail[ind].role_id[index].delete = '1'
                    }
                }
            })
        })
    })

    return (
        <>
            <motion.div
                className="box"
                initial={{ opacity: 0, transform: 'translateY(-20px)' }}
                animate={{ opacity: 1, transform: 'translateY(0px)' }}
                transition={{ duration: 0.5 }}
            >
                <div className='container-fluid employee-content permission py-3 '>
                    <Table >
                        <thead className='mt-3'>
                            <tr>
                                <th>Module Permission</th>
                                {list.map((val) => {
                                    return (
                                        <th key={val.id}>{val.name}</th>
                                    )
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {allDetail.map((elem) => {
                                return (
                                    <tr key={elem.page_id}>
                                        <td>{elem.page_name}</td>
                                        {elem.role_id.map((curElem, ind) => {
                                            return (
                                                <td key={ind}>
                                                    <Form.Check
                                                        type='checkbox'
                                                        id={Math.random().toString().slice(2, 12)}
                                                        label='view'
                                                        checked={curElem.list === '1'}
                                                        onChange={(e) => InputEvent(e.target.checked, elem.page_id, curElem.id, curElem.list_name)}
                                                        disabled={UserData.role.name.toLowerCase() !== 'admin'}
                                                    />
                                                    <Form.Check
                                                        type='checkbox'
                                                        id={Math.random().toString().slice(2, 12)}
                                                        label={curElem.create_name}
                                                        checked={curElem.create === '1'}
                                                        onChange={(e) => InputEvent(e.target.checked, elem.page_id, curElem.id, curElem.create_name)}
                                                        disabled={UserData.role.name.toLowerCase() !== 'admin'}
                                                    />
                                                    <Form.Check
                                                        type='checkbox'
                                                        id={Math.random().toString().slice(2, 12)}
                                                        label={curElem.update_name}
                                                        checked={curElem.update === '1'}
                                                        onChange={(e) => InputEvent(e.target.checked, elem.page_id, curElem.id, curElem.update_name)}
                                                        disabled={UserData.role.name.toLowerCase() !== 'admin'}

                                                    />
                                                    <Form.Check
                                                        type='checkbox'
                                                        id={Math.random().toString().slice(2, 12)}
                                                        label={curElem.delete_name}
                                                        checked={curElem.delete === '1'}
                                                        onChange={(e) => InputEvent(e.target.checked, elem.page_id, curElem.id, curElem.delete_name)}
                                                        disabled={UserData.role.name.toLowerCase() !== 'admin'}
                                                    />

                                                </td>
                                            )
                                        })}
                                    </tr>
                                )
                            })}
                        </tbody>
                    </Table>
                </div>
            </motion.div>
            {loader && <Spinner />}
        </>
    )

}

export default Premissions
