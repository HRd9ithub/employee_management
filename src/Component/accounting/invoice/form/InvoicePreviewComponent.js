import React, { useCallback, useEffect, useRef, useState } from 'react'
import { customAxios } from '../../../../service/CreateApi';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Spinner from '../../../common/Spinner';
import Error500 from '../../../error_pages/Error500';
import { motion } from "framer-motion";
import moment from 'moment';
import { useReactToPrint } from 'react-to-print';
import Swal from 'sweetalert2';
import generatePDF, { Margin } from 'react-to-pdf';
import Error403 from '../../../error_pages/Error403';
import { Dropdown } from 'react-bootstrap';

const InvoicePreviewComponent = () => {
    const [isLoading, setisLoading] = useState(false);
    const [serverError, setServerError] = useState(false);
    const [invoiceDetail, setInvoiceDetail] = useState({});
    const [clientData, setClientData] = useState("");
    const [invoiceProvider, setinvoiceProvider] = useState("");
    const [bankDetail, setbankDetail] = useState("");
    const [permission, setpermission] = useState("");

    const Navigate = useNavigate();
    const componentRef = useRef();

    const { id } = useParams();

    /*  -------------------------------
        get data in database
    ----------------------------------- */

    const getInvoiceDetail = async () => {
        setServerError(false)
        setisLoading(true);

        customAxios().get(`invoice/${id}`).then((res) => {
            if (res.data.success) {
                const { data, permissions } = res.data;
                if (data.length !== 0) {
                    setInvoiceDetail(...data);
                    setClientData(...data[0].invoiceClient);
                    setinvoiceProvider(...data[0].invoiceProvider);
                    setbankDetail(...data[0].bankDetails);
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
        });
    }

    useEffect(() => {
        getInvoiceDetail();
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

    const invoiceDownload = useCallback(() => {
        generatePDF(componentRef, {
            method: "save",
            filename: "invoice.pdf",
            page: { margin: Margin.SMALL },
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [componentRef.current])

    /* -------------------
        INVOICE PRINT
    ----------------------*/

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: clientData.first_name + "-invoice.pdf"
    })



    if (isLoading) {
        return <Spinner />
    } else if (serverError) {
        return <Error500 />
    } else if (!permission || permission.name.toLowerCase() !== "admin") {
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
                                            <Dropdown.Item className="dropdown-item" onClick={() => Navigate(`/invoice/edit/${id}`)}>Edit Invoice</Dropdown.Item>
                                            <Dropdown.Divider />
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
                            <div id="accordion">
                                <div className="card">
                                    <div className="card-header invoice-summary" id="headingOne" data-toggle="collapse" data-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                                        <h5 className="mb-0 btn">
                                            <i className="fa-solid fa-receipt mr-2"></i>
                                            Invoice Summary
                                        </h5>
                                        <i className="fa-solid fa-chevron-down"></i>
                                    </div>

                                    <div id="collapseOne" className="collapse show" aria-labelledby="headingOne" data-parent="#accordion">
                                        <div className="card-body summary-card-body">
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
                                                                <td><span className='invoice-value-summary'><i className="fa-solid fa-indian-rupee-sign"></i> {invoiceDetail.totalAmount}</span></td>
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
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="my-3" ref={componentRef}>
                                {/* invoice display */}
                                <div className="template-section" >
                                    <div className="row justify-content-end align-items-center mt-2 template-head-section">
                                        <div className="col-md-6">
                                            <img src="/Images/d9_logo_black-transprent.png" alt="company_logo" className='img-fluid template-logo' />
                                        </div>
                                        <div className="col-md-6 mb-4 mb-md-0">
                                            <h4 className="template-heading text-center text-md-right">Invoice</h4>
                                        </div>
                                    </div>
                                    <div className="row mt-4 mt-md-5 template-summary-section">
                                        <div className="col-md-4 col-sm-6 heading-section">
                                            <label>&nbsp;Billed By</label>
                                            <h4>{invoiceProvider.first_name?.concat(" ", invoiceProvider.last_name)}</h4>
                                            <p>+91 {invoiceProvider.phone}</p>
                                            <p>{invoiceProvider.email}</p>
                                            {invoiceProvider.address && <p>{invoiceProvider.address?.concat(" ", invoiceProvider.state).concat(",", invoiceProvider.city).concat("-", clientData.postcode)}</p>}
                                        </div>
                                        <div className="col-md-4 col-sm-6 heading-section mt-3 mt-sm-0">
                                            <label>&nbsp;Billed To</label>
                                            <h4>{clientData.first_name?.concat(" ", clientData.last_name)}</h4>
                                            <p>+91 {clientData.phone}</p>
                                            <p>{clientData.email}</p>
                                            {clientData.address && <p>{clientData.address?.concat(" ", clientData.state).concat(",", clientData.city).concat("-", clientData.postcode)}</p>}
                                        </div>
                                        <div className="col-md-4 col-sm-6 heading-section mt-3 mt-md-0">
                                            <label>&nbsp;Invoice Details</label>
                                            <table className='w-100'>
                                                <tbody>
                                                    <tr className='d-block'>
                                                        <td className="invoice-title-summary"><span >Invoice Number:</span></td>
                                                        <td><span className='invoice-value-summary'>{invoiceDetail.invoiceId}</span></td>
                                                    </tr>
                                                    <tr className='d-block mt-2'>
                                                        <td className="invoice-title-summary"><span >Invoice Date:</span></td>
                                                        <td><span className='invoice-value-summary'>{moment(invoiceDetail.issue_date).format("DD MMM YYYY")}</span></td>
                                                    </tr>
                                                    <tr className='d-block mt-2'>
                                                        <td className="invoice-title-summary"><span >Due Date:</span></td>
                                                        <td><span className='invoice-value-summary'>{invoiceDetail.due_date ? moment(invoiceDetail.due_date).format("DD MMM YYYY") : "Not Set"}</span></td>
                                                    </tr>
                                                    {invoiceDetail.hasOwnProperty("extra_field") &&
                                                        JSON.parse(invoiceDetail.extra_field).map((val, ind) => {
                                                            return (
                                                                <tr className='d-block mt-2' key={ind}>
                                                                    <td className="invoice-title-summary"><span >{val.name}:</span></td>
                                                                    <td><span className='invoice-value-summary'>{val.value}</span></td>
                                                                </tr>
                                                            )
                                                        })
                                                    }
                                                    <tr className='d-block mt-2'>
                                                        <td className="invoice-title-summary"><span >Total Amount:</span></td>
                                                        <td><span className='invoice-value-summary'><i className="fa-solid fa-indian-rupee-sign"></i> {invoiceDetail.totalAmount}</span></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    <div className="product-table mt-4">
                                        <table className='table table-bordered'>
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Item Name</th>
                                                    <th>Rate</th>
                                                    <th>Quantity</th>
                                                    <th>Amount({invoiceDetail.currency})</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {invoiceDetail?.productDetails?.map((val, ind) => {
                                                    return (
                                                        <tr key={val._id}>
                                                            <td>{ind + 1}</td>
                                                            <td>{val.itemName}</td>
                                                            <td>{val.rate}</td>
                                                            <td>{val.quantity}</td>
                                                            <td>{parseFloat(val.amount * invoiceDetail.currencyValue).toFixed(2)}</td>
                                                        </tr>
                                                    )
                                                })}
                                                <tr className='total-column'>
                                                    <td colSpan={4}>Total</td>
                                                    <td>{invoiceDetail.totalAmount}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="extra-section mt-4">
                                        {(invoiceDetail.hasOwnProperty("attchmentFile") || bankDetail || invoiceDetail.signImage || invoiceDetail.hasOwnProperty("note")) &&
                                            <div className="row">
                                                {invoiceDetail.hasOwnProperty("attchmentFile") && invoiceDetail.attchmentFile.length !== 0 &&
                                                    <div className="col-md-6 mb-3 attch-template-section">
                                                        <h5 className='extra-heading'>Attachment:</h5>
                                                        <ol className='mb-0'>
                                                            {invoiceDetail.attchmentFile.map((val, ind) => {
                                                                return (
                                                                    <li key={ind}><NavLink to={`${process.env.REACT_APP_IMAGE_API}/uploads/${val}`} target='_attch' className="text-primary">{val}</NavLink></li>
                                                                )
                                                            })}
                                                        </ol>
                                                    </div>
                                                }
                                                {bankDetail &&
                                                    <div className="col-md-6 mb-3 attch-template-section">
                                                        <h5 className='extra-heading'>Bank Details:</h5>
                                                        <table className='w-100'>
                                                            <tbody>
                                                                <tr className='d-block mt-2'>
                                                                    <td className="invoice-title-summary"><span >Account Number:</span></td>
                                                                    <td><span className='invoice-value-summary'>{bankDetail.account_number}</span></td>
                                                                </tr>
                                                                <tr className='d-block mt-3'>
                                                                    <td className="invoice-title-summary"><span >IFSC Code:</span></td>
                                                                    <td><span className='invoice-value-summary'>{bankDetail.ifsc_code}</span></td>
                                                                </tr>
                                                                <tr className='d-block mt-3'>
                                                                    <td className="invoice-title-summary"><span >Bank Name:</span></td>
                                                                    <td><span className='invoice-value-summary'>{bankDetail.bank}</span></td>
                                                                </tr>
                                                                <tr className='d-block mt-3'>
                                                                    <td className="invoice-title-summary"><span >Branch Name:</span></td>
                                                                    <td><span className='invoice-value-summary'>{bankDetail.branch_name}</span></td>
                                                                </tr>
                                                                <tr className='d-block mt-3'>
                                                                    <td className="invoice-title-summary"><span >Name:</span></td>
                                                                    <td><span className='invoice-value-summary'>{bankDetail.name}</span></td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>}
                                                {(invoiceDetail.hasOwnProperty("note") && invoiceDetail.note) &&
                                                    <div className="col-md-12">
                                                        <h5 className='extra-heading'>Additional Notes:</h5>
                                                        <div dangerouslySetInnerHTML={{ __html: invoiceDetail.note }}></div>
                                                    </div>}
                                                {invoiceDetail.signImage &&
                                                    <div className="col-md-4 template-signature-section">
                                                        <h5 className='extra-heading'>Signature :</h5>
                                                        <div style={{ backgroundColor: "rgb(247 250 255)", borderRadius: '5px' }}>
                                                            <img src={invoiceDetail.signImage} alt='signeture' className='img-fluid' />
                                                        </div>
                                                    </div>}
                                                {(invoiceDetail.hasOwnProperty("terms") && invoiceDetail.terms.length !== 0) && 
                                                <div className="col-md-12 mt-4">
                                                    <h5 className='extra-heading'>Terms & Conditions:</h5>
                                                    <ol className="mb-0">
                                                        {invoiceDetail.terms.map((val) => (
                                                            <li key={val}>{val}</li>
                                                            ))}
                                                    </ol>
                                                </div>}
                                                {(invoiceDetail.hasOwnProperty("contact") && invoiceDetail.contact) && 
                                                <div className="col-md-12">
                                                    <hr/>
                                                    <p className="mb-0 text-center">{invoiceDetail.contact}</p>
                                                </div>}
                                            </div>}
                                    </div>
                                </div>
                            </div>
                            {/* bank detail accrodion */}
                            <div id="accordion">
                                <div className="card">
                                    <div className="card-header invoice-summary" id="headingtwo" data-toggle="collapse" data-target="#collapsetwo" aria-expanded="true" aria-controls="collapsetwo">
                                        <h5 className="mb-0 btn">
                                            <i className="fa-solid fa-building-columns mr-2"></i>
                                            Bank Details
                                        </h5>
                                        <i className="fa-solid fa-chevron-down"></i>
                                    </div>
                                    <div id="collapsetwo" className="collapse" aria-labelledby="headingtwo" data-parent="#accordion">
                                        <div className="card-body summary-card-body">
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
                                                    <button type="button" className="btn btn-gradient-primary btn-rounded btn-fw text-center button-full-width" onClick={() => Navigate(`/invoice/payment/${id}`)} >
                                                        <i className="fa-solid fa-gear"></i>&nbsp;{bankDetail ? "Edit" : "Add"} Bank Details
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </>
    )
}

export default InvoicePreviewComponent
