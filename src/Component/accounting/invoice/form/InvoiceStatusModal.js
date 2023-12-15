import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

function InvoiceStatusModal({ data, getProject, permission, records }) {
    const [show, setShow] = useState(false);
    const [name, setName] = useState('');
    const [error, seterror] = useState('');
    const [id, setId] = useState('')
    const [isLoading, setisLoading] = useState(false)
    const [Error, setError] = useState("");

    // modal show function
    const handleShow = () => {
        if (data) {
            setName(data.name)
            setId(data._id);
        }
        setShow(true)
    }

    // modal close function
    const handleClose = (e) => {
        e.preventDefault();
        setShow(false)
        setName('');
        seterror('');
        setError("")
        setId('')
    }



    return (
        <>
            {data ? <i className="fa-solid fa-pen-to-square" onClick={handleShow} ></i> :
                <button
                    className='btn btn-gradient-primary btn-rounded btn-fw text-center ' onClick={handleShow} >
                    <i className="fa-solid fa-plus" ></i>&nbsp;Add
                </button >
            }
            {/* Department Name * */}
            <Modal show={show} animation={true} size="md" aria-labelledby="example-modal-sizes-title-sm" className='department-modal' centered>
                <Modal.Header className='small-modal'>
                    <Modal.Title>Change Status</Modal.Title>
                    <p className='close-modal' onClick={handleClose}><i className="fa-solid fa-xmark"></i></p>
                </Modal.Header>
                <Modal.Body>
                    <div className=" grid-margin stretch-card inner-pages mb-lg-0">
                        <div className="card">
                            <div className="card-body">
                                <table className="w-100">
                                    <tbody>
                                        <tr>
                                            <td>
                                                <p className="text-left mb-0">Invoice No#</p>
                                            </td>
                                            <td>
                                                <p className="text-right mb-0">4589362</p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <p className="text-left mb-0">Bill To:</p>
                                            </td>
                                            <td>
                                                <p className="text-right mb-0">Jd Patel</p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <p className="text-left mb-0">Total Amount:</p>
                                            </td>
                                            <td>
                                                <p className="text-right mb-0">$62.00</p>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <hr/>
                                <form className="forms-sample">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label htmlFor="exampleInputfname" className="mt-2">Amount Received</label>
                                                <input type="number" className="form-control" id="exampleInputfname" placeholder="Enter Received Amount" value={name} />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label htmlFor="exampleInputfname" className="mt-2">Payment Date</label>
                                                <div className="position-relative">
                                                    <input type="date" className='form-control' name='issue_date' />
                                                    <CalendarMonthIcon className='invoice-calendar-icon' />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label htmlFor="exampleInputfname" className="mt-2">Payment Method</label>
                                                <input type="text" className="form-control" id="exampleInputfname" placeholder="" disabled value="Bank Account" />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label htmlFor="exampleInputfname" className="mt-2">Payment Status</label>
                                                <select className="form-control mb-0" id="client">
                                                    <option value=''>Select Status</option>
                                                    <option value='paid'>Paid</option>
                                                    <option value='unpaid'>Un-paid</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="form-group">
                                                <label htmlFor="exampleInputfname" className="mt-2">Additional Notes</label>
                                                <textarea type="text" autoComplete='off' rows={2} cols={10} className="form-control" placeholder="Write Here..." id="note" name='note'/>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='d-flex justify-content-center modal-button'>
                                        <button type="submit" className="btn btn-gradient-primary mr-2">{data ? 'Update' : 'Save'}</button>
                                        <button className="btn btn-light" onClick={handleClose}>Cancel</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
}

export default InvoiceStatusModal