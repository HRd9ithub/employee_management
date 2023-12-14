import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from "framer-motion";
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ItemComponent from './ItemComponent';
import SignatureCanvas from 'react-signature-canvas'
import JoditEditor from 'jodit-react';
import { AppProvider } from '../../../context/RouteContext';
import toast from 'react-hot-toast';
import { customAxios, customAxios1 } from '../../../../service/CreateApi';
import Spinner from '../../../common/Spinner';
import Error500 from '../../../error_pages/Error500';
import ClientFormComponent from './ClientFormComponent';
import moment from 'moment';
import Error403 from '../../../error_pages/Error403';


const InvoiceFormComponent = () => {
    const navigate = useNavigate();
    const issueDateRef = useRef(null);
    const dueDateRef = useRef(null);
    const signatureRef = useRef(null);
    const noteEditorRef = useRef(null);
    const [permission, setPermission] = useState("");
    const [clientNames, setClientNames] = useState([]);
    const [clientData, setClientData] = useState({});
    const [clienError, setClienError] = useState("");
    const [isLoading, setisLoading] = useState(false);
    const [serverError, setServerError] = useState(false);
    const [heading, setHeading] = useState({
        invoiceId: "D9" + Math.random().toString().slice(2, 8),
        issue_date: "",
        due_date: ""
    });
    const [invoiceIdError, setInvoiceIdError] = useState("");
    const [issueDateError, setissueDateError] = useState("");
    // extra field
    const [extra_field, setextra_field] = useState([]);
    const [extraFieldError, setExtraFieldError] = useState("");
    const [error, setError] = useState([]);

    //table data
    const [tableData, settableData] = useState([{
        itemName: '',
        quantity: '1',
        rate: '1',
        amount: 1
    }]);
    const [itemNameError, setitemNameError] = useState([]);
    const [rateError, setrateError] = useState([]);
    const [quantiyError, setquantiyError] = useState([]);
    const [note, setNote] = useState('');
    const [attchFile, setattchFile] = useState([]);
    const [signImage, setsignImage] = useState("");
    const [signImageToggle, setsignImageToggle] = useState(true);

    const { id,duplicateId } = useParams();
    const { UserData } = useContext(AppProvider);

    // heading onchange
    const headingChange = (event) => {
        const { name, value } = event.target;

        setHeading({ ...heading, [name]: value });
    }

    // invoice id validation
    const invoiceIdValidation = () => {
        if (!heading.invoiceId.trim()) {
            setInvoiceIdError("Invoice Number is a required field.");
        } else {
            setInvoiceIdError("");
        }
    }

    // issueDate validation
    const issueDateValidation = () => {
        if (!heading.issue_date) {
            setissueDateError("Issue Date is a required field.");
        } else {
            setissueDateError("");
        }
    }

    // * ===================== extra field ==========================

    // add extra field
    const addExtraField = () => {
        const field = {
            name: "",
            value: ""
        }
        setextra_field([...extra_field, field])
    }

    // field remove
    const handleRemovefiled = (ind) => {
        let deleteField = [...extra_field];
        deleteField.splice(ind, 1);
        setextra_field(deleteField)
    }
    // onchage field
    const handleFieldChange = (event, ind) => {
        const { name, value } = event.target;

        let list = [...extra_field]

        list[ind][name] = value

        setextra_field(list)
    }

    //  * ======================= table data ============================

    const addRowTable = () => {
        const data = [...tableData, {
            itemName: '',
            quantity: '1',
            rate: '1',
            amount: 1
        }]
        settableData(data)
    }

    //delete row in table
    const removeRowTable = (ind) => {
        const deleteval = [...tableData];
        deleteval.splice(ind, 1)
        settableData(deleteval)

        const item = itemNameError.filter((elem) => {
            return elem.id !== ind
        })
        const rate = rateError.filter((elem) => {
            return elem.id !== ind
        })
        const Quantity = quantiyError.filter((elem) => {
            return elem.id !== ind
        })
        setitemNameError(item);
        setrateError(rate);
        setquantiyError(Quantity);
    }

    //onchange in table function
    const handleItemchange = (e, ind) => {
        const { name, value } = e.target;
        let list = [...tableData];
        list[ind][name] = value;
        if (name === 'quantity') {
            list[ind]['amount'] = tableData[ind].rate * value
        }
        if (name === 'rate') {
            list[ind]['amount'] = tableData[ind].quantity * value
        }
        settableData(list)
    }

    const addRowButtonDisable = useMemo(() => {
        const result = tableData.find((item) => {
            return item.itemName === ""
        })
        return result ? true : false;
    }, [tableData])


    // * ======================= attchment part ============================================

    // handle attachment
    const addAttchmentFile = (e) => {
        if (e.target.files.length !== 0) {
            const res = e.target.files[0];
            if (res.type === 'text/csv') {
                setattchFile([...attchFile, { url: res, icon: '/Images/csv.png' }])
            } else if (res.type === 'application/pdf') {
                setattchFile([...attchFile, { url: res, icon: '/Images/pdf-attch.png' }])
            } else {
                setattchFile([...attchFile, { url: res, icon: URL.createObjectURL(res) }])
            }
        }
    }

    //remove attach file
    const removeAttchFile = (ind) => {
        setattchFile(attchFile.filter((data, id) => {
            return id !== ind
        }));
    }


    // ============================== client part =======================================

    // get client name
    const getClientName = () => {
        setServerError(false)
        setisLoading(true);

        customAxios().get('/invoice/client').then((res) => {
            const { data, permissions } = res.data;
            setPermission(permissions);
            if (res.data.success) {
                setClientNames(data);
            }
        }).catch((error) => {
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
        }).finally(() => setisLoading(false));
    }

    // get client detail
    const getClientDetail = (id) => {
        setServerError(false)
        setisLoading(true);

        customAxios().get(`/invoice/client/${id}`).then((res) => {
            if (res.data.success) {
                getClientName();
                const { data } = res.data;
                setClientData(data);
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
        if (id || duplicateId) {
            getInvoiceDetail();
        }
        getClientName();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // onchange function
    const clientChange = (id) => {
        getClientDetail(id)
    }


    // * ============================  submit invoice====================================
    const addInvoice = (status) => {
        let errorData = ""
            errorData = extra_field.find((val) => {
                return !val.name.trim() || !val.value.trim();
            })
            if (errorData) {
                setExtraFieldError("Additional field must not be empty.");
            } else {
                setExtraFieldError("");
            }
        setError([]);
        Object.keys(clientData).length !== 0 ? setClienError("") : setClienError("Client Business Name is Empty.");

        invoiceIdValidation();
        issueDateValidation();

        const data = validate();

        const { invoiceId, issue_date, due_date } = heading;

        if (invoiceIdError || issueDateError || !invoiceId || !issue_date || data || clienError || extraFieldError || errorData) {
            return false
        } else {
            const totalAmount = tableData.reduce((total, cur) => {
                return total + cur.amount
            }, 0)

            let formdata = new FormData();
            formdata.append('invoiceId', invoiceId);
            formdata.append('issue_date', issue_date);
            due_date && formdata.append('due_date', due_date);
            formdata.append('totalAmount', totalAmount);
            formdata.append('userId', UserData._id)
            formdata.append('clientId', clientData._id);
            attchFile.map((val) => formdata.append('image', val.url))
            formdata.append('signImage', !signImageToggle || signatureRef?.current.isEmpty() ? signImage: signatureRef.current.toDataURL('image/png'));
            formdata.append('extra_field', JSON.stringify(extra_field));
            note && formdata.append('note', note);
            formdata.append('tableData', JSON.stringify(tableData));
            status && formdata.append('status', status);

            let url = "";
            if (id) {
                url = customAxios1().put(`/invoice/${id}`, formdata);
            } else {
                url = customAxios1().post('/invoice', formdata);
            }

            url.then((result) => {
                if (result.data.success) {
                    toast.success(result.data.message);
                    if (status) {
                        navigate("/invoice");
                    } else if(id) {
                        navigate(`/invoice/preview/${result.data.id}`);
                    }else{
                        navigate(`/invoice/payment/${result.data.id}`);
                    }
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
            }).finally(() => {
                setisLoading(false);
            })
        }
    }

    //  * validation form  part    
    const validate = () => {
        let nameError = [];
        let rateError = [];
        let QuantityError = [];

        // eslint-disable-next-line array-callback-return
        tableData.forEach((val, ind) => {
            if ((!val.itemName.trim())) {
                nameError.push({ item: "Item Name is a required field.", id: ind })
            }
            if ((!val.quantity)) {
                QuantityError.push({ Quantity: "Quantity is a required field.", id: ind })
            }
            if (!val.rate) {
                rateError.push({ rate: "Rate is a required field.", id: ind })
            }
        })
        setitemNameError(nameError);
        setquantiyError(QuantityError);
        setrateError(rateError);
        return (nameError.length !== 0 || rateError.length !== 0 || QuantityError.length !== 0)
    }

    /* ------------------------
    get data database
    ---------------------------*/

    const getInvoiceDetail = async () => {
        setServerError(false)
        setisLoading(true);

        const unique = id || duplicateId;

        customAxios().get(`invoice/${unique}`).then((res) => {
            if (res.data.success) {
                const { data } = res.data;
                if (data.length !== 0) {
                    const result = data[0]
                    setHeading({
                        invoiceId: duplicateId ? "D9" + Math.random().toString().slice(2, 8) : result.invoiceId,
                        issue_date: moment(result.issue_date).format("YYYY-MM-DD"),
                        due_date: result.due_date && moment(result.due_date).format("YYYY-MM-DD"),
                    });
                    result.hasOwnProperty("extra_field") && setextra_field(JSON.parse(result.extra_field));
                    setClientData(result.invoiceClient[0]);
                    settableData(result.productDetails);
                    let file = [];
                    result.attchmentFile.forEach((val) => {
                        if (val.split(".")[1] === "pdf") {
                            file.push({ url: val, icon: '/Images/pdf-attch.png' });
                        } else if (val.split(".")[1] === "csv") {
                            file.push({ url: val, icon: '/Images/csv.png' });
                        } else {    
                            file.push({ url: val, icon: process.env.REACT_APP_IMAGE_API + "/uploads/" + val });
                        }
                    })
                    setattchFile(file);
                    if(id){
                        setsignImage(result.signImage);
                        result.signImage ? setsignImageToggle(false) : setsignImageToggle(true);
                    }
                    setNote(result.note)
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
                        {/* ====================== breadcrumb ==================*/}
                        <div>
                            <div className='row justify-content-end align-items-center row-std m-0'>
                                <div className="col-12 col-sm-8 d-flex justify-content-between align-items-center">
                                    <div>
                                        <ul id="breadcrumb" className="mb-0">
                                            <li><NavLink to="/" className="ihome">Dashboard</NavLink></li>
                                            <li><NavLink to="/invoice" className="ibeaker"><i className="fa-solid fa-play"></i> &nbsp; Invoice</NavLink></li>
                                            <li><NavLink to="" className="ibeaker"><i className="fa-solid fa-play"></i> &nbsp; {id ? "Edit" : "Create"}</NavLink></li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="col-12 col-sm-4 d-flex justify-content-end" id="two">
                                    <button type="button" className="btn btn-gradient-primary btn-rounded btn-fw text-center" onClick={() => navigate("/invoice")} >
                                        <i className="fa-solid fa-arrow-left"></i>&nbsp;Back
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="mx-4">
                            {/* title */}
                            <div className='row'>
                                <div className='col-md-12 text-center mt-3'>
                                    <h1 className='invoice-title'>{id ? "Edit" : "Create"} Invoice</h1>
                                </div>
                            </div>
                            <form>
                                {/* head */}
                                <div className='row'>
                                    <div className="col-12">
                                        <div className="row">
                                            <div className="col-md-4 col-sm-6">
                                                <table className='w-100'>
                                                    <tbody>
                                                        <tr>
                                                            <td  className='common-head-invoice field-input'><label htmlFor='invoice-id' className="mb-0">Invoice No</label></td>
                                                            <td className='common-head-invoice'>
                                                                <input type="text" className='form-control' name='invoiceId' value={heading.invoiceId} onChange={headingChange} onBlur={invoiceIdValidation} disabled={id} />
                                                                {invoiceIdError && <small id="invoiceId" className="form-text error">{invoiceIdError}</small>}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className='common-head-invoice field-input'><label htmlFor='issue_date' className="mb-0">Issue Date</label></td>
                                                            <td className='common-head-invoice position-relative' onClick={() => { issueDateRef.current.showPicker(); }}>
                                                                <input type="date" className='form-control' name='issue_date' value={heading.issue_date} onChange={headingChange} ref={issueDateRef} onBlur={issueDateValidation} />
                                                                <CalendarMonthIcon className='invoice-calendar-icon' />
                                                                {issueDateError && <small id="invoiceId" className="form-text error">{issueDateError}</small>}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className='common-head-invoice field-input'><label htmlFor='due_date' className="mb-0">Due Date</label></td>
                                                            <td className='common-head-invoice position-relative' onClick={() => { dueDateRef.current.showPicker(); }}>
                                                                <input type="date" className='form-control' name='due_date' ref={dueDateRef} value={heading.due_date} onChange={headingChange} />
                                                                <CalendarMonthIcon className='invoice-calendar-icon' />
                                                            </td>
                                                        </tr>
                                                        {extra_field.length !== 0 &&
                                                            extra_field.map((val, ind) => {
                                                                return (
                                                                    <tr key={ind}>
                                                                        <td className='common-head-invoice field-input'>
                                                                            <input type="text" placeholder="Field name" autoComplete='off' className='form-control'  name='name' value={val.name} onChange={(event) => handleFieldChange(event, ind)} />
                                                                        </td>
                                                                        <td className='common-head-invoice'>
                                                                            <i className="fa-solid fa-xmark remove-field-icon" onClick={() => handleRemovefiled(ind)}></i>
                                                                            <input type="text" className='form-control' autoComplete='off' name='value' placeholder="Field value" value={val.value} onChange={(event) => handleFieldChange(event, ind)} />
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            })
                                                        }
                                                    </tbody>
                                                </table>
                                                <div className='text-left my-2'>
                                                    <button type="button" className="btn btn-gradient-primary btn-rounded btn-fw text-center" onClick={addExtraField} >
                                                        <i className="fa-solid fa-plus"></i>&nbsp;Add Field
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* bill part */}
                                <div className="form-contents">
                                    <div className="row align-content-center">
                                        <div className='col-md-6'>
                                            <div className='bill-box-section'>
                                                <h4>Billed By</h4>
                                                <div className="dropdown ">
                                                    <button className="btn button-bill text-left col-12 dropdown-toggle" type="button" id="dropdownMenuButton" >
                                                        <span className='bill-logo mx-2' >{UserData.profile_image && <img src={`${process.env.REACT_APP_IMAGE_API}/${UserData.profile_image}`} alt='p_image' />}</span>
                                                        <span className='text-capitalize'>{UserData.first_name?.concat(" ", UserData.last_name)}</span>
                                                    </button>
                                                </div>
                                                <div className='p-3 business-detail'>
                                                    <div className="d-flex justify-content-between">
                                                        <label className='Business-title'>Business details</label>
                                                    </div>
                                                    <div className='business-name'>
                                                        <div className='business-info'>
                                                            <span >Business Name</span>
                                                        </div>
                                                        <div className='business-info-value'>
                                                            <span className='Business-title'>{UserData.first_name?.concat(" ", UserData.last_name)}</span>
                                                        </div>
                                                    </div>
                                                    <div className='business-name'>
                                                        <div className='business-info'>
                                                            <span >Email</span>
                                                        </div>
                                                        <div className='business-info-value'>
                                                            <span className='Business-title'>{UserData.email}</span>
                                                        </div>
                                                    </div>
                                                    <div className='business-name'>
                                                        <div className='business-info'>
                                                            <span >Phone No</span>
                                                        </div>
                                                        <div className='business-info-value'>
                                                            <span className='Business-title'>{UserData.phone}</span>
                                                        </div>
                                                    </div>
                                                    <div className='business-name'>
                                                        <div className='business-info'>
                                                            <span>Country</span>
                                                        </div>
                                                        <div className='business-info-value'>
                                                            <span className='Business-title'>{UserData.country}</span>
                                                        </div>
                                                    </div>
                                                    {UserData.address &&
                                                        <div className='business-name'>
                                                            <div className='business-info'>
                                                                <span >Address</span>
                                                            </div>
                                                            <div className='business-info-value address'>
                                                                <span className='Business-title'>{UserData.address?.concat(" ", UserData.state).concat(",", UserData.city).concat("-", UserData.postcode)}</span>
                                                            </div>
                                                        </div>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className='col-md-6 '>
                                            <div className='bill-box-section'>
                                                <h4>Billed To</h4>
                                                <div className="dropdown ">
                                                    <button className="btn button-bill text-left col-12 client-icon-drop dropdown-toggle" type="button" id="dropdownMenuButton1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" >
                                                        {Object.keys(clientData).length !== 0 ? <>
                                                            {clientData.profile_image && <span className='bill-logo mx-2' ><img src={`${process.env.REACT_APP_IMAGE_API}/${clientData.profile_image}`} alt='p_image' /></span>}
                                                            <span className='text-capitalize'>{clientData.first_name?.concat(" ", clientData.last_name)}</span>
                                                        </> : <span className='static-title'> Select Client</span>}
                                                    </button>
                                                    <ul className="dropdown-menu col-md-12" aria-labelledby="dropdownMenuButton1">
                                                        {clientNames.map((val) => {
                                                            return <li className="list-client" key={val._id} value={val._id} onClick={() => clientChange(val._id)}>{val.name}</li>
                                                        })}
                                                        <li className='d-flex justify-content-center my-2'>
                                                            <ClientFormComponent getClientDetail={getClientDetail} />
                                                        </li>
                                                    </ul>
                                                </div>
                                                {Object.keys(clientData).length !== 0 ?
                                                    <div className='p-3 business-detail'>
                                                        <div className="d-flex justify-content-between">
                                                            <label className='Business-title'>Business details</label>
                                                            <ClientFormComponent data={clientData} getClientDetail={getClientDetail} />
                                                        </div>
                                                        <div className='business-name'>
                                                            <div className='business-info'>
                                                                <span >Business Name</span>
                                                            </div>
                                                            <div className='business-info-value'>
                                                                <span className='Business-title'>{clientData.first_name?.concat(" ", clientData.last_name)}</span>
                                                            </div>
                                                        </div>
                                                        <div className='business-name'>
                                                            <div className='business-info'>
                                                                <span >Email</span>
                                                            </div>
                                                            <div className='business-info-value'>
                                                                <span className='Business-title'>{clientData.email}</span>
                                                            </div>
                                                        </div>
                                                        <div className='business-name'>
                                                            <div className='business-info'>
                                                                <span >Phone No :</span>
                                                            </div>
                                                            <div className='business-info-value'>
                                                                <span className='Business-title'>{clientData.phone}</span>
                                                            </div>
                                                        </div>
                                                        <div className='business-name'>
                                                            <div className='business-info'>
                                                                <span >country</span>
                                                            </div>
                                                            <div className='business-info-value'>
                                                                <span className='Business-title'>{clientData.country}</span>
                                                            </div>
                                                        </div>
                                                        <div className='business-name'>
                                                            <div className='business-info'>
                                                                <span >Address</span>
                                                            </div>
                                                            <div className='business-info-value address'>
                                                                <span className='Business-title'>{clientData.address?.concat(" ", clientData.state).concat(",", clientData.city).concat("-", clientData.postcode)}</span>
                                                            </div>
                                                        </div>
                                                    </div> :
                                                    <div>
                                                        <div className={`static business-detail ${clienError ? "client-error" : ""}`}>
                                                            <div className='static-client-div'>
                                                                <span className='client-static-title mt-3 mt-md-0'>Select a Client/Business from list</span>
                                                                <span className='client-static-title'>Or</span>
                                                                <ul className="col-md-12 client-static-button">
                                                                    <li className='d-flex justify-content-center my-2'>
                                                                        <ClientFormComponent getClientDetail={getClientDetail} />
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                        {clienError && <div className='error mt-0' >{clienError}</div>}
                                                    </div>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>

                            <div className='mt-3 mb-4'>
                                {/* table display */}
                                <ItemComponent
                                    // currency={currency}
                                    tableData={tableData}
                                    removeRowTable={removeRowTable}
                                    handleItemchange={handleItemchange}
                                    // currencyvalue={currencyvalue}
                                    itemNameError={itemNameError}
                                    setitemNameError={setitemNameError}
                                    rateError={rateError}
                                    setrateError={setrateError}
                                    quantiyError={quantiyError}
                                    setquantiyError={setquantiyError}
                                />

                                <div className='row my-3'>
                                    {/* add button */}
                                    <div className='col-md-12 text-right'>
                                        <button type="button" className="btn btn-gradient-primary btn-rounded btn-fw text-center" onClick={addRowTable} disabled={addRowButtonDisable} >
                                            <i className="fa-solid fa-plus"></i>&nbsp;Add More Item
                                        </button>
                                    </div>
                                    {/* attchment file */}
                                    <div className="col-md-6 my-3">
                                        <div className='bg-div-color p-3'>
                                            <div className='attach-title'>
                                                <h4>Attachment Files <span>(Optional)</span></h4>
                                            </div>
                                            <div className='attach-button'>
                                                {attchFile.length !== 0 && attchFile.map((val, ind) => {
                                                    return (
                                                        <div className='url-display' key={ind} >
                                                            <img src={val.icon} alt='file' width="50" height="50" />
                                                            <div onClick={() => removeAttchFile(ind)}>
                                                                <svg width="16" height="25" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d="M6.35355 5.64645C6.15829 5.45118 5.84171 5.45118 5.64645 5.64645C5.45118 5.84171 
                                                                    5.45118 6.15829 5.64645 6.35355L6.35355 5.64645ZM13.6464 14.3536C13.8417 14.5488 14.1583
                                                                    14.5488 14.3536 14.3536C14.5488 14.1583 14.5488 13.8417 14.3536 13.6464L13.6464 14.3536ZM5.64645 6.35355L13.6464 14.3536L14.3536 13.6464L6.35355 5.64645L5.64645 6.35355Z" fill="#ffffff"></path><path d="M14.3536 6.35355C14.5488 6.15829 14.5488 5.84171 14.3536 5.64645C14.1583 5.45118 13.8417 5.45118 13.6464 5.64645L14.3536 6.35355ZM5.64645 13.6464C5.45118 13.8417 5.45118 14.1583 5.64645 14.3536C5.84171 14.5488 6.15829 14.5488 6.35355 14.3536L5.64645 13.6464ZM13.6464 5.64645L5.64645 13.6464L6.35355 14.3536L14.3536 6.35355L13.6464 5.64645Z"
                                                                        fill="#ffffff">
                                                                    </path>
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                                <label> + <input type="file" accept=".pdf,image/*,.csv" onChange={addAttchmentFile} /></label>
                                            </div>
                                        </div>
                                    </div>
                                    {/* signature */}
                                    <div className="col-md-6 my-3">
                                        <div className='bg-div-color p-3'>
                                            <div className='attach-title'>
                                                <h4>Signature <span>(Optional)</span></h4>
                                            </div>
                                            <div className='signature'>
                                                {signImageToggle ?
                                                    <SignatureCanvas
                                                        ref={signatureRef}
                                                        penColor='cyan' throttle={20}
                                                        canvasProps={{ width: 450, height: 180, className: 'sigCanvas' }}
                                                    /> :
                                                    <img src={signImage} alt="signature" width={450} height={160} />
                                                }
                                                <div className='sign-upload-image'>
                                                    {!signImageToggle &&
                                                        <label onClick={() => {setsignImageToggle(true);setsignImage("")}}><i className="fa-solid fa-plus"></i> Add New Signature</label>}
                                                    <label onClick={() => signatureRef.current.clear()}><i className="fa-solid fa-rotate-right"></i> reset</label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* note */}
                                    <div className="col-md-12 my-3">
                                        <div className='attach-title'>
                                            <h4>Additional Notes <span>(Optional)</span></h4>
                                        </div>
                                        <div className='additional-note'>
                                            <JoditEditor
                                                ref={noteEditorRef}
                                                value={note}
                                                tabIndex={1}
                                                onBlur={newContent => setNote(newContent)}
                                            />
                                        </div>
                                    </div>
                                    {
                                        invoiceIdError || issueDateError || itemNameError.length !== 0 || rateError.length !== 0 || quantiyError.length !== 0 || error.length !== 0 || extraFieldError ?
                                            <div className='col-md-4 my-3'>
                                                <div className='invoice-error-box p-3'>
                                                    <span><i className="fa-solid fa-circle-exclamation"></i> Please fill the following details</span>
                                                    <ol className='mt-3'>
                                                        {invoiceIdError && <li className='mt-1'>{invoiceIdError}</li>}
                                                        {issueDateError && <li className='mt-1'>{issueDateError}</li>}
                                                        {itemNameError.length !== 0 && <li className='mt-1'> {itemNameError[0].item} </li>}
                                                        {rateError.length !== 0 && <li className='mt-1'> {rateError[0].rate} </li>}
                                                        {quantiyError.length !== 0 && <li className='mt-1'> {quantiyError[0].Quantity} </li>}
                                                        {clienError && <li className='mt-1'>{clienError}</li>}
                                                        {extraFieldError && <li className='mt-1'>{extraFieldError}</li>}
                                                        {error.map((item, index) => (
                                                            <li key={index} className='mt-1'>{item}</li>
                                                        ))}
                                                    </ol>
                                                </div>
                                            </div>
                                            :
                                            null
                                    }

                                    <div className='col-md-10 mx-auto'>
                                        <div className='d-flex justify-content-center'>
                                            {!id && <button className="btn btn-light" onClick={() => addInvoice("Draft")}>Save as Draft</button>}
                                            <button className="btn btn-gradient-primary" onClick={() => addInvoice()} >Save & Continue</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div >
        </>
    )
}

export default InvoiceFormComponent
