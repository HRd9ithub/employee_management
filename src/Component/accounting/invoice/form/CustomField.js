import React, { useState } from 'react'
import Modal from 'react-bootstrap/Modal';
import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";

const CustomField = ({ setCustomFieldData, customFieldData }) => {
  let initialValue = {
    name: "",
    value: ""
  }
  const [modalShow, setModalShow] = useState(false);
  const [customField, setCustomField] = useState(initialValue);
  const [nameError, setNameError] = useState("");
  const [valueError, setValueError] = useState("");

  // *-------------------- modal show and hide ----------------------------
  // show modal 
  const showModal = () => {
    setModalShow(true);
  }

  // hide modal function
  const onHideModal = (e) => {
    if (e) {
      e.preventDefault();
    }
    setModalShow(false);
    setCustomField(initialValue);
    setValueError("")
    setNameError("")
  }

  // -------------  form function -------------------------

  // change function
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomField({ ...customField, [name]: value });
  }

  const handleSubmit = (event) => {
    event?.preventDefault();
    fieldNameValidation();
    fieldValueValidation();

    if (!customField.name || !customField.value || nameError || valueError) {
      return false;
    }

    setCustomFieldData([...customFieldData, customField]);
    onHideModal();
  }

  const fieldNameValidation = () => {
    if (!customField.name.trim()) {
      setNameError("Field Name is a required.");
    } else {
      setNameError("");
    }
  }
  const fieldValueValidation = () => {
    if (!customField.value.trim()) {
      setValueError("Field value is a required.");
    } else {
      setValueError("");
    }
  }

  return (
    <>
      <button className='btn add-client-button button-full-width' type='button' onClick={showModal}><i className="fa-solid fa-circle-plus"></i>Add New Custom Fields</button>
      <Modal
        show={modalShow}
        onHide={onHideModal}
        size="md"
        backdrop="static"
        keyboard={false}
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton className='small-modal'>
          <Modal.Title id="contained-modal-title-vcenter">
            Add Custom Field
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className=" grid-margin stretch-card inner-pages mb-lg-0">
            <div className="card">
              <div className="card-body">
                <form className="forms-sample" >
                  <div className="row">

                    <div className="col-md-12 pr-md-2 pl-md-2">
                      <div className="form-group">
                        <label htmlFor="field_name">Field Name</label>
                        <input type="text" className="form-control text-capitalize" id="field_name" placeholder="Enter Field Name" name="name" value={customField.name} onChange={handleChange} onBlur={fieldNameValidation} />
                        {nameError && <small id="name" className="form-text error">{nameError}</small>}
                      </div>
                    </div>
                    <div className="col-md-12 pr-md-2 pl-md-2">
                      <div className="form-group">
                        <label htmlFor="field_value">Field Value</label>
                        <input type="text" className="form-control text-capitalize" id="field_value" placeholder="Enter Field Name" name="value" value={customField.value} onChange={handleChange} onBlur={fieldValueValidation} />
                        {valueError && <small id="name" className="form-text error">{valueError}</small>}
                      </div>
                    </div>
                  </div>
                  <div className='d-flex justify-content-center modal-button'>
                    <button type="submit" className="btn btn-gradient-primary mr-2" onClick={handleSubmit} > Save</button>
                    <button className="btn btn-light" onClick={onHideModal}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  )
}

export default CustomField
