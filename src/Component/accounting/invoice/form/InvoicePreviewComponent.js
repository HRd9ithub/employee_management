/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useRef, useState } from 'react'
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
import { Card, Modal } from 'react-bootstrap';
import convertNumberFormat from '../../../../service/NumberFormat';
import Accordion from 'react-bootstrap/Accordion';
import ReceiptIcon from '@mui/icons-material/Receipt';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AccountFormComponent from './AccountFormComponent';
import axios from 'axios';
import fileDownload from 'js-file-download';
import { HiOutlineMinus } from 'react-icons/hi';
import { FormControlLabel, FormGroup, Switch } from '@mui/material';

const InvoicePreviewComponent = () => {
    const [isLoading, setisLoading] = useState(false);
    const [serverError, setServerError] = useState(false);
    const [invoiceDetail, setInvoiceDetail] = useState({});
    const [productDetails, setproductDetails] = useState({});
    const [clientData, setClientData] = useState("");
    const [invoiceProvider, setinvoiceProvider] = useState("");
    const [bankDetail, setbankDetail] = useState("");
    const [selectedAccountID, setSelectedAccountId] = useState("");
    const [bankAllDetail, setBankAllDetail] = useState([]);
    const [permission, setpermission] = useState("");
    const [permissionToggle, setPermissionToggle] = useState(true);
    const [firstCall, setFirstCall] = useState(false);
    const [show, setShow] = useState(false);

    const Navigate = useNavigate();
    const componentRef = useRef();

    const { id } = useParams();
    const [isChecked, setIsChecked] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState("");

    const handleToggle = (event, aId) => {
        setIsChecked(event.target.checked);
        handleToggleBankDetails(event.target.checked, aId);
    };

    const handleToggleBankDetails = (checked, aId, updated) => {
        setServerError(false)
        setisLoading(true);
        customAxios().post(`invoice/toggle-bank`, {
            invoice_id: id,
            account_id: checked ? aId : ""
        }).then((res) => {
            if (res.data.success) {
                getInvoiceDetail();
                setSelectedAccountId(aId);
                !updated && toast.success(res.data.message)
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
                    setproductDetails(...data[0].productDetails);
                    setbankDetail(...data[0].bankDetails);
                    if (!firstCall) {
                        setSelectedAccountId(data[0].invoice_accounts_id);
                    }
                    setIsChecked(data[0].invoice_accounts_id ? true : false);
                    setFirstCall(true)
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

    const getAccountDetail = async () => {
        setisLoading(true);

        customAxios().get(`invoice/account`).then((res) => {
            if (res.data.success) {
                const { data } = res.data;
                setBankAllDetail(data);
                setisLoading(false);
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
        });
    }

    useEffect(() => {
        getInvoiceDetail();
        getAccountDetail();
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
            const fileName = `invoice-${invoiceDetail.invoiceId.replace(/\//g, '-')}.pdf`
            fileDownload(res.data, fileName);
            toast.success("Download successfully.")
            setisLoading(false)
        }).catch((error) => {
            setisLoading(false)
            if (error.response && error.response.data instanceof Blob) {
                const reader = new FileReader();
                reader.onload = () => {
                    try {
                        const errorMessage = JSON.parse(reader.result);
                        toast.error(errorMessage.message || 'Download failed.');
                    } catch {
                        toast.error('Unknown error occurred while downloading.');
                    }
                };
                reader.readAsText(error.response.data);
            } else {
                toast.error(error?.response?.data?.message || error.message);
            }
        })
    }

    /* -------------------
        INVOICE PRINT
    ----------------------*/

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `invoice-${invoiceDetail.invoiceId.replace(/\//g, '-')}.pdf`
    })

    /** ==================== 
        Select Another bank account modal function
    ======================= */

    const handleShowModal = () => {
        setSelectedAccount(selectedAccountID);
        setShow(true);
    }

    const handleCloseModal = () => {
        setShow(false);
    }

    const handleSelectBankChange = () => {
        handleToggleBankDetails(true, selectedAccount, "updated");
        handleCloseModal();
    }

    /*---------------------------
        table total calacution
    ----------------------------*/

    const TOTALSGST = useMemo(() => {
        return productDetails.hasOwnProperty("tableBody") && parseFloat(productDetails?.tableBody.reduce((total, cur) => {
            return total + (invoiceDetail.gstType === "CGST & SGST" && parseFloat(cur.SGST))
        }, 0)).toFixed(2)
    }, [productDetails])

    const TOTALIGST = useMemo(() => {
        return productDetails.hasOwnProperty("tableBody") && parseFloat(productDetails?.tableBody?.reduce((total, cur) => {
            return total + (invoiceDetail.gstType === "IGST" && parseFloat(cur.IGST))
        }, 0)).toFixed(2)
    }, [productDetails]);

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
                    <div className="background-wrapper bg-white pb-4">
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
                                    <NavLink to={"/invoice/create"} className="btn btn-gradient-primary btn-rounded btn-fw text-center"><i className="fa-solid fa-plus"></i>&nbsp;Create New Invoice</NavLink>
                                    <NavLink to={"/invoice"} className="btn btn-gradient-primary btn-rounded btn-fw text-center"><i className="fa-solid fa-arrow-left"></i>&nbsp;Back</NavLink>
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
                                                            {invoiceDetail.due_date &&
                                                                <tr className='d-block mt-3'>
                                                                    <td className="invoice-title-summary"><span >Due Date:</span></td>
                                                                    <td><span className='invoice-value-summary'>{invoiceDetail.due_date ? moment(invoiceDetail.due_date).format("DD MMM YYYY") : "Not Set"}</span></td>
                                                                </tr>}
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
                                                                <td><span className='invoice-value-summary'>{clientData.business_name}</span></td>
                                                            </tr>
                                                            {clientData.phone &&
                                                                <tr className='d-block mt-3'>
                                                                    <td className="invoice-title-summary"><span >Phone:</span></td>
                                                                    <td><span className='invoice-value-summary'>{clientData.phone}</span></td>
                                                                </tr>}
                                                            {clientData.email &&
                                                                <tr className='d-block mt-3'>
                                                                    <td className="invoice-title-summary"><span >Email:</span></td>
                                                                    <td><span className='invoice-value-summary'>{clientData.email}</span></td>
                                                                </tr>}
                                                            <tr className='d-block mt-3'>
                                                                <td className="invoice-title-summary"><span >Address:</span></td>
                                                                <td><span className='invoice-value-summary'>
                                                                    {clientData.address}{clientData.city && ", " + clientData.city}{clientData.state && ", " + clientData.state}{clientData.country && ", " + clientData.country}{clientData.postcode && " " + clientData.postcode}
                                                                </span></td>
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
                                                    {invoiceDetail.due_date &&
                                                        <tr>
                                                            <td>Due Date</td>
                                                            <td className="text-black">{invoiceDetail.due_date ? moment(invoiceDetail.due_date).format("DD MMM YYYY") : "Not Set"}</td>
                                                        </tr>}
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
                                        {invoiceDetail.businessLogo &&
                                            <div className="col-md-6 col-sm-5 mt-4">
                                                <div className="billby-image ml-auto">
                                                    <img src={`${process.env.REACT_APP_IMAGE_API}/uploads/${invoiceDetail.businessLogo}`} alt="img" width="100%" height="auto" />
                                                </div>
                                            </div>
                                        }
                                    </div>
                                    <div className="grid-container">
                                        <div className="grid-section">
                                            <h3>Billed By</h3>
                                            <h4>{invoiceProvider.business_name}</h4>
                                            <p className="mb-0">{invoiceProvider.address}{invoiceProvider.city && ", " + invoiceProvider.city}{invoiceProvider.state && ", " + invoiceProvider.state}{invoiceProvider.country && ", " + invoiceProvider.country}{invoiceProvider.postcode && " " + invoiceProvider.postcode}</p>
                                            {invoiceProvider.GSTIN && <p className="mb-0">GSTIN: {invoiceProvider.GSTIN}</p>}
                                            {invoiceProvider.pan_number && <p className="mb-0">PAN: {invoiceProvider.pan_number}</p>}
                                            {invoiceProvider.email && <p className="mb-0">Email: {invoiceProvider.email}</p>}
                                            {invoiceProvider.phone && <p className="mb-0">Phone: +91 {invoiceProvider.phone}</p>}
                                            {invoiceProvider.custom_field ? JSON.parse(invoiceProvider.custom_field)?.length > 0 && JSON.parse(invoiceProvider.custom_field).map((field, index) => (<p key={index} className="mb-0">{field.name}: {field.value}</p>)) : ""}
                                        </div>
                                        <div className="grid-section">
                                            <h3>Billed To</h3>
                                            <h4>{clientData.business_name}</h4>
                                            {clientData.client_industry && <p className="mb-0">{clientData.client_industry}</p>}
                                            <p className="mb-0">{clientData.address}{clientData.city && ", " + clientData.city}{clientData.state && ", " + clientData.state}{clientData.country && ", " + clientData.country}{clientData.postcode && " " + clientData.postcode}</p>
                                            {clientData.GSTIN && <p className="mb-0">GSTIN: {clientData.GSTIN}</p>}
                                            {clientData.pan_number && <p className="mb-0">PAN: {clientData.pan_number}</p>}
                                            {clientData.email && <p className="mb-0">Email: {clientData.email}</p>}
                                            {clientData.phone && <p className="mb-0">Phone: +91 {clientData.phone}</p>}
                                            {clientData.custom_field ? JSON.parse(clientData.custom_field)?.length > 0 && JSON.parse(clientData.custom_field).map((field, index) => (<p key={index} className="mb-0">{field.name}: {field.value}</p>)) : ""}
                                        </div>
                                    </div>
                                    {/* product details table */}
                                    <div className="product-table mt-4">
                                        <table className='table'>
                                            {productDetails.hasOwnProperty("tableHead") &&
                                                <thead>
                                                    <tr>
                                                        {productDetails.tableHead.map((val, ind) => {
                                                            return val.toggle && <th key={ind}>{val.field}{val.name === "amount" && `(${invoiceDetail.currency?.slice(6)})`}</th>
                                                        })}
                                                    </tr>
                                                </thead>}
                                            {productDetails.hasOwnProperty("tableBody") &&
                                                <tbody className='body-div'>
                                                    {productDetails.tableBody.map((val, id) => {
                                                        return (
                                                            <tr key={id}>
                                                                {productDetails.tableHead.map((column, ind) => {
                                                                    return (
                                                                        <React.Fragment key={ind}>
                                                                            {column.toggle && (column.name === "amount" ?
                                                                                <td>{convertNumberFormat(val[column.name])}</td>
                                                                                : <td >{val[column.name] ? val[column.name] : <HiOutlineMinus />}
                                                                                    {column.name === "itemName" && val.description && <div dangerouslySetInnerHTML={{ __html: val.description }}></div>}
                                                                                </td>)}
                                                                        </React.Fragment>
                                                                    )
                                                                })}
                                                            </tr>
                                                        )
                                                    })}
                                                </tbody>}
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
                                                <div className="table-total-section p-3 col-xl-4 col-lg-5 col-md-4 col-sm-6 ml-auto mt-4">
                                                    <table className="w-100">
                                                        <tbody>
                                                            <tr>
                                                                <td>
                                                                    <p className="text-left mb-0">Amount:</p>
                                                                </td>
                                                                <td>
                                                                    <p className="text-right mb-0">{invoiceDetail?.currency?.slice(6)} {convertNumberFormat(parseFloat(invoiceDetail.totalSubAmount).toFixed(2))}</p>
                                                                </td>
                                                            </tr>
                                                            {invoiceDetail.gstType === "CGST & SGST" &&
                                                                <tr>
                                                                    <td>
                                                                        <p className="text-left mb-0">CGST:</p>
                                                                    </td>
                                                                    <td>
                                                                        <p className="text-right mb-0">{invoiceDetail.currency?.slice(6)} {TOTALSGST}</p>
                                                                    </td>
                                                                </tr>}
                                                            {invoiceDetail.gstType === "CGST & SGST" &&
                                                                <tr>
                                                                    <td>
                                                                        <p className="text-left mb-0">SGST:</p>
                                                                    </td>
                                                                    <td>
                                                                        <p className="text-right mb-0">{invoiceDetail.currency?.slice(6)} {TOTALSGST}</p>
                                                                    </td>
                                                                </tr>}
                                                            {invoiceDetail.gstType === "IGST" &&
                                                                <tr>
                                                                    <td>
                                                                        <p className="text-left mb-0">IGST:</p>
                                                                    </td>
                                                                    <td>
                                                                        <p className="text-right mb-0">{invoiceDetail.currency?.slice(6)} {TOTALIGST}</p>
                                                                    </td>
                                                                </tr>}
                                                            <tr>
                                                                <td colSpan="2"><hr /></td>
                                                            </tr>
                                                            <tr>
                                                                <th>
                                                                    <h4 className="text-left mb-0">Total:</h4>
                                                                </th>
                                                                <th>
                                                                    <h4 className="text-right mb-0">{invoiceDetail.currency?.slice(6)} {convertNumberFormat(parseFloat(invoiceDetail.totalAmount).toFixed(2))}</h4>
                                                                </th>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
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
                                                    <div className="col-xl-5 col-lg-7 col-md-8 mt-4">
                                                        <h5 className='extra-heading'>Attachment</h5>
                                                        <ol className='mb-0'>
                                                            {invoiceDetail.attchmentFile.map((val, ind) => {
                                                                return (
                                                                    <li key={ind}><NavLink to={`${process.env.REACT_APP_IMAGE_API}/uploads/${val}`} target='_attch' className="text-primary">{val}</NavLink></li>
                                                                )
                                                            })}
                                                        </ol>
                                                    </div>}
                                                {invoiceDetail.signImage &&
                                                    <div className="col-xl-4 col-lg-5 col-md-4 col-sm-6 ml-auto mt-4 signature-section">
                                                        <div style={{ backgroundColor: "rgb(247 250 255)", borderRadius: '5px' }}>
                                                            <img src={invoiceDetail.signImage} alt='signeture' width="100%" height="auto" />
                                                        </div>
                                                        <h5 className='text-center mt-3'>Authorised Signatory</h5>
                                                    </div>
                                                }
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
                            <Accordion defaultActiveKey="1" >
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
                                                {bankAllDetail.length > 0 && bankAllDetail.filter((b) => b._id === selectedAccountID).map((ba) => (
                                                    <React.Fragment key={ba._id}>
                                                        <div className="col-lg-3 col-md-4 col-sm-6">
                                                            <div className="form-group">
                                                                <label htmlFor="2" className='mt-2'>Account Number</label>
                                                                <p className="mb-0">{ba.account_number}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-3 col-md-4 col-sm-6">
                                                            <div className="form-group">
                                                                <label htmlFor="2" className='mt-2'>IFSC Code</label>
                                                                <p className="mb-0">{ba.ifsc_code}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-3 col-md-4 col-sm-6">
                                                            <div className="form-group">
                                                                <label htmlFor="2" className='mt-2'>Bank Name</label>
                                                                <p className="mb-0">{ba.bank}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-3 col-md-4 col-sm-6">
                                                            <div className="form-group">
                                                                <label htmlFor="2" className='mt-2'>Branch Name</label>
                                                                <p className="mb-0">{ba.branch_name}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-3 col-md-4 col-sm-6">
                                                            <div className="form-group">
                                                                <label htmlFor="2" className='mt-2'>Name</label>
                                                                <p className="mb-0">{ba.name}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-12">
                                                            <FormGroup>
                                                                <FormControlLabel control={<Switch
                                                                    checked={isChecked}
                                                                    onChange={(e) => handleToggle(e, ba._id)}
                                                                    inputProps={{ 'aria-label': 'controlled' }}
                                                                />} label="Show/Hide Bank Details Template" />
                                                            </FormGroup>
                                                        </div>
                                                    </React.Fragment>
                                                ))}
                                                <div className={"col-12 text-center"}>
                                                    {bankAllDetail.length > 0 &&
                                                        <button type="button" className="btn btn-outline-primary btn-fw text-center button-full-width" onClick={handleShowModal}>Select Another Bank Account</button>}
                                                    <AccountFormComponent selectedAccountID={selectedAccountID} bankDetail={bankDetail} handleToggleBankDetails={handleToggleBankDetails} getAccountDetail={getAccountDetail} bankAllDetail={bankAllDetail} />
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Accordion.Collapse>
                                </Card>
                            </Accordion>
                            <div className="my-3 d-flex justify-content-end align-items-center flex-wrap" style={{ gap: "10px" }} >
                                {invoiceDetail.status !== "Paid" && <button type="button" className="btn px-4 py-2  btn-outline-primary btn-fw text-center button-full-width" onClick={() => Navigate(`/invoice/edit/${id}`)}><i className="fa-solid fa-pen"></i> Edit</button>}
                                <button type="button" className="btn px-4 py-2  btn-outline-primary btn-fw text-center button-full-width" onClick={deleteInvoice}><i className="fa-solid fa-trash"></i> Delete</button>
                                <button type="button" className="btn px-4 py-2  btn-outline-primary btn-fw text-center button-full-width" onClick={handlePrint}><i className="fa-solid fa-print"></i> Print</button>
                                <button type="button" className="btn px-4 py-2  btn-outline-primary btn-fw text-center button-full-width" onClick={invoiceDownload}><i className="fa-solid fa-download"></i> Download</button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
            <Modal show={show} animation={true} size="md" aria-labelledby="example-modal-sizes-title-sm" centered>
                <Modal.Header className='small-modal'>
                    <Modal.Title>Select a Bank Account</Modal.Title>
                    <p className='close-modal' onClick={handleCloseModal}><i className="fa-solid fa-xmark"></i></p>
                </Modal.Header>
                <Modal.Body>
                    <div className=" grid-margin stretch-card inner-pages mb-lg-0">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="mb-3">Bank Accounts </h5>
                                {bankAllDetail.map((account) => (
                                    <div
                                        key={account.id}
                                        className={`border border-2 rounded p-3 mb-3 ${selectedAccount === account.id ? "border-primary" : ""
                                            }`}
                                        onClick={() => setSelectedAccount(account.id)}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <div className="d-flex gap-2 align-items-center">
                                            <div>
                                                <input
                                                    type="radio"
                                                    name="bankAccount"
                                                    checked={selectedAccount === account.id}
                                                    className="mr-2"
                                                />
                                            </div>
                                            <div>
                                                <h6 className="mb-0 font-weight-bold">{account.bank}</h6>
                                                <p className="mb-1 text-muted">{account.name}</p>
                                                <small className="text-muted">
                                                    <strong>Acc. No:</strong> {account.account_number}
                                                </small>
                                                {account.ifsc_code && (
                                                    <p className="text-muted mb-0">
                                                        <strong>IFSC:</strong> {account.ifsc_code}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div className="col-12 px-0">
                                    <div className="submit-section d-flex justify-content-between pb-3">
                                        <button className="btn btn-light" onClick={handleCloseModal} >Cancel</button>
                                        <button className=" btn btn-gradient-primary" type='button' onClick={handleSelectBankChange}>Save</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    )
}

export default InvoicePreviewComponent
