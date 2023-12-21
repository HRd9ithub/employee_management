import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { motion } from "framer-motion";
import Spinner from '../../../common/Spinner';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { customAxios } from '../../../../service/CreateApi';
import { alphSpaceFormat, alphaNumFormat, numberFormat } from "../../../common/RegaulrExp";
import Error500 from '../../../error_pages/Error500';
import Error403 from '../../../error_pages/Error403';

const AccountFormComponent = (props) => {
  // let { userDetail, handleClose, getEmployeeDetail, getuser } = props;
  const [account, setAccount] = useState({
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    user_id: '',
    name: '',
    branch_name: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [bank_name_error, setBank_name_error] = useState('')
  const [account_number_error, setaccount_number_error] = useState('')
  const [ifsc_code_error, setifsc_code_error] = useState('')
  const [branch_name_error, setbranch_name_error] = useState('');
  const [name_error, setname_error] = useState('')
  const [isLoading, setisLoading] = useState(false);
  const [error, setError] = useState([]);
  const [serverError, setServerError] = useState(false);
  const [permission, setPermission] = useState("");

  const history = useNavigate();

  const { id } = useParams();

  /*  -------------------------------
      get data in database
  ----------------------------------- */

  const getAccountDetail = async () => {
    setServerError(false)
    setisLoading(true);

    customAxios().get(`invoice/account/${id}`).then((res) => {
      if (res.data.success) {
        const { data, permissions } = res.data;
        if (data) {
          const { bank, account_number, ifsc_code, branch_name, name, _id } = data;
          setAccount({
            bank_name: bank,
            account_number: account_number,
            ifsc_code: ifsc_code,
            name: name,
            branch_name: branch_name,
            _id: _id
          });
          setIsEditing(true)
        }
        setPermission(permissions)
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
    getAccountDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /*  -------------------------------
      form function
  ----------------------------------- */

  // onchange function
  const InputEvent = (event) => {
    let { value, name } = event.target

    setAccount({ ...account, [name]: value })
  }

  // bank name validation
  const handleBankNameValidate = () => {
    if (!account.bank_name) {
      setBank_name_error("Bank name is a required field.")
    } else if (!account.bank_name.match(alphSpaceFormat) || account.bank_name.trim().length <= 0) {
      setBank_name_error("Bank name must be an alphabet and space only.")
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
    } else if (account.account_number.toString().length < 12) {
      setaccount_number_error("Your account number must be 12 characters.")
    }
    else {
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

  /*  -------------------------------
        submit function
  ----------------------------------- */

  // submit function
  const HandleSubmit = async (e) => {
    e.preventDefault();
    handleBankNameValidate();
    handleAccountNumberValidate();
    handleIfscCodeValidate();
    handlenameValidate();
    handleBranchNameValidate();
    setError([]);

    const { bank_name, account_number, ifsc_code, name, _id, branch_name } = account;
    if (!bank_name || !account_number || !ifsc_code || !name || !branch_name) {
      return false
    }
    if (bank_name_error || account_number_error || ifsc_code_error || name_error || branch_name_error) {
      return false
    }

    let url = "";
    setisLoading(true);
    if (isEditing) {
      url = customAxios().put(`/invoice/account/${_id}`, {
        bank: bank_name,
        account_number: account_number,
        ifsc_code: ifsc_code,
        branch_name: branch_name,
        name: name,
        invoice_id: id
      });
    } else {
      url = customAxios().post('/invoice/account/', {
        bank: bank_name,
        account_number: account_number,
        ifsc_code: ifsc_code,
        branch_name: branch_name,
        name: name,
        invoice_id: id
      });
    }
    url.then((result) => {
      if (result.data.success) {
        toast.success(result.data.message);
        history(`/invoice/preview/${id}`);
        setAccount({
          bank_name: '',
          account_number: '',
          ifsc_code: '',
          user_id: '',
          name: '',
          branch_name: ''
        });
        setIsEditing(false);
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

  if (isLoading) {
    return <Spinner />
  } else if (serverError) {
    return <Error500 />
  }else if (!permission || permission.name.toLowerCase() !== "admin") {
    return <Error403 />;
}

  return (
    <>
      <motion.div className="box" initial={{ opacity: 0, transform: "translateY(-20px)" }} animate={{ opacity: 1, transform: "translateY(0px)" }} transition={{ duration: 0.5 }}>
        <div className=" container-fluid pt-4">
          <div className="background-wrapper bg-white pt-4">
            {/* ====================== breadcrumb */}
            <div>
              <div className='row justify-content-start align-items-center row-std m-0'>
                <div className="col-12 col-sm-8 d-flex justify-content-between align-items-center">
                  <div>
                    <ul id="breadcrumb" className="mb-0">
                      <li><NavLink to="/" className="ihome">Dashboard</NavLink></li>
                      <li><NavLink to="/invoice" className="ibeaker"><i className="fa-solid fa-play"></i> &nbsp; Invoice</NavLink></li>
                      <li><NavLink to="" className="ibeaker"><i className="fa-solid fa-play"></i> &nbsp; Payment</NavLink></li>
                    </ul>
                  </div>
                </div>

              </div>
            </div>
            <form className="forms-sample px-4">
              <div className="row py-4">
                <div className="col-md-4">
                  <div className="form-group mb-0">
                    <label htmlFor="2" className='mt-2'>Select Bank Account</label>
                    <select className="form-control">
                      <option value="">Select Bank Account</option>
                      <option value="testuser">Test User</option>
                      <option value="testuser">Test User</option>
                      <option value="testuser">Test User</option>
                    </select>
                  </div>
                </div>
              </div>
              <hr className="my-0"/>
              <div className="row py-4">
                <div className="col-md-4">
                  <div className="form-group">
                    <label htmlFor="2" className='mt-2'>Account Number</label>
                    <input type="text" className="form-control" id="2" maxLength={18} placeholder="Enter account number" name='account_number' onChange={InputEvent} value={account.account_number} onBlur={handleAccountNumberValidate} autoComplete='off' />
                    {account_number_error && <small id="emailHelp" className="form-text error">{account_number_error}</small>}
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group">
                    <label htmlFor="3" className='mt-2'>IFSC Code</label>
                    <input type="text" className="form-control" id="3" placeholder="Enter IFSC" name='ifsc_code' maxLength={11} onChange={InputEvent} value={account.ifsc_code} onBlur={handleIfscCodeValidate} autoComplete='off' />
                    {ifsc_code_error && <small id="emailHelp" className="form-text error">{ifsc_code_error}</small>}
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group">
                    <label htmlFor="1" className='mt-2'> Bank Name</label>
                    <input type="text" className="form-control" id="1" placeholder="Enter Bank name" name='bank_name' onChange={InputEvent} value={account.bank_name} onBlur={handleBankNameValidate} autoComplete='off' />
                    {bank_name_error && <small id="emailHelp" className="form-text error">{bank_name_error}</small>}
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group">
                    <label htmlFor="6" className='mt-2'> Branch Name</label>
                    <input type="text" className="form-control" id="6" placeholder="Enter Branch name" name='branch_name' onChange={InputEvent} value={account.branch_name} onBlur={handleBranchNameValidate} autoComplete='off' />
                    {branch_name_error && <small id="emailHelp" className="form-text error">{branch_name_error}</small>}
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group">
                    <label htmlFor="3" className='mt-2'>Account Holder Name</label>
                    <input type="text" className="form-control text-capitalize" id="3" placeholder="Enter Account Holder name" name='name' onChange={InputEvent} value={account.name} onBlur={handlenameValidate} autoComplete='off' />
                    {name_error && <small id="emailHelp" className="form-text error">{name_error}</small>}
                  </div>
                </div>
                {error.length !== 0 &&
                  <div className="col-12">
                    <ol>
                      {error.map((elem) => {
                        return <li className='error' key={elem}>{elem}</li>
                      })}
                    </ol>
                  </div>}
                <div className="col-12">
                  <div className="submit-section d-flex justify-content-between pb-3">
                    <button className=" btn btn-gradient-primary" type='submit' onClick={HandleSubmit}>Save</button>
                    <button className="btn btn-light" onClick={() => history(`/invoice/preview/${id}`)} >Skip</button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </>
  )
}

export default AccountFormComponent;
