import React from 'react';
import Modal from "react-bootstrap/Modal";
import PropTypes from 'prop-types';
import PersonalDetailForm from '../Employee/Employees/form_user/PersonalDetailForm';
import AccountForm from "../Employee/Employees/form_user/AccountForm"
import EductionForm from '../Employee/Employees/form_user/EductionForm';
import EmergencyForm from '../Employee/Employees/form_user/EmergencyForm';
import UserDoumentForm from '../Employee/Employees/form_user/userDoumentForm';

const EmployeeModal = ({ show, handleClose, value, data, getuser }) => {
  return (
    <>
      {/* view modal */}
      <Modal
        show={show}
        animation={true}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
        size="lg"
        className="employee-view-modal"
        centered
      >

        <Modal.Header className='small-modal department-modal'>
          <Modal.Title>{value} Information</Modal.Title>
          <p className='close-modal' onClick={handleClose}><i className="fa-solid fa-xmark"></i></p>
        </Modal.Header> 
        <Modal.Body>
          <div className=" grid-margin stretch-card inner-pages mb-lg-0">
            <div className="card">
              <div className={`card-body ${value === 'Education' ? 'set-padding' : ''}`}>
                {value === "Personal" ?
                  <PersonalDetailForm userDetail={data} handleClose={handleClose} getuser={getuser} value={value} />
                  :
                  value === "Account"
                    ?
                    <AccountForm userDetail={data} handleClose={handleClose} getuser={getuser} />
                    :
                    value === "Education" ?
                      <>
                        <EductionForm userDetail={data} handleClose={handleClose} getuser={getuser} />
                      </>
                      : value === "Emergency Contact" ?
                        <>
                          <EmergencyForm userDetail={data} handleClose={handleClose} getuser={getuser} />
                        </>
                        : value === "Document" ?
                          <UserDoumentForm userDetail={data} handleClose={handleClose} getuser={getuser} value={value} />
                          : 
                          <>
                            <PersonalDetailForm userDetail={data} handleClose={handleClose} getuser={getuser} value={value} />
                          </>
                }
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  )
}

EmployeeModal.propTypes = {
  show: PropTypes.bool,
  handleClose: PropTypes.func,
  value: PropTypes.string,
  getuser: PropTypes.func
}

export default EmployeeModal