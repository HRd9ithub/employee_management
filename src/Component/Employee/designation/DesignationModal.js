import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Spinner from "../../common/Spinner";
import { toast } from "react-hot-toast";
import { customAxios } from "../../../service/CreateApi";
import { alphSpaceFormat } from "../../common/RegaulrExp";

function DesignationModal({ data, getdesignation, permission }) {
  const [show, setShow] = useState(false);
  const [isLoading, setisLoading] = useState(false);
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [id, setId] = useState("");
  const [error, setError] = useState("");

  // modal show function
  const handleShow = () => {
    if (data) {
      setName(data.name);
      setId(data._id);
    }
    setShow(true);
  };

  // modal close function
  const handleClose = (e) => {
    e.preventDefault();
    setShow(false);
    setName("");
    setNameError("");
    setId("");
    setError("");
  };

  // onchange function
  const InputEvent = (e) => {
    let { value } = e.target;

    setName(value);
    setError("")
  };

  // designation name field validation function
  const handlenameValidate = () => {
    if (!name) {
      setNameError("Designation name is a required field.");
    } else if (!name.trim() || !name.match(alphSpaceFormat)) {
      setNameError("Designation name must be an alphabet and space only..");
    } else {
      setNameError("");
    }
  };

  // submit function
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nameError) {
      handlenameValidate();
    }
    setError("");
    let url = "";

    if (!name || nameError) {
      return false;
    }
    if (id) {
      url = customAxios().patch(`/designation/${id}`, { name: name.charAt(0).toUpperCase() + name.slice(1) })
    } else {
      url = customAxios().post('/designation/', { name: name.charAt(0).toUpperCase() + name.slice(1) })
    }
    setisLoading(true);

    url.then((data) => {
      if (data.data.success) {
        setShow(false)
        toast.success(data.data.message)
        getdesignation();
        setName("")
        setId('');
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
    }).finally(() => setisLoading(false));
  };


  return (
    <>
      {data ? <i className="fa-solid fa-pen-to-square" onClick={handleShow} ></i>
        : permission && permission.permissions.create === 1 &&
        <button
          className="btn btn-gradient-primary btn-rounded btn-fw text-center "
          onClick={handleShow}
        >
          <i className="fa-solid fa-plus"></i>&nbsp;Add
        </button>
      }
      <Modal
        show={show}
        animation={true}
        size="md"
        aria-labelledby="example-modal-sizes-title-sm"
        className="department-modal"
        centered
      >
        <Modal.Header className="small-modal">
          <Modal.Title>
            {data ? "Edit Designation" : "Add Designation"}
          </Modal.Title>
          <p className="close-modal" onClick={handleClose}>
            <i className="fa-solid fa-xmark"></i>
          </p>
        </Modal.Header>
        <Modal.Body>
          <div className=" grid-margin stretch-card inner-pages mb-lg-0">
            <div className="card">
              <div className="card-body">
                <form className="forms-sample">
                  <div className="form-group">
                    <label htmlFor="exampleInputfname" className="mt-3">Designation Name</label>
                    <input
                      type="text"
                      className="form-control text-capitalize"
                      id="exampleInputfname"
                      placeholder="Enter Designation name"
                      name="name"
                      value={name}
                      onChange={InputEvent}
                      onBlur={handlenameValidate}
                    />
                    {(nameError || error) && (<small id="emailHelp" className="form-text error">{nameError || error}</small>)}
                  </div>
                  <div className="d-flex justify-content-center modal-button">
                    <button
                      type="submit"
                      className="btn btn-gradient-primary mr-2"
                      onClick={handleSubmit}
                    >{data ? "Update" : "Save"}</button>
                    <button className="btn btn-light" onClick={handleClose}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          {isLoading && <Spinner />}
        </Modal.Body>
      </Modal>
    </>
  );
}

export default DesignationModal;
