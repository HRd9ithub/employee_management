import Modal from 'react-bootstrap/Modal';
import React from 'react'
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useContext } from 'react';
import { AppProvider } from '../context/RouteContext';
import axios from 'axios';
import GlobalPageRedirect from '../auth_context/GlobalPageRedirect';
import Spinner from '../common/Spinner';
import { GetLocalStorage } from '../../service/StoreLocalStorage';

const PageModalComponent = (props) => {
    let { data, getPageData, accessData, user, records } = props;
    const [show, setShow] = useState(false);
    const [loader, setloader] = useState(false);
    const [error, seterror] = useState([]);
    let toggleButton = false
    const [list, setList] = useState({
        name: '',
        error: '',
        id: ''
    });

    let { getPage } = useContext(AppProvider)

    let { getCommonApi } = GlobalPageRedirect();

    // modal show function
    const handleShow = () => {
        if (data) {
            setList({
                name: data.name,
                id: data.id
            })
        }
        setShow(true)
    }

    // modal close function
    const handleClose = (e) => {
        e.preventDefault();
        setShow(false)
        setList({
            name: '',
            error: ''
        });
    }

    // onchange function
    const InputEvent = (e) => {
        let value = e.target.value;

        setList({ ...list, name: value })
    }

    // form validation function
    const HandleValidate = () => {
        if (!list.name) {
            setList({ ...list, error: 'Please enter page name.' })
        } else if (!list.name.trim() || !list.name.match(/^[A-Za-z]+$/)) {
            setList({ ...list, error: 'Please enter a valid page name.' })
        } else if (list.name.match(/^[A-Za-z]+$/)) {
            let temp = records.findIndex((val) => {
                return val.name.trim().toLowerCase() === list.name.trim().toLowerCase()
            });
            if (temp === -1 || (data && data.name.toLowerCase() === list.name.toLowerCase())) {
                setList({ ...list, error: '' })
            } else {
                setList({ ...list, error: 'Page name already exists.' })
            }
        }
    }

    // submit function
    const HandleSubmit = (e) => {
        e.preventDefault();
        HandleValidate();
        seterror([])

        if (!list.name) {
            return false;
        } else if (list.error) {
            return false;
        } else {
            setloader(true);
            if (list.id) {
                let token = GetLocalStorage('token');
                const request = {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                }
                // edit api call
                axios.post(`${process.env.REACT_APP_API_KEY}/page/update`, { name: list.name.charAt(0).toUpperCase() + list.name.slice(1), id: list.id }, request)
                    .then(data => {
                        if (data.data.success) {
                            toast.success('Successfully Edited a page name.');
                            setloader(false);
                            setShow(false)
                            getPageData()
                            getPage("page")
                            setList({
                                name: '',
                                error: '',
                                id: ''
                            })
                        } else {
                            setloader(false);
                            setList({ ...list, error: data.data.message.name[0] })
                        }
                    }).catch((error) => {
                        setloader(false);
                        console.log('PageModalComponent page update api === >>> ', error)
                        if (error.response.status === 401) {
                            getCommonApi();
                          } else {
                            if (error.response.data.message) {
                              toast.error(error.response.data.message)
                            } else {
                              if (typeof error.response.data.error === "string") {
                                toast.error(error.response.data.error)
                              }else{
                                seterror(error.response.data.error)
                              }
                            }
                          }
                    })
            } else {
                let token = GetLocalStorage('token');
                const request = {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    }
                }
                // add data api call
                axios.post(`${process.env.REACT_APP_API_KEY}/page/add`, { name: list.name.charAt(0).toUpperCase() + list.name.slice(1) }, request)
                    .then(data => {
                        if (data.data.success) {
                            toast.success('Successfully added a new page name.')
                            getPageData()
                            setShow(false)
                            setloader(false);
                            getPage("page")
                            setList({
                                name: '',
                                error: '',
                                id: ''
                            })
                        } else {
                            setloader(false);
                            setList({ ...list, error: data.data.message.name[0] })
                        }
                    }).catch((error) => {
                        console.log('PageModalComponent page update api === >>> ', error)
                        setloader(false);
                        if (error.response.status === 401) {
                            getCommonApi();
                        } else {
                            if (error.response.data.message) {
                                toast.error(error.response.data.message)
                            } else {
                                if (typeof error.response.data.error === "string") {
                                    toast.error(error.response.data.error)
                                }else{
                                    seterror(error.response.data.error)
                                }
                            }
                        }
                    })
            }
        }

    }

    // button toggle diable or not
    if (user.toLowerCase() !== 'admin') {
        if (accessData.length !== 0 && accessData[0].create === "1") {
            toggleButton = false
        } else {
            toggleButton = true
        }
    } else {
        toggleButton = false
    }

    return (
        <>
            {data ? <>
                <button data-tag="allowRowEvents" data-action="edit" className='action-icon edit' onClick={handleShow} disabled={(user && user.toLowerCase() !== 'admin') && (accessData.length !== 0 && accessData[0].update === "0")} >
                    <i className="fa-solid fa-pencil"></i>
                </button>
            </>
                :
                <>
                    <button
                        className='btn btn-gradient-primary btn-rounded btn-fw text-center' onClick={handleShow} disabled={toggleButton}>
                        <i className="fa-solid fa-plus" ></i>&nbsp;Add
                    </button>
                </>}
            <Modal show={show} animation={true} size="md" aria-labelledby="example-modal-sizes-title-sm" className='small-modal department-modal' centered>
                <Modal.Header className='small-modal'>
                    <Modal.Title>{data ? 'Edit Page' : 'Add Page'}
                    </Modal.Title>
                    <p className='close-modal' onClick={handleClose}><i className="fa-solid fa-xmark"></i></p>
                </Modal.Header>
                <Modal.Body>
                    <div className=" grid-margin stretch-card inner-pages mb-lg-0">
                        <div className="card">
                            <div className="card-body">
                                <form className="forms-sample">
                                    <div className="form-group">
                                        <label htmlFor="1" className='mt-3'> Page</label>
                                        <input type="text" className="form-control" id="1" placeholder="Enter page name" name='name' value={list.name} onChange={InputEvent} onKeyUp={HandleValidate} />
                                        {list.error && <small id="emailHelp" className="form-text error">{list.error}</small>}
                                    </div>
                                    <ol>
                                        {error.map((val) => {
                                            return <li className='error' key={val} > {val} </li>
                                        })}
                                    </ol>
                                    <div className='d-flex justify-content-end modal-button'>
                                        <button type="submit" className="btn btn-gradient-primary mr-2" onClick={HandleSubmit}>{data ? 'Update' : 'Submit'}</button>
                                        <button className="btn btn-light" onClick={handleClose}>Cancel</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    {loader && <Spinner />}
                </Modal.Body>
            </Modal>
        </>
    )
}

export default PageModalComponent
