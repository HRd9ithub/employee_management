import React, { useRef, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import moment from 'moment';
import Spinner from '../../../common/Spinner';
import { customAxios } from '../../../../service/CreateApi';
import toast from 'react-hot-toast';

function InvoiceStatusModal({ data, fetchInvoice }) {
    const [show, setShow] = useState(false);
    const [record, setRecord] = useState({
        amount_received: "",
        payment_date: moment(new Date()).format("YYYY-MM-DD"),
        payment_method: "Bank Account",
        status: "",
        note: ""
    });
    const [isLoading, setisLoading] = useState(false)

    const dateRef = useRef(null);

    // modal show function
    const handleShow = () => {
        if (data.status === "Unpaid" && !data.deleteAt) {
            setShow(true)
        }
    }

    // modal close function
    const handleClose = (e) => {
        e.preventDefault();
        setShow(false)
        setRecord({
            amount_received: "",
            payment_date: moment(new Date()).format("YYYY-MM-DD"),
            payment_method: "Bank Account",
            status: "",
            note: ""
        })
    }

    const handleChange = (event) => {
        setRecord({ ...record, note: event.target.value })
    }

    // submit function
    const handleSubmit = (e) => {
        e.preventDefault()

        const { payment_method, payment_date, note } = record;

        setisLoading(true);
        customAxios().patch(`/invoice/status/${data._id}`, {
            payment_date,
            payment_method,
            status: "Paid",
            payment_note: note
        }).then(data => {
            if (data.data.success) {
                toast.success(data.data.message)
                fetchInvoice();
                setShow(false);
                setisLoading(false);
                setRecord({
                    amount_received: "",
                    payment_date: moment(new Date()).format("YYYY-MM-DD"),
                    payment_method: "Bank Account",
                    status: "",
                    note: ""
                })
            }
        }).catch((error) => {
            setisLoading(false);
            if (!error.response) {
                toast.error(error.message);
            } else {
                if (error.response.data.message) {
                    toast.error(error.response.data.message)
                }
            }
        })
    }


    return (
        <>
            {data &&
                <div >
                    <span className={data.deleteAt ? "Deleted-invoice invoice-status" : data.status + "-invoice invoice-status"} onClick={handleShow}>{data.deleteAt ? "Deleted" : data.status}</span>
                    <br />
                    {data.status === "Unpaid" && data.due_date && !data.deleteAt && <label className="mb-0 mt-1" htmlFor="due-date">Due on {moment(data.due_date).format("DD MMM YYYY")}</label>}
                </div>
            }
            {/* Department Name * */}
            <Modal show={show} animation={true} size="md" aria-labelledby="example-modal-sizes-title-sm" className='department-modal' centered>
                <Modal.Header className='small-modal'>
                    <Modal.Title>Update Status</Modal.Title>
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
                                                <p className="text-right mb-0">{data?.invoiceId}</p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <p className="text-left mb-0">Bill To:</p>
                                            </td>
                                            <td>
                                                <p className="text-right mb-0">{data?.invoiceClient?.name}</p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <p className="text-left mb-0">Total Amount ({data?.currency}):</p>
                                            </td>
                                            <td>
                                                <p className="text-right mb-0">{data?.totalAmount}</p>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <hr />
                                <form className="forms-sample">
                                    <div className="row">
                                        {/* <div className="col-md-6">
                                            <div className="form-group">
                                                <label htmlFor="amount_received" className="mt-2">Amount Received</label>
                                                <input type="number" className="form-control" name="amount_received" id="amount_received" placeholder="Enter Received Amount" value={record.amount_received} />
                                            </div>
                                        </div> */}
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label htmlFor="date" className="mt-2">Payment Date</label>
                                                <div className="position-relative" onClick={() => { dateRef.current.showPicker(); }}>
                                                    <input type="date" id='date' ref={dateRef} className='form-control' name='payment_date' disabled value={record.payment_date} />
                                                    <CalendarMonthIcon className='invoice-calendar-icon' />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label htmlFor="payment_method" className="mt-2">Payment Method</label>
                                                <input type="text" className="form-control" name="payment_method" id="payment_method" disabled value={record.payment_method} />
                                            </div>
                                        </div>
                                        {/* <div className="col-md-6">
                                            <div className="form-group">
                                                <label htmlFor="staus" className="mt-2">Payment Status</label>
                                                <select className="form-control mb-0" id="status" name="status" value={record.status}>
                                                    <option value='Paid'>Paid</option>
                                                    <option value='Unpaid'>Un-paid</option>
                                                </select>
                                            </div>
                                        </div> */}
                                        <div className="col-12">
                                            <div className="form-group">
                                                <label htmlFor="note" className="mt-2">Additional Notes</label>
                                                <textarea type="text" autoComplete='off' rows={4} cols={10} className="form-control" id="note" name='note' value={record.note} onChange={handleChange} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className='d-flex justify-content-center modal-button'>
                                        <button type="submit" className="btn btn-gradient-primary mr-2" onClick={handleSubmit}>Pay</button>
                                        <button className="btn btn-light" onClick={handleClose}>Cancel</button>
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

export default InvoiceStatusModal