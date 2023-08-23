import axios from "axios";
import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import { toast } from "react-toastify";
import Spinner from "../../common/Spinner";
import GlobalPageRedirect from "../../auth_context/GlobalPageRedirect";
import { GetLocalStorage } from "../../../service/StoreLocalStorage";

function DesignationModal({ data, getdesignation, accessData, user, records }) {
  const [show, setShow] = useState(false);
  const [loader, setloader] = useState(false);
  const [list, setList] = useState({
    name: "",
  });
  const [nameError, setNameError] = useState("");
  const [id, setId] = useState("");
  const [error, setError] = useState([]);
  let toggleButton = false;

  let { getCommonApi } = GlobalPageRedirect();

  // modal show function
  const handleShow = () => {
    if (data) {
      setList({
        name: data.name,
        department_id: data.department_id,
      });
      setId(data.id);
    }
    setShow(true);
  };

  // modal close function
  const handleClose = (e) => {
    e.preventDefault();
    setShow(false);
    setList({
      name: "",
    });
    setNameError("");
  };

  // onchange function
  const InputEvent = (e) => {
    let { name, value } = e.target;

    if (name === "name") {
      if (list.name < 1) {
        value = value.toUpperCase();
      }
    }

    setList({ ...list, [name]: value });
  };

  // designation name field validation function
  const handlenameValidate = () => {
    if (!list.name) {
      setNameError("Designation name is required.");
    } else if (!list.name.trim() || !list.name.match(/^[A-Za-z ]+$/)) {
      setNameError("Please enter a valid designation name.");
    } else if (list.name.match(/^[A-Za-z ]+$/)) {
      let temp = records.findIndex((val) => {
        return val.name.trim().toLowerCase() === list.name.trim().toLowerCase();
      });
      if (temp === -1 || (data && data.name.trim().toLowerCase() === list.name.trim().toLowerCase())) {
        setNameError("");
      } else {
        setNameError("The designation name already exists. ");
      }
    }
  };

  // submit function
  const handleSubmit = (e) => {
    e.preventDefault();
    handlenameValidate();
    if (!list.name) {
      return false;
    }
    if (!nameError) {
      setError([]);
      if (id) {
        setloader(true);
        // data edit api call
        let { name } = list;
        let token = GetLocalStorage("token");
        const request = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        };

        axios.post(`${process.env.REACT_APP_API_KEY}/designation/update`, { name: name.charAt(0).toUpperCase() + name.slice(1), id }, request).then((data) => {
          if (data.data.success) {
            setloader(false)
            toast.success("Successfully edited a designation.");
            setShow(false);
            getdesignation();
            setList({
              name: "",
            })
            setId("")
          } else {
            setloader(false)
            toast.error(data.data.message.name[0]);
          }
        }).catch((error) => {
          setloader(false)
          console.log("🚀 ~ file: DesignationModal.js:132 ~ handleSubmit ~ error:", error);
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
        });
      } else {
        setloader(true);
        // add data api call
        let token = GetLocalStorage("token");
        const request = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        };
        axios.post(`${process.env.REACT_APP_API_KEY}/designation/add`, { name: list.name.charAt(0).toUpperCase() + list.name.slice(1) }, request).then((data) => {
          if (data.data.success) {
            setloader(false);
            toast.success("Successfully edited a new designation.");
            setShow(false);
            getdesignation();
            setList({
              name: "",
            })
          } else {
            setloader(false);
            toast.error(data.data.message.name[0]);
          }
        }).catch((error) => {
          setloader(false);
          console.log("🚀 ~ file: DesignationModal.js:155 ~ handleSubmit ~ error:", error);
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
        });
      }
    }
  };

  // button toggle diable or not
  if (user.toLowerCase() !== "admin") {
    if (accessData.length !== 0 && accessData[0].create === "1") {
      toggleButton = false;
    } else {
      toggleButton = true;
    }
  } else {
    toggleButton = false;
  }

  return (
    <>
      {data ?<i className="fa-solid fa-pen-to-square" onClick={handleShow} ></i>
        :   (user.toLowerCase() === 'admin' || (accessData.length !== 0 && accessData[0].create === "1")) &&
          <button
            className="btn btn-gradient-primary btn-rounded btn-fw text-center "
            disabled={toggleButton}
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
        className="small-modal department-modal"
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
                      value={list.name}
                      onChange={InputEvent}
                      onKeyUp={handlenameValidate}
                    />
                    {nameError && (<small id="emailHelp" className="form-text error">{nameError}</small>)}
                  </div>
                  <ol>
                    {error.map((val) => {
                      return <li className="error" key={val}>{val}</li>
                    })}
                  </ol>
                  <div className="d-flex justify-content-end modal-button">
                    <button
                      type="submit"
                      className="btn btn-gradient-primary mr-2"
                      onClick={handleSubmit}
                    >{data ? "Update" : "Submit"}</button>
                    <button className="btn btn-light" onClick={handleClose}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          {loader && <Spinner />}
        </Modal.Body>
      </Modal>
    </>
  );
}

export default DesignationModal;
