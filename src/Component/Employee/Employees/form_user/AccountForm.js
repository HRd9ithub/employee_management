import React, { useEffect } from 'react'
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import Spinner from '../../../common/Spinner';
import { useLocation, useNavigate } from 'react-router-dom';
import { customAxios } from '../../../../service/CreateApi';
import {alphSpaceFormat, alphaNumFormat, numberFormat} from "../../../common/RegaulrExp";
import ErrorComponent from '../../../common/ErrorComponent';

const AccountForm = (props) => {
    let { userDetail, handleClose, getEmployeeDetail, getuser } = props;
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
    const [isLoading, setisLoading] = useState(false);
    const [error, setError] = useState([]);

    useEffect(() => {
        if (userDetail.account_detail.length !== 0) {
            setAccount(userDetail.account_detail[0])
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
        if (!account.bank_name.trim()) {
            setBank_name_error("Bank name is a required field.")
        } else {
            setBank_name_error('')
        }
    }
    //  name validation
    const handlenameValidate = () => {
        if (!account.name || !account.name.trim()) {
            setname_error("Name is a required field.")
        } else if (!account.name.match(alphSpaceFormat)) {
            setname_error("Name must be an alphabet and space only.")
        } else {
            setname_error('')
        }
    }
    //account number validation
    const handleAccountNumberValidate = () => {
        if (!account.account_number) {
            setaccount_number_error("Account number is a required field.")
        } else if (!account.account_number.toString().match(numberFormat)) {
            setaccount_number_error("Account number must be a number.")
        } else {
            setaccount_number_error('')
        }
    }
    // ifsc code  validation
    const handleIfscCodeValidate = () => {
        if (!account.ifsc_code) {
            setifsc_code_error("Ifsc code is a required field.")
        } else if (!account.ifsc_code.match(alphaNumFormat)) {
            setifsc_code_error("Ifsc code must be a number or alphabetic.")
        } else if (account.ifsc_code.length < 11) {
            setifsc_code_error("Your Ifsc code must be 11 characters.")
        }
        else {
            setifsc_code_error('')
        }
    }

    // branch name validation
    const handleBranchNameValidate = () => {
        if (!account.branch_name || !account.branch_name.trim()) {
            setbranch_name_error("Branch name is a required field.")
        } else if (!account.branch_name.match(alphSpaceFormat)) {
            setbranch_name_error("Branch name must be an alphabet and space only.")
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
                setisLoading(true)
                const response = await customAxios().post('/account', { bank_name, account_number, ifsc_code, user_id: userDetail._id, name: name.charAt(0).toUpperCase() + name.slice(1), id, branch_name });
                if (response.data.success) {
                    if (pathname.toLocaleLowerCase().includes('/profile')) {
                        getuser();
                        handleClose();
                    } else {
                        getEmployeeDetail()
                    }
                    toast.success(response.data.message)
                }
            } catch (error) {
                if (!error.response) {
                    toast.error(error.message)
                } else {
                    if (error.response.data.message) {
                        toast.error(error.response.data.message)
                    } else {
                        setError(error.response.data.error);
                    }
                }
            } finally { setisLoading(false) }
        }
    }

    const history = useNavigate();
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
                <div className="row">
                    <div className="col-md-4 pr-md-2 pl-md-2">
                        <div className="form-group">
                            <label htmlFor="2" className='mt-2'>Account Number</label>
                            <input type="text" className="form-control" id="2" maxLength={18} placeholder="Enter account number" name='account_number' onChange={InputEvent} value={account.account_number} onBlur={handleAccountNumberValidate} autoComplete='off' />
                            {account_number_error && <small id="emailHelp" className="form-text error">{account_number_error}</small>}
                        </div>
                    </div>
                    <div className="col-md-4 pr-md-2 pl-md-2">
                        <div className="form-group">
                            <label htmlFor="3" className='mt-2'>IFSC Code</label>
                            <input type="text" className="form-control" id="3" placeholder="Enter IFSC" name='ifsc_code' maxLength={11} onChange={InputEvent} value={account.ifsc_code} onBlur={handleIfscCodeValidate} autoComplete='off' />
                            {ifsc_code_error && <small id="emailHelp" className="form-text error">{ifsc_code_error}</small>}
                        </div>
                    </div>
                    <div className="col-md-4 pr-md-2 pl-md-2">
                        <div className="form-group">
                            <label htmlFor="1" className='mt-2'> Bank Name</label>
                            <input type="text" className="form-control" id="1" placeholder="Enter Bank name" name='bank_name' onChange={InputEvent} value={account.bank_name} onBlur={handleBankNameValidate} autoComplete='off' />
                            {bank_name_error && <small id="emailHelp" className="form-text error">{bank_name_error}</small>}
                        </div>
                    </div>
                    <div className="col-md-4 pr-md-2 pl-md-2">
                        <div className="form-group">
                            <label htmlFor="6" className='mt-2'> Branch Name</label>
                            <input type="text" className="form-control" id="6" placeholder="Enter Branch name" name='branch_name' onChange={InputEvent} value={account.branch_name} onBlur={handleBranchNameValidate} autoComplete='off' />
                            {branch_name_error && <small id="emailHelp" className="form-text error">{branch_name_error}</small>}
                        </div>
                    </div>
                    <div className="col-md-4 pr-md-2 pl-md-2">
                        <div className="form-group">
                            <label htmlFor="3" className='mt-2'>Account Holder Name</label>
                            <input type="text" className="form-control text-capitalize" id="3" placeholder="Enter Account Holder name" name='name' onChange={InputEvent} value={account.name} onBlur={handlenameValidate} autoComplete='off' />
                            {name_error && <small id="emailHelp" className="form-text error">{name_error}</small>}
                        </div>
                    </div>
                    {error.length !== 0 && 
                    <div className="col-12 pr-md-2 pl-md-2">
                        <ErrorComponent errors={error}/>
                    </div>}
                    <div className="col-12 pr-md-2 pl-md-2">
                        <div className="submit-section d-flex justify-content-between pb-3">
                            <button className=" btn btn-gradient-primary" type='submit' onClick={HandleSubmit}>Save</button>
                            <button className="btn btn-light" onClick={BackBtn}>{pathname.toLocaleLowerCase().includes('/employees') ? "Back" : "Cancel"}</button>
                        </div>
                    </div>
                </div>
            </form>
            {isLoading && <Spinner />}
        </>

    )
}

export default AccountForm;
