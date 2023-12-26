/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useMemo, useRef, useState } from 'react'
import { customAxios } from '../../../../service/CreateApi';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Spinner from '../../../common/Spinner';
import Error500 from '../../../error_pages/Error500';
import { motion } from "framer-motion";
import moment from 'moment';
import { useReactToPrint } from 'react-to-print';
import Swal from 'sweetalert2';
import Error403 from '../../../error_pages/Error403';
import { Card, Dropdown } from 'react-bootstrap';
import convertNumberFormat from '../../../../service/NumberFormat';
import Accordion from 'react-bootstrap/Accordion';
import ReceiptIcon from '@mui/icons-material/Receipt';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AccountFormComponent from './AccountFormComponent';
import axios from 'axios';
import fileDownload from 'js-file-download';

const InvoicePreviewComponent = () => {
    const [isLoading, setisLoading] = useState(false);
    const [serverError, setServerError] = useState(false);
    const [invoiceDetail, setInvoiceDetail] = useState({});
    const [clientData, setClientData] = useState("");
    const [invoiceProvider, setinvoiceProvider] = useState("");
    const [bankDetail, setbankDetail] = useState("");
    const [permission, setpermission] = useState("");
    const [permissionToggle, setPermissionToggle] = useState(true);

    const Navigate = useNavigate();
    const componentRef = useRef();

    const { id } = useParams();

    /*  -------------------------------
        get data in database for account
    ----------------------------------- */

    const getSingleAccountDetail = async () => {
        setServerError(false)
        setisLoading(true);

        customAxios().get(`invoice/account/${id}`).then((res) => {
            if (res.data.success) {
                const { data } = res.data;
                if (data) {
                    setbankDetail(data);
                }
                setisLoading(false);
            }
        }).catch((error) => {
            setisLoading(false);
            if (!error.response) {
                setServerError(true)
                toast.error(error.message);
            } else {
                if (error.response.status === 500) {
                    setServerError(true)
                }
                if (error.response.data.message) {
                    toast.error(error.response.data.message)
                }
            }
        });
    }

    /*  -------------------------------
        get data in database for invoice
    ----------------------------------- */

    const getInvoiceDetail = async () => {
        setServerError(false)
        setisLoading(true);
        setPermissionToggle(true)

        customAxios().get(`invoice/${id}`).then((res) => {
            if (res.data.success) {
                const { data, permissions } = res.data;
                if (data.length !== 0) {
                    setInvoiceDetail(...data);
                    setClientData(...data[0].invoiceClient);
                    setinvoiceProvider(...data[0].invoiceProvider);
                }
                setpermission(permissions);
                setisLoading(false);

            }
        }).catch((error) => {
            setisLoading(false);
            if (!error.response) {
                setServerError(true)
                toast.error(error.message);
            } else {
                if (error.response.status === 500) {
                    setServerError(true)
                }
                if (error.response.data.message) {
                    toast.error(error.response.data.message)
                }
            }
        }).finally(() => setPermissionToggle(false))
    }

    useEffect(() => {
        getInvoiceDetail();
        getSingleAccountDetail();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    /*--------------------
         Delete invoice funcation
    ----------------------*/
    const deleteInvoice = () => {
        Swal.fire({
            title: "Delete Invoice",
            text: "Are you sure you want to delete?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#1bcfb4",
            cancelButtonColor: "#d33",
            confirmButtonText: "Delete",
            cancelButtonText: "Cancel",
            width: "450px",
        }).then(async (result) => {
            if (result.isConfirmed) {
                setisLoading(true);
                const res = await customAxios().delete(`/invoice/${id}`);
                if (res.data.success) {
                    Navigate("/invoice");
                    setisLoading(false);
                    toast.success(res.data.message);
                }
            }
        }).catch((error) => {
            setisLoading(false);
            if (!error.response) {
                toast.error(error.message)
            } else {
                if (error.response.data.message) {
                    toast.error(error.response.data.message)
                }
            }
        })
    }

    /* -------------------
        INVOICE DOWNLOAD
    ----------------------*/

    const invoiceDownload = async () => {
        setisLoading(true)
        axios.get(`${process.env.REACT_APP_API_KEY}/invoice/invoice-download?id=${id}`, {
            responseType: 'blob',
        }).then((res) => {
            fileDownload(res.data, "invoice.pdf");
            toast.success("Download successfully.")
            setisLoading(false)
        }).catch((error) => {
            setisLoading(false)
            if (!error.response || !error) {
                toast.error(error?.message || "something went wrong.");
            } else if (error.response.data.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error(error.response.statusText);
            }
        })
    }

    /* -------------------
        INVOICE PRINT
    ----------------------*/

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: clientData.first_name + "-invoice.pdf"
    })


    /*---------------------------
        table total calacution
    ----------------------------*/

    const TOTALSGST = useMemo(() => {
        return parseFloat(invoiceDetail.productDetails?.reduce((total, cur) => {
            return total + (invoiceDetail.gstType === "CGST & SGST" && parseFloat(cur.SGST))
        }, 0)).toFixed(2)
    }, [invoiceDetail.productDetails])

    const TOTALIGST = useMemo(() => {
        return parseFloat(invoiceDetail.productDetails?.reduce((total, cur) => {
            return total + (invoiceDetail.gstType === "IGST" && parseFloat(cur.IGST))
        }, 0)).toFixed(2)
    }, [invoiceDetail.productDetails])


    if (isLoading) {
        return <Spinner />
    } else if (serverError) {
        return <Error500 />
    } else if ((!permission || permission.name.toLowerCase() !== "admin") && !permissionToggle) {
        return <Error403 />;
    }


    return (
        <>
            <motion.div className="box" initial={{ opacity: 0, transform: "translateY(-20px)" }} animate={{ opacity: 1, transform: "translateY(0px)" }} transition={{ duration: 0.5 }}>
                <div className=" container-fluid py-4">
                    <div className="background-wrapper bg-white pt-4">
                        {/* ====================== breadcrumb */}
                        <div>
                            <div className='row justify-content-end align-items-center row-std m-0'>
                                <div className="col-12 col-sm-7 d-flex justify-content-between align-items-center">
                                    <div>
                                        <ul id="breadcrumb" className="mb-0">
                                            <li><NavLink to="/" className="ihome">Dashboard</NavLink></li>
                                            <li><NavLink to="/invoice" className="ibeaker"><i className="fa-solid fa-play"></i> &nbsp; Invoice</NavLink></li>
                                            <li><NavLink to="" className="ibeaker"><i className="fa-solid fa-play"></i> &nbsp; Preview</NavLink></li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="col-12 col-sm-5 d-flex justify-content-end" id="two">
                                    <Dropdown>
                                        <Dropdown.Toggle className="btn btn-gradient-primary btn-rounded btn-fw text-center dropdown-toggle" id="dropdown-basic">
                                            Action&nbsp; <i className="fa-solid fa-angle-down"></i>
                                        </Dropdown.Toggle>

                                        <Dropdown.Menu>
                                            <Dropdown.Item className="dropdown-item" onClick={() => Navigate('/invoice')}>Show All Invoice</Dropdown.Item>
                                            <Dropdown.Divider />
                                            <Dropdown.Item className="dropdown-item" onClick={() => Navigate('/invoice/create')}>Create New Invoice</Dropdown.Item>
                                            <Dropdown.Divider />
                                            {invoiceDetail.status !== "Paid" && <><Dropdown.Item className="dropdown-item" onClick={() => Navigate(`/invoice/edit/${id}`)}>Edit Invoice</Dropdown.Item>
                                                <Dropdown.Divider /></>}
                                            <Dropdown.Item className="dropdown-item" onClick={() => Navigate(`/invoice/duplicate/${id}`)}>Duplicate Invoice</Dropdown.Item>
                                            <Dropdown.Divider />
                                            <Dropdown.Item className="dropdown-item" onClick={deleteInvoice}>Delete Invoice</Dropdown.Item>
                                            <Dropdown.Divider />
                                            <Dropdown.Item className="dropdown-item" onClick={handlePrint}>Print Invoice</Dropdown.Item>
                                            <Dropdown.Divider />
                                            <Dropdown.Item className="dropdown-item" onClick={invoiceDownload}>Download Invoice</Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                    <button type="button" className="btn btn-gradient-primary btn-rounded btn-fw text-center" onClick={() => Navigate("/invoice")}>
                                        <i className="fa-solid fa-arrow-left"></i>&nbsp;Back
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="m-4">
                            {/* invoice summary */}
                            <Accordion defaultActiveKey="0">
                                <Card>
                                    <Accordion.Toggle eventKey="0" className='card-header invoice-summary'>
                                        <h5 className="mb-0 btn">
                                            <ReceiptIcon className='my-0 mr-2' />
                                            <span>Invoice Summary</span>
                                        </h5>
                                        <KeyboardArrowDownIcon className='my-0' />
                                    </Accordion.Toggle>
                                    <Accordion.Collapse eventKey="0">
                                        <Card.Body className='summary-card-body'>
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <table className='w-100'>
                                                        <tbody>
                                                            <tr className='d-block mt-3'>
                                                                <td className="invoice-title-summary"><span >Invoice Number:</span></td>
                                                                <td><span className='invoice-value-summary'>{invoiceDetail.invoiceId}</span></td>
                                                            </tr>
                                                            <tr className='d-block mt-3'>
                                                                <td className="invoice-title-summary"><span >Invoice Date:</span></td>
                                                                <td><span className='invoice-value-summary'>{moment(invoiceDetail.issue_date).format("DD MMM YYYY")}</span></td>
                                                            </tr>
                                                            <tr className='d-block mt-3'>
                                                                <td className="invoice-title-summary"><span >Due Date:</span></td>
                                                                <td><span className='invoice-value-summary'>{invoiceDetail.due_date ? moment(invoiceDetail.due_date).format("DD MMM YYYY") : "Not Set"}</span></td>
                                                            </tr>
                                                            <tr className='d-block mt-3'>
                                                                <td className="invoice-title-summary"><span >Total Amount:</span></td>
                                                                <td><span className='invoice-value-summary'>{invoiceDetail.currency?.slice(6)} {convertNumberFormat(invoiceDetail.totalAmount)}</span></td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <div className="col-md-6">
                                                    <table className='w-100'>
                                                        <tbody>
                                                            <tr className='d-block mt-3'>
                                                                <td className="invoice-title-summary"><span >Billed To:</span></td>
                                                                <td><span className='invoice-value-summary'>{clientData.first_name?.concat(" ", clientData.last_name)}</span></td>
                                                            </tr>
                                                            <tr className='d-block mt-3'>
                                                                <td className="invoice-title-summary"><span >Phone:</span></td>
                                                                <td><span className='invoice-value-summary'>{clientData.phone}</span></td>
                                                            </tr>
                                                            <tr className='d-block mt-3'>
                                                                <td className="invoice-title-summary"><span >Address:</span></td>
                                                                <td><span className='invoice-value-summary'>{clientData.address?.concat(" ", clientData.state).concat(",", clientData.city).concat("-", clientData.postcode)}</span></td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Accordion.Collapse>
                                </Card>
                            </Accordion>
                            <div className="my-3" ref={componentRef}>
                                {/* invoice display */}
                                <div className="template-section">
                                    <div className="row justify-content-end align-items-center mt-2 template-head-section">
                                        <div className="col-md-12">
                                            <h4 className="template-heading mb-0">Invoice</h4>
                                        </div>
                                    </div>
                                    <div className="row align-items-center">
                                        <div className="col-md-6 col-sm-7 mt-4">
                                            <table className="invoice-details-table">
                                                <tbody>
                                                    <tr>
                                                        <td>Invoice No#</td>
                                                        <td className="text-black">{invoiceDetail.invoiceId}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Invoice Date</td>
                                                        <td className="text-black">{moment(invoiceDetail.issue_date).format("DD MMM YYYY")}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Due Date</td>
                                                        <td className="text-black">{invoiceDetail.due_date ? moment(invoiceDetail.due_date).format("DD MMM YYYY") : "Not Set"}</td>
                                                    </tr>
                                                    {invoiceDetail.hasOwnProperty("extra_field") &&
                                                        JSON.parse(invoiceDetail.extra_field).map((val, ind) => {
                                                            return (
                                                                <tr key={ind}>
                                                                    <td>{val.name}</td>
                                                                    <td className="text-black">{val.value}</td>
                                                                </tr>
                                                            )
                                                        })
                                                    }
                                                    <tr>
                                                        <td>Total Amount</td>
                                                        <td className="text-black">{invoiceDetail.currency?.slice(6)} {convertNumberFormat(invoiceDetail.totalAmount)}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="col-md-6 col-sm-5 mt-4">
                                            <div className="billby-image ml-auto">
                                                <img src="/Images/d9.png" alt="img" width="100%" height="auto" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mt-4">
                                            <div className="bill-by-to-section h-100">
                                                <h3>Billed By</h3>
                                                <h4>{invoiceProvider.first_name?.concat(" ", invoiceProvider.last_name)}</h4>
                                                <p className="mb-0">+91 {invoiceProvider.phone}</p>
                                                <p className="mb-0 text-truncate">{invoiceProvider.email}</p>
                                                {invoiceProvider.address && <p className="mb-0">{invoiceProvider.address?.concat(" ", invoiceProvider.state).concat(",", invoiceProvider.city).concat("-", invoiceProvider.postcode)}</p>}
                                            </div>
                                        </div>
                                        <div className="col-md-6 mt-4">
                                            <div className="bill-by-to-section h-100">
                                                <h3>Billed To</h3>
                                                <h4>{clientData.first_name?.concat(" ", clientData.last_name)}</h4>
                                                <p className="mb-0">+91 {clientData.phone}</p>
                                                <p className="mb-0 text-truncate">{clientData.email}</p>
                                                {clientData.address && <p className="mb-0">{clientData.address?.concat(" ", clientData.state).concat(",", clientData.city).concat("-", clientData.postcode)}</p>}
                                            </div>
                                        </div>
                                    </div>
                                    {/* product details table */}
                                    <div className="product-table mt-4">
                                        <table className='table'>
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Item Name</th>
                                                    {invoiceDetail.gstType && <th>GST</th>}
                                                    <th>Rate</th>
                                                    <th >Quantity</th>
                                                    {invoiceDetail.gstType === "IGST" && <th>IGST</th>}
                                                    {invoiceDetail.gstType === "CGST & SGST" && <th>CGST</th>}
                                                    {invoiceDetail.gstType === "CGST & SGST" && <th>SGST</th>}
                                                    <th>Amount({invoiceDetail.currency?.slice(6)})</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {invoiceDetail?.productDetails?.map((val, ind) => {
                                                    return (
                                                        <tr key={val._id}>
                                                            <td>{ind + 1}</td>
                                                            <td>{val.itemName}</td>
                                                            {invoiceDetail.gstType && <td>{val.GST}</td>}
                                                            <td>{val.rate}</td>
                                                            <td>{val.quantity}</td>
                                                            {invoiceDetail.gstType === "IGST" && <td>{val.IGST}</td>}
                                                            {invoiceDetail.gstType === "CGST & SGST" && <td>{val.CGST}</td>}
                                                            {invoiceDetail.gstType === "CGST & SGST" && <td>{val.SGST}</td>}
                                                            <td>{convertNumberFormat(val.amount)}</td>
                                                        </tr>
                                                    )
                                                })}
                                                <tr className='total-column'>
                                                    <td colSpan={invoiceDetail.gstType ? 5 : 4}>Total</td>
                                                    {invoiceDetail.gstType === "IGST" && <td>{invoiceDetail.currency?.slice(6)} {convertNumberFormat(TOTALIGST)}</td>}
                                                    {invoiceDetail.gstType === "CGST & SGST" && <td>{invoiceDetail.currency?.slice(6)} {convertNumberFormat(TOTALSGST)}</td>}
                                                    {invoiceDetail.gstType === "CGST & SGST" && <td>{invoiceDetail.currency?.slice(6)} {convertNumberFormat(TOTALSGST)}</td>}
                                                    <td>{invoiceDetail.currency?.slice(6)} {convertNumberFormat(invoiceDetail.totalAmount)}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    {/* bank details and addition details section */}
                                    <div className="extra-section">
                                        {(invoiceDetail.hasOwnProperty("attchmentFile") || bankDetail || invoiceDetail.signImage || invoiceDetail.hasOwnProperty("note")) &&
                                            <div className="row">
                                                {bankDetail &&
                                                    <div className="col-xl-5 col-lg-7 col-md-8 mt-4 bank-details">
                                                        <div className="bill-by-to-section h-100">
                                                            <h3>Bank Details</h3>
                                                            <table className="invoice-details-table">
                                                                <tbody>
                                                                    <tr>
                                                                        <td>Account Number</td>
                                                                        <td>{bankDetail.account_number}</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td>IFSC Code</td>
                                                                        <td>{bankDetail.ifsc_code}</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td>Bank Name</td>
                                                                        <td>{bankDetail.bank}</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td>Branch Name</td>
                                                                        <td>{bankDetail.branch_name}</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td>Name</td>
                                                                        <td>{bankDetail.name}</td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>}
                                                {invoiceDetail.signImage &&
                                                    <div className="col-xl-4 col-lg-5 col-md-4 col-sm-6 ml-auto mt-4 signature-section">
                                                        <div style={{ backgroundColor: "rgb(247 250 255)", borderRadius: '5px' }}>
                                                            <img src={invoiceDetail.signImage} alt='signeture' width="100%" height="auto" />
                                                        </div>
                                                        <h5 className='text-center mt-3'>Authorised Signatory</h5>
                                                    </div>
                                                }
                                                {(invoiceDetail.hasOwnProperty("terms") && invoiceDetail.terms.length !== 0) &&
                                                    <div className="col-md-12 mt-4">
                                                        <h5 className='extra-heading'>Terms & Conditions</h5>
                                                        <ol className="mb-0">
                                                            {invoiceDetail.terms.map((val, ind) => (
                                                                <li key={ind}>{val}</li>
                                                            ))}
                                                        </ol>
                                                    </div>}
                                                {(invoiceDetail.hasOwnProperty("note") && invoiceDetail.note) &&
                                                    <div className="col-md-12 mt-4">
                                                        <h5 className='extra-heading'>Additional Notes</h5>
                                                        <div className="additional-notes-content" dangerouslySetInnerHTML={{ __html: invoiceDetail.note }}></div>
                                                    </div>}

                                                {invoiceDetail.hasOwnProperty("attchmentFile") && invoiceDetail.attchmentFile.length !== 0 &&
                                                    <div className="col-md-12 mt-4">
                                                        <h5 className='extra-heading'>Attachment</h5>
                                                        <ol className='mb-0'>
                                                            {invoiceDetail.attchmentFile.map((val, ind) => {
                                                                return (
                                                                    <li key={ind}><NavLink to={`${process.env.REACT_APP_IMAGE_API}/uploads/${val}`} target='_attch' className="text-primary">{val}</NavLink></li>
                                                                )
                                                            })}
                                                        </ol>
                                                    </div>}
                                                {(invoiceDetail.hasOwnProperty("contact") && invoiceDetail.contact) &&
                                                    <div className="col-md-12 mt-4">
                                                        <hr />
                                                        <p className="text-muted text-center mb-0 font-weight-bold">{invoiceDetail.contact}</p>
                                                    </div>}
                                            </div>}
                                    </div>
                                </div>
                            </div>
                            {/* bank detail accrodion */}
                            <Accordion>
                                <Card>
                                    <Accordion.Toggle className='card-header invoice-summary' eventKey='1'>
                                        <h5 className="mb-0 btn">
                                            <AccountBalanceIcon className='my-0 mr-2' />
                                            <span>Bank Details</span>
                                        </h5>
                                        <KeyboardArrowDownIcon className='my-0' />
                                    </Accordion.Toggle>
                                    <Accordion.Collapse eventKey='1'>
                                        <Card.Body className='summary-card-body'>
                                            <div className="row">
                                                {bankDetail &&
                                                    <>
                                                        <div className="col-lg-3 col-md-4 col-sm-6">
                                                            <div className="form-group">
                                                                <label htmlFor="2" className='mt-2'>Account Number</label>
                                                                <p className="mb-0">{bankDetail.account_number}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-3 col-md-4 col-sm-6">
                                                            <div className="form-group">
                                                                <label htmlFor="2" className='mt-2'>IFSC Code</label>
                                                                <p className="mb-0">{bankDetail.ifsc_code}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-3 col-md-4 col-sm-6">
                                                            <div className="form-group">
                                                                <label htmlFor="2" className='mt-2'>Bank Name</label>
                                                                <p className="mb-0">{bankDetail.bank}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-3 col-md-4 col-sm-6">
                                                            <div className="form-group">
                                                                <label htmlFor="2" className='mt-2'>Branch Name</label>
                                                                <p className="mb-0">{bankDetail.branch_name}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-3 col-md-4 col-sm-6">
                                                            <div className="form-group">
                                                                <label htmlFor="2" className='mt-2'>Name</label>
                                                                <p className="mb-0">{bankDetail.name}</p>
                                                            </div>
                                                        </div>
                                                    </>}
                                                <div className={!bankDetail ? "col-12 text-center" : "col-12"}>
                                                    <AccountFormComponent bankDetail={bankDetail} getSingleAccountDetail={getSingleAccountDetail} />
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Accordion.Collapse>
                                </Card>
                            </Accordion>
                        </div>
                    </div>
                </div>
            </motion.div>
        </>
    )
}

export default InvoicePreviewComponent
