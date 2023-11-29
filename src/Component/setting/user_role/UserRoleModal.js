import React, { useLayoutEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import { toast } from "react-hot-toast";
import Spinner from "../../common/Spinner";
import { Table } from "react-bootstrap";
import { Switch } from "@mui/material";
import { customAxios } from "../../../service/CreateApi";
import { alphSpaceFormat } from "../../common/RegaulrExp";

function UserRoleModal({ data, getuserRole, permission }) {
    const [show, setShow] = useState(false);
    const [isLoading, setisLoading] = useState(false);
    const [name, setName] = useState("")
    const [error, seterror] = useState('');
    const [Error, setError] = useState([]);
    const [page, setPage] = useState([])
    const [id, setId] = useState("");

    // modal show function
    const handleShow = () => {
        setShow(true);
    };

    // modal close function
    const handleClose = (e) => {
        e.preventDefault();
        setShow(false);
        setName("")
        seterror('');
        setError([]);
        setId("")
    };

    // onchange function
    const InputEvent = (e) => {
        let { value } = e.target;

        setName(value)
    };

    useLayoutEffect(() => {
        if (data) {
            setId(data._id)
        }
        if (show) {
            getPageData()
        }

        // eslint-disable-next-line
    }, [show])

    // form validation
    const handlenameValidate = () => {
        if (!name) {
            seterror("User role is a required field.");
        } else if (!name.trim() || !name.match(alphSpaceFormat)) {
            seterror("User role name must be an alphabet and space only.");
        } else {
            seterror("");
        }
    };

    // get page name deatil
    const getPageData = async () => {
        try {
            setisLoading(true)
            let url = ""
            if (id) {
                url = `/role/${id}`
            } else {
                url = '/role/static'
            }
            const res = await customAxios().get(url)
            if (res.data.success) {
                if (id) {
                    let data = res.data.data.map((val) => {
                        return val.permissions
                    })
                    setPage(data)
                    setName(res.data.data[0].name)
                    setId(res.data.data[0]._id)
                } else {
                    setPage(res.data.data)
                }
            }
        } catch (error) {
            if (!error.response) {
                toast.error(error.message)
            } else {
                if (error.response.data.message) {
                    toast.error(error.response.data.message)
                }
            }
        } finally {
            setisLoading(false)
        }
    }

    // submit data function
    const handleSubmit = (e) => {
        e.preventDefault();
        handlenameValidate();
        setError([])
        if (name && !error) {
            let url = "";
            if (id) {
                url = customAxios().put(`/role/${id}`, { name: name.charAt(0).toUpperCase() + name.slice(1), permissions: page })
            } else {
                url = customAxios().post('/role/', { name: name.charAt(0).toUpperCase() + name.slice(1), permissions: page })
            }
            setisLoading(true)
            url.then((response) => {
                if (response.data.success) {
                    toast.success(response.data.message)
                    setShow(false);
                    getuserRole();
                    setName("")
                    setPage([])
                    setId("")
                }
            }).catch((error) => {
                if (!error.response) {
                    toast.error(error.message);
                } else {
                    if (error.response.data.message) {
                        toast.error(error.response.data.message)
                    } else {
                        setError(error.response.data.error);
                    }
                }
            }).finally(() => setisLoading(false))
        }
    };

    const handleChange = (e, id, name) => {
        const changeData = page.map((val) => {
            if (val.menuId === id) {
                return { ...val, [name]: e.target.checked === true ? 1 : 0 }
            }
            return val
        })
        setPage(changeData)
    }

    return (
        <>
            {data ? <i className="fa-solid fa-pen-to-square" onClick={handleShow} ></i> :
                permission && permission.permissions.create === 1 &&
                <button className="btn btn-gradient-primary btn-rounded btn-fw text-center" onClick={handleShow} ><i className="fa-solid fa-plus"></i>&nbsp;Add</button>
            }
            <Modal show={show} animation={true} size="lg" aria-labelledby="example-modal-sizes-title-sm" className="department-modal user-modal" centered>
                <Modal.Header className="small-modal">
                    <Modal.Title>{data ? "Edit User Role" : "Add User Role"}</Modal.Title>
                    <p className="close-modal" onClick={handleClose}>
                        <i className="fa-solid fa-xmark"></i>
                    </p>
                </Modal.Header>
                <Modal.Body id="modal-content">
                    <div className="grid-margin stretch-card inner-pages mb-lg-0">
                        <div className="card">
                            <div className="card-body">
                                <form className="forms-sample row">
                                    <div className="form-group col-12 ">
                                        <label htmlFor="1">User Role</label>
                                        <input type="text" className="form-control text-capitalize" id="1" placeholder="Enter user role" name="name" value={name} onChange={InputEvent} onBlur={handlenameValidate} />
                                        {error && (<small id="emailHelp" className="form-text error">{error}</small>)}
                                    </div>
                                    <Table className="col-12" >
                                        <thead className='mt-3'>
                                            <tr>
                                                <th className="pl-3">Module Permission</th>
                                                <th className="pl-4">List</th>
                                                <th className="pl-4">Create</th>
                                                <th className="pl-4">Update</th>
                                                <th className="pl-4">Delete</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {page.map((val) => {
                                                return (
                                                    <tr key={val.menuId}>
                                                        <td className="">{val.name}</td>
                                                        <td className=""><Switch id={val.menuId} checked={val.list === 1 ? true : false} onChange={(e) => handleChange(e, val.menuId, "list")} /></td>
                                                        <td className=""><Switch id={val.menuId} checked={val.create === 1 ? true : false} onChange={(e) => handleChange(e, val.menuId, "create")} /></td>
                                                        <td className=""><Switch id={val.menuId} checked={val.update === 1 ? true : false} onChange={(e) => handleChange(e, val.menuId, "update")} /></td>
                                                        <td className=""><Switch id={val.menuId} checked={val.delete === 1 ? true : false} onChange={(e) => handleChange(e, val.menuId, "delete")} /></td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </Table>
                                    {Error.length !== 0 &&
                                        <ol>
                                            {Error.map((val) => {
                                                return <li className="error" key={val} >{val}</li>
                                            })}
                                        </ol>}
                                    <div className="col-12">
                                        <div className="d-flex justify-content-center modal-button">
                                            <button type="submit" className="btn btn-gradient-primary mr-2" onClick={handleSubmit}> {data ? "Update" : "Save"} </button>
                                            <button className="btn btn-light" onClick={handleClose}>Cancel</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    {isLoading && <Spinner />}
                </Modal.Body>
            </Modal>
        </>
    );
}

export default UserRoleModal;
