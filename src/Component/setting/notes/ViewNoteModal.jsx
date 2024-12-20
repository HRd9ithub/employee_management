import React, { useState } from 'react'
import { Dropdown, Modal } from 'react-bootstrap'
import { GetLocalStorage } from '../../../service/StoreLocalStorage';

const ViewNoteModal = ({ noteData, permission }) => {
  const [modalShow, setModalShow] = useState(false);

  const handleShowModal = () => {
    setModalShow(true);
  }

  const handleHideModal = (e) => {
    e && e.preventDefault();
    setModalShow(false);
  }
  return (
    <>
      <Dropdown.Item onClick={handleShowModal} ><i className="fa-solid fa-eye"></i><label>View</label></Dropdown.Item>
      {/* modal  */}
      <Modal show={modalShow} animation={true} size="md" aria-labelledby="example-modal-sizes-title-sm" className='department-modal password-modal' centered>
        <Modal.Header className='small-modal'>
          <Modal.Title>Preview</Modal.Title>
          <p className='close-modal' onClick={handleHideModal}><i className="fa-solid fa-xmark"></i></p>
        </Modal.Header>
        <Modal.Body>
          <div className=" grid-margin stretch-card inner-pages mb-lg-0" >
            <div className='card'>
              <div className="card-body pb-4">
                <h3>{noteData.title}</h3>
                <div>
                  <pre className='mb-0 py-2 px-0' style={{ background: "transparent", whiteSpace: "break-spaces" }} >{noteData.note}</pre>
                </div>
                {permission && (permission?.name.toLowerCase() === "admin" || noteData.createdBy === GetLocalStorage("user_id")) && noteData.hasOwnProperty("access") && noteData.access.length !== 0 &&
                  <div className="access-employee-list mt-4">
                    <h3>Access Employee List:</h3>
                    <div className="row mt-3" style={{ rowGap: "10px" }} >
                      {noteData.hasOwnProperty("access") && noteData.access.map((item, index) => (
                        <div className="col-md-4 col-sm-6" key={item._id}><span className='pr-2'>{index + 1}.</span> <label className='mb-0'>{item?.first_name.concat(" ", item.last_name)}</label></div>
                      ))}
                    </div>
                  </div>}
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  )
}

export default ViewNoteModal