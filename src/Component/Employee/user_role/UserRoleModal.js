import axios from "axios";
import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import { toast } from "react-toastify";
import Spinner from "../../common/Spinner";
import GlobalPageRedirect from "../../auth_context/GlobalPageRedirect";
import { useEffect } from "react";
import { Table } from "react-bootstrap";
import { Switch } from "@mui/material";
import { GetLocalStorage } from "../../../service/StoreLocalStorage";

function UserRoleModal({ data, getuserRole, user, accessData, records }) {
    const [show, setShow] = useState(false);
    const [loader, setloader] = useState(false);
    const [list, setList] = useState({
        name: "",
    });
    const [error, seterror] = useState('');
    const [Error, setError] = useState([]);
    const [page, setPage] = useState([])
    const [id, setId] = useState("");
    let toggleButton = false;

    let { getCommonApi } = GlobalPageRedirect();

    // modal show function
    const handleShow = () => {
        if (data) {
            setList({
                name: data.name,
            });
            setId(data.id);
        }
        setShow(true);
    };

    // modal close function
    const handleClose = (e) => {
        e.preventDefault();
        setShow(false);
        setList({
            name: "",
        });
        seterror('');
    };

    // onchange function
    const InputEvent = (e) => {
        let { name, value } = e.target;

        setList({ ...list, [name]: value });
    };

    useEffect(() => {
        if (show) {
            getPageData()
        }
        // eslint-disable-next-line
    }, [show])

    // form validation
    const handlenameValidate = () => {
        let msg = "";
        if (!list.name) {
            seterror("User role is required.");
            msg = "error";
        } else if (!list.name.trim() || !list.name.match(/^[A-Za-z ]+$/)) {
            seterror("Please enter a valid user role.");
            msg = "error";
        } else if (list.name.match(/^[A-Za-z ]+$/)) {
            let temp = records.findIndex((val) => {
                return val.name.trim().toLowerCase() === list.name.trim().toLowerCase();
            });
            if (temp === -1 || (data && data.name.toLowerCase() === list.name.toLowerCase())) {
                seterror("");
                msg = "";
            } else {
                seterror("The user role is already exists.");
                msg = "error";
            }
        } else {
            seterror("");
            msg = "";
        }
        return msg;
    };


    // get page name deatil
    const getPageData = async () => {
        try {
            setloader(true)
            let token = GetLocalStorage('token');
            const request = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
            }
            const res = await axios.get(`${process.env.REACT_APP_API_KEY}/page/list`, request)
            if (res.data.success) {
                let data = res.data.data.map(element => {
                    return { name: element.name, id: element.id, view: "0", create: "0", update: "0", delete: "0" }
                });
                setPage(data)
            }
        } catch (error) {
            console.log(error, "<<< === user role page  get api")
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
            setloader(false)
        }
    }

    // submit data function
    const handleSubmit = (e) => {
        e.preventDefault();
        const errortoggle = handlenameValidate();
        setError([])
        if (!errortoggle) {
            if (id) {
                setloader(true);
                // data edit api call
                let token = GetLocalStorage("token");
                // header define
                const request = {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                };
                axios.post(`${process.env.REACT_APP_API_KEY}/role/update`, { name: list.name.charAt(0).toUpperCase() + list.name.slice(1), id }, request).then((data) => {
                    if (data.data.success) {
                        setloader(false);
                        toast.success("Successfully edited a user role.");
                        setShow(false);
                        getuserRole();
                        setList({
                            name: "",
                        })
                        setId("")
                    } else {
                        setloader(false);
                        toast.error(data.data.message.name[0]);
                    }
                }).catch((error) => {
                    setloader(false);
                    console.log("🚀 ~ file: ~ error:", error.response.data.message);
                    if (error.response.status === 401) {
                        getCommonApi();
                    } else {
                        if (error.response.data.message) {
                            toast.error(error.response.data.message)
                        } else {
                            if (typeof error.response.data.error === "string") {
                                toast.error(error.response.data.error)
                            }
                            else {
                                setError(error.response.data.error);
                            }
                        }
                    }
                });
            } else {
                setloader(true)
                // data add api call
                let token = GetLocalStorage("token");
                const request = {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                };
                axios.post(`${process.env.REACT_APP_API_KEY}/role/add`, { name: list.name.charAt(0).toUpperCase() + list.name.slice(1) }, request).then((data) => {
                    if (data.data.success) {
                        setloader(false);
                        toast.success("Successfully added a user role.");
                        setShow(false);
                        getuserRole();
                        setList({
                            name: "",
                        })
                    } else {
                        setloader(false);
                        toast.error(data.data.message.name[0]);
                    }
                }).catch((error) => {
                    setloader(false);
                    console.log("🚀 ~ file: ~ error:", error.response.data.message);
                    if (error.response.status === 401) {
                        getCommonApi();
                    } else {
                        if (error.response.data.message) {
                            toast.error(error.response.data.message)
                        } else {
                            if (typeof error.response.data.error === "string") {
                                toast.error(error.response.data.error)
                            } else {
                                setError(error.response.data.error)
                            }
                        }
                    }
                });
            }
        }
    };

    // button toggle diable or not
    if (user.toLowerCase() !== "admin") {
        if (accessData.length !== 0 && accessData[0].create === "1") {
            toggleButton = false;
        } else {
            toggleButton = true;
        }
    } else {
        toggleButton = false;
    }

    const handleChange = (e, id, name) => {
        let changeData = page.map((val) => {
            if (val.id === id) {
                return { ...val, [name]: e.target.checked === true ? "1" : "0" }
            }
            return val
        })
        setPage(changeData)
    }

    return (
        <>
            {data ? <i className="fa-solid fa-pen-to-square" onClick={handleShow} ></i> : 
                <button className="btn btn-gradient-primary btn-rounded btn-fw text-center" onClick={handleShow} disabled={toggleButton}><i className="fa-solid fa-plus"></i>&nbsp;Add</button>
            }
            <Modal show={show} animation={true} size="lg" aria-labelledby="example-modal-sizes-title-sm" className="small-modal department-modal user-modal" centered>
                <Modal.Header className="small-modal">
                    <Modal.Title>{data ? "Edit User Role" : "Add User Role"}</Modal.Title>
                    <p className="close-modal" onClick={handleClose}>
                        <i className="fa-solid fa-xmark"></i>
                    </p>
                </Modal.Header>
                <Modal.Body>
                    <div className="grid-margin stretch-card inner-pages mb-lg-0">
                        <div className="card">
                            <div className="card-body">
                                <form className="forms-sample row">
                                    <div className="form-group col-12 ">
                                        <label htmlFor="1">User Role</label>
                                        <input type="text" className="form-control text-capitalize" id="1" placeholder="Enter user role" name="name" value={list.name} onChange={InputEvent} onKeyUp={handlenameValidate} />
                                        {error && (<small id="emailHelp" className="form-text error">{error}</small>)}
                                    </div>
                                    <Table className="col-12" >
                                        <thead className='mt-3'>
                                            <tr>
                                                <th className="pl-3">Module Permission</th>
                                                <th className="pl-4">View</th>
                                                <th className="pl-4">Create</th>
                                                <th className="pl-4">Update</th>
                                                <th className="pl-4">Delete</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {page.map((val) => {
                                                return (
                                                    <tr key={val.id}>
                                                        <td className="">{val.name}</td>
                                                        <td className=""><Switch id={val.id} checked={val.view === "1" ? true : false} onChange={(e) => handleChange(e, val.id, "view")} /></td>
                                                        <td className=""><Switch id={val.id} checked={val.create === "1" ? true : false} onChange={(e) => handleChange(e, val.id, "create")} /></td>
                                                        <td className=""><Switch id={val.id} checked={val.update === "1" ? true : false} onChange={(e) => handleChange(e, val.id, "update")} /></td>
                                                        <td className=""><Switch id={val.id} checked={val.delete === "1" ? true : false} onChange={(e) => handleChange(e, val.id, "delete")} /></td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </Table>
                                    <ol>
                                        {Error.map((val) => {
                                            return <li className="error" key={val} >{val}</li>
                                        })}
                                    </ol>
                                    <div className="col-12">
                                        <div className="d-flex justify-content-center modal-button">
                                            <button type="submit" className="btn btn-gradient-primary mr-2" onClick={handleSubmit}> {data ? "Update" : "Submit"} </button>
                                            <button className="btn btn-light" onClick={handleClose}>Cancel</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    {loader && <Spinner />}
                </Modal.Body>
            </Modal>
        </>
    );
}

export default UserRoleModal;
