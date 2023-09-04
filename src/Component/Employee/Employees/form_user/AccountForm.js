import React, { useEffect } from 'react'
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Spinner from '../../../common/Spinner';
import { useLocation, useNavigate } from 'react-router-dom';
import GlobalPageRedirect from '../../../auth_context/GlobalPageRedirect';
import {GetLocalStorage} from "../../../../service/StoreLocalStorage"

const AccountForm = (props) => {
    let { userDetail, getEmployeeDetail, handleClose, getuser } = props;
    const [account, setAccount] = useState({
        bank_name: '',
        account_number: '',
        ifsc_code: '',
        user_id: '',
        name: '',
        branch_name: ''
    })
    const [bank_name_error, setBank_name_error] = useState('')
    const [account_number_error, setaccount_number_error] = useState('')
    const [ifsc_code_error, setifsc_code_error] = useState('')
    const [branch_name_error, setbranch_name_error] = useState('');
    const [name_error, setname_error] = useState('')
    const [loader, setLoader] = useState(false);
    const [error, setError] = useState([]);

    let {getCommonApi} = GlobalPageRedirect();

    useEffect(() => {
        if (userDetail.account_detail) {
            setAccount(userDetail.account_detail)
        }
    }, [userDetail]);

    let { pathname } = useLocation();

    // onchange function
    const InputEvent = (event) => {
        let { value, name } = event.target

        setAccount({ ...account, [name]: value })
    }

    // bank name validation
    const handleBankNameValidate = () => {
        if (!account.bank_name) {
            setBank_name_error("Bank name field is required.")
        } else if (!account.bank_name.match(/^[a-zA-Z ]*$/) || account.bank_name.trim().length < 0) {
            setBank_name_error("Please enter a valid bank name.")
        } else {
            setBank_name_error('')
        }
    }
    //  name validation
    const handlenameValidate = () => {
        if (!account.name || !account.name.trim()) {
            setname_error("Name field is required.")
        } else if (!account.name.match(/^[a-zA-Z ]*$/)) {
            setname_error("Please enter a valid name.")
        } else {
            setname_error('')
        }
    }
    //account number validation
    const handleAccountNumberValidate = () => {
        if (!account.account_number) {
            setaccount_number_error("Account number field is required.")
        } else if (!account.account_number.toString().match(/^[0-9]*$/)) {
            setaccount_number_error("Please enter a valid account number.")
        } else if (account.account_number.toString().length < 9) {
            setaccount_number_error("Please enter at least 9 characters.")
        }
        else {
            setaccount_number_error('')
        }
    }
    // ifsc code  validation
    const handleIfscCodeValidate = () => {
        if (!account.ifsc_code) {
            setifsc_code_error("Ifsc code field is required.")
        } else if (!account.ifsc_code.match(/^[a-zA-Z0-9]*$/)) {
            setifsc_code_error("Please enter a valid ifsc code.")
        } else if (account.ifsc_code.length < 10) {
            setifsc_code_error("Please enter at least 10 characters.")
        }
        else {
            setifsc_code_error('')
        }
    }

    // branch name validation
    const handleBranchNameValidate = () => {
        if (!account.branch_name || !account.branch_name.trim()) {
            setbranch_name_error("Branch name field is required.")
        } else if (!account.branch_name.match(/^[a-zA-Z ]*$/)) {
            setbranch_name_error("Please enter a valid branch name.")
        } else {
            setbranch_name_error('')
        }
    }

    // submit function
    const HandleSubmit = async (e) => {
        e.preventDefault();
        handleBankNameValidate();
        handleAccountNumberValidate();
        handleIfscCodeValidate();
        handlenameValidate();
        handleBranchNameValidate();
        setError([]);

        let { bank_name, account_number, ifsc_code, name, id, branch_name } = account;
        if (!bank_name || !account_number || !ifsc_code || !name || !branch_name) {
            return false
        }
        if (bank_name_error || account_number_error || ifsc_code_error || name_error || branch_name_error) {
            return false
        }
        if (userDetail.account_detail) {
            // edit data in mysql
            try {
                setLoader(true)
                const response = await axios.post(`${process.env.REACT_APP_API_KEY}/account_details/update`, { bank_name, account_number, ifsc_code, user_id: userDetail && userDetail.id, name: name.charAt(0).toUpperCase() + name.slice(1), id, branch_name }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${GetLocalStorage('token')}`
                    }
                });
                if (response.data.success) {
                    setLoader(false)
                    if (pathname.toLocaleLowerCase().includes('/profile')) {
                        getuser();
                        handleClose();
                    }
                    toast.success("Saved Successfully.")
                } else {
                    setLoader(false)
                    toast.error("Something went wrong, please check your details and try again.")
                }
            } catch (error) {
                setLoader(false);
                console.log("🚀 ~ file: AccountForm.js:183 ~ HandleSubmit ~ error:", error)
                if (error.response.status === 401) {
                    getCommonApi();
                } else {
                    if (error.response.data.message) {
                        toast.error(error.response.data.message)
                    } else {
                        if (typeof error.response.data.error === "string") {
                            toast.error(error.response.data.error)
                        } else {
                            setError(error.response.data.error);
                        }
                    }
                }
            }
        }else {
            // add data in mysql
            try {
                setLoader(true)
                        const response = await axios.post(`${process.env.REACT_APP_API_KEY}/account_details/add`, { bank_name, branch_name, account_number, ifsc_code, user_id: userDetail && userDetail.id, name: name.charAt(0).toUpperCase() + name.slice(1) }, {
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${GetLocalStorage('token')}`
                            }
                        });
                        if (response.data.success) {
                            setLoader(false);
                            if (pathname.toLocaleLowerCase().includes('/profile')) {
                                console.log('first')
                                getuser();
                                handleClose();
                            } else {
                                getEmployeeDetail()
                            }
                            toast.success("Added Successfully")
                        } else {
                            setLoader(false)
                            toast.error("Something went wrong, Please check your details and try again.")
                        }
                    } catch (error) {
                        console.log("🚀 ~ file: AccountForm.js:111 ~ HandleSubmit ~ error:", error)
                        setLoader(false)
                        if (error.response.status === 401) {
                            getCommonApi();
                        } else {
                            if (error.response.data.message) {
                                toast.error(error.response.data.message)
                            } else {
                                if (typeof error.response.data.error === "string") {
                                    toast.error(error.response.data.error)
                                } else {
                                    setError(error.response.data.error);
                                }
                            }
                        }
                    }
                }
            }

            let history = useNavigate();
            // back btn
            const BackBtn = (e) => {
                e.preventDefault();
                if (pathname.toLocaleLowerCase().includes('/employees')) {
                    history("/employees")
                } else {
                    handleClose();
                }
            }

            return (
                <>
                    <form className="forms-sample">
                        <div className="form-group">
                            <label htmlFor="2" className='mt-2'>Account Number</label>
                            <input type="text" className="form-control" id="2" maxLength={18} placeholder="Enter account number" name='account_number' onChange={InputEvent} value={account.account_number} onKeyUp={handleAccountNumberValidate} autoComplete='off' />
                            {account_number_error && <small id="emailHelp" className="form-text error">{account_number_error}</small>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="3" className='mt-2'>IFSC Code</label>
                            <input type="text" className="form-control" id="3" placeholder="Enter IFSC" name='ifsc_code' maxLength={10} onChange={InputEvent} value={account.ifsc_code} onKeyUp={handleIfscCodeValidate} autoComplete='off' />
                            {ifsc_code_error && <small id="emailHelp" className="form-text error">{ifsc_code_error}</small>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="1" className='mt-2'> Bank Name</label>
                            <input type="text" className="form-control" id="1" placeholder="Enter Bank name" name='bank_name' onChange={InputEvent} value={account.bank_name} onKeyUp={handleBankNameValidate} autoComplete='off' />
                            {bank_name_error && <small id="emailHelp" className="form-text error">{bank_name_error}</small>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="6" className='mt-2'> Branch Name</label>
                            <input type="text" className="form-control" id="6" placeholder="Enter Branch name" name='branch_name' onChange={InputEvent} value={account.branch_name} onKeyUp={handleBranchNameValidate} autoComplete='off' />
                            {branch_name_error && <small id="emailHelp" className="form-text error">{branch_name_error}</small>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="3" className='mt-2'>Account Holder Name</label>
                            <input type="text" className="form-control text-capitalize" id="3" placeholder="Enter Account Holder name" name='name' onChange={InputEvent} value={account.name} onKeyUp={handlenameValidate} autoComplete='off' />
                            {name_error && <small id="emailHelp" className="form-text error">{name_error}</small>}
                        </div>
                        <ol>
                            {error.map((elem) => {
                                return <li className='error' key={elem}>{elem}</li>
                            })}
                        </ol>
                        <div className="submit-section d-flex justify-content-between pb-3">
                            <button className="btn btn-light" onClick={BackBtn}>{pathname.toLocaleLowerCase().includes('/employees') ? "Back" : "Cancel"}</button>
                            <button className=" btn btn-gradient-primary" onClick={HandleSubmit}>Save</button>
                        </div>
                    </form>
                    {loader && <Spinner />}
                </>

            )
        }

        export default AccountForm;
