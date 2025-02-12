import React, { useState } from 'react'
import { Dropdown, Modal } from 'react-bootstrap'

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
                  <div className='mb-0 py-2 px-0' style={{ background: "transparent" }} dangerouslySetInnerHTML={{ __html: noteData.note }}></div>
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  )
}

export default ViewNoteModal