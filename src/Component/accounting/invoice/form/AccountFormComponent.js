import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { customAxios } from '../../../../service/CreateApi';
import { alphSpaceFormat, alphaNumFormat, numberFormat } from "../../../common/RegaulrExp";
import { Modal } from 'react-bootstrap';
import Spinner from '../../../common/Spinner';
import ErrorComponent from '../../../common/ErrorComponent';

const AccountFormComponent = ({ bankDetail, getSingleAccountDetail }) => {
  const [account, setAccount] = useState({
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    user_id: '',
    name: '',
    branch_name: ''
  });
  const [bankAllDetail, setbankAllDetail] = useState([]);
  const [bankId, setBankId] = useState("");
  const [bank_name_error, setBank_name_error] = useState('')
  const [account_number_error, setaccount_number_error] = useState('')
  const [ifsc_code_error, setifsc_code_error] = useState('')
  const [branch_name_error, setbranch_name_error] = useState('');
  const [name_error, setname_error] = useState('')
  const [isLoading, setisLoading] = useState(false);
  const [error, setError] = useState([]);
  const [show, setShow] = useState(false);

  // modal show function
  const handleShow = () => {
    if (bankDetail) {
      setAccount({
        bank_name: bankDetail.bank,
        account_number: bankDetail.account_number,
        ifsc_code: bankDetail.ifsc_code,
        name: bankDetail.name,
        branch_name: bankDetail.branch_name,
        _id: bankDetail._id
      });
      setBankId(bankDetail._id)
    }
    setShow(true);
  }

  // modal close function
  const handleClose = (e) => {
    e.preventDefault();
    setShow(false);
    setAccount({
      bank_name: '',
      account_number: '',
      ifsc_code: '',
      user_id: '',
      name: '',
      branch_name: ''
    });
    setBank_name_error('')
    setaccount_number_error('')
    setifsc_code_error('')
    setbranch_name_error('');
    setname_error('')
  }

  const getAccountDetail = async () => {
    setisLoading(true);

    customAxios().get(`invoice/account`).then((res) => {
      if (res.data.success) {
        const { data } = res.data;
        setbankAllDetail(data);
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
    if (show) {
      getAccountDetail();
    }
  }, [show])

  /*  -------------------------------
      form function
  ----------------------------------- */

  // onchange function
  const InputEvent = (event) => {
    let { value, name } = event.target

    setAccount({ ...account, [name]: value })
  }

  const handleAccount = (event) => {
    if (event.target.value) {
      const data = bankAllDetail.find((val) => {
        return val._id === event.target.value;
      })
      setAccount({
        bank_name: data.bank,
        account_number: data.account_number,
        ifsc_code: data.ifsc_code,
        name: data.name,
        branch_name: data.branch_name,
        _id: data._id
      });
      setBankId(data._id)
    } else {
      setAccount({
        bank_name: '',
        account_number: '',
        ifsc_code: '',
        name: '',
        branch_name: ''
      })
      setBankId("")
    }
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
    if (bankId) {
      url = customAxios().put(`/invoice/account/${_id}`, {
        bank: bank_name,
        account_number: account_number,
        ifsc_code: ifsc_code,
        branch_name: branch_name,
        name: name,
        status: true
      });
    } else {
      url = customAxios().post('/invoice/account/', {
        bank: bank_name,
        account_number: account_number,
        ifsc_code: ifsc_code,
        branch_name: branch_name,
        name: name,
      });
    }
    url.then((result) => {
      if (result.data.success) {
        getSingleAccountDetail();
        setShow(false);
        toast.success(result.data.message);
        setAccount({
          bank_name: '',
          account_number: '',
          ifsc_code: '',
          user_id: '',
          name: '',
          branch_name: ''
        });
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


  // number encrypt 
  const obscurenumber = (no) => {
    const length = no.length;
    const sliceno = no.slice(length - 5);
    return sliceno.padStart(length, "✶");
  };

  return (
    <>
      {bankDetail ?
        <button type="button" className="btn btn-gradient-primary btn-rounded btn-fw text-center button-full-width" onClick={handleShow} >
          <i className="fa-solid fa-gear"></i>&nbsp;Edit Bank Details
        </button> :
        <button type="button" className="btn btn-gradient-primary btn-rounded btn-fw text-center button-full-width" onClick={handleShow} >
          <i className="fa-solid fa-gear"></i>&nbsp;Add Bank Details
        </button>}
      <Modal show={show} animation={true} size="md" aria-labelledby="example-modal-sizes-title-sm" centered>
        <Modal.Header className='small-modal'>
          <Modal.Title>Bank Detail</Modal.Title>
          <p className='close-modal' onClick={handleClose}><i className="fa-solid fa-xmark"></i></p>
        </Modal.Header>
        <Modal.Body>
          <div className=" grid-margin stretch-card inner-pages mb-lg-0">
            <div className="card">
              <div className="card-body">
                <form className="forms-sample">
                  <div className="row pt-2">
                    {bankDetail &&
                      <div className="col-md-12 pr-md-2 pl-md-2">
                        <div className="form-group">
                          <label htmlFor="2" className='mt-2'>Select Bank Account</label>
                          <select className="form-control" onChange={handleAccount} value={bankId}>
                            {bankAllDetail.map((val) => {
                              return (
                                <option value={val._id} key={val._id}>{obscurenumber(val.account_number)} ({val.bank})</option>
                              )
                            })}
                            <option value="">Add New Account</option>
                          </select>
                        </div>
                      </div>}
                    <div className="col-md-6 pr-md-2 pl-md-2">
                      <div className="form-group">
                        <label htmlFor="2" className='mt-2'>Account Number</label>
                        <input type="text" className="form-control" id="2" maxLength={18} placeholder="Enter account number" name='account_number' onChange={InputEvent} value={account.account_number} onBlur={handleAccountNumberValidate} autoComplete='off' />
                        {account_number_error && <small id="emailHelp" className="form-text error">{account_number_error}</small>}
                      </div>
                    </div>
                    <div className="col-md-6 pr-md-2 pl-md-2">
                      <div className="form-group">
                        <label htmlFor="3" className='mt-2'>IFSC Code</label>
                        <input type="text" className="form-control" id="3" placeholder="Enter IFSC" name='ifsc_code' maxLength={11} onChange={InputEvent} value={account.ifsc_code} onBlur={handleIfscCodeValidate} autoComplete='off' />
                        {ifsc_code_error && <small id="emailHelp" className="form-text error">{ifsc_code_error}</small>}
                      </div>
                    </div>
                    <div className="col-md-6 pr-md-2 pl-md-2">
                      <div className="form-group">
                        <label htmlFor="1" className='mt-2'> Bank Name</label>
                        <input type="text" className="form-control" id="1" placeholder="Enter Bank name" name='bank_name' onChange={InputEvent} value={account.bank_name} onBlur={handleBankNameValidate} autoComplete='off' />
                        {bank_name_error && <small id="emailHelp" className="form-text error">{bank_name_error}</small>}
                      </div>
                    </div>
                    <div className="col-md-6 pr-md-2 pl-md-2">
                      <div className="form-group">
                        <label htmlFor="6" className='mt-2'> Branch Name</label>
                        <input type="text" className="form-control" id="6" placeholder="Enter Branch name" name='branch_name' onChange={InputEvent} value={account.branch_name} onBlur={handleBranchNameValidate} autoComplete='off' />
                        {branch_name_error && <small id="emailHelp" className="form-text error">{branch_name_error}</small>}
                      </div>
                    </div>
                    <div className="col-md-12 pr-md-2 pl-md-2">
                      <div className="form-group">
                        <label htmlFor="3" className='mt-2'>Account Holder Name</label>
                        <input type="text" className="form-control text-capitalize" id="3" placeholder="Enter Account Holder name" name='name' onChange={InputEvent} value={account.name} onBlur={handlenameValidate} autoComplete='off' />
                        {name_error && <small id="emailHelp" className="form-text error">{name_error}</small>}
                      </div>
                    </div>
                    {error.length !== 0 &&
                      <div className="col-12 pl-md-2 pr-md-2">
                        <ErrorComponent errors={error} />
                      </div>}
                    <div className="col-12">
                      <div className="submit-section d-flex justify-content-between pb-3">
                        <button className=" btn btn-gradient-primary" type='submit' onClick={HandleSubmit}>Save</button>
                        <button className="btn btn-light" onClick={handleClose} >Cancel</button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </Modal.Body>
        {isLoading && <Spinner />}
      </Modal>
    </>
  )
}

export default AccountFormComponent;
