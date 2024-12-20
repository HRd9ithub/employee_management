/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Dropdown, Form, Modal } from 'react-bootstrap';
import Select from 'react-select';
import { AppProvider } from '../../context/RouteContext';
import { GetLocalStorage } from '../../../service/StoreLocalStorage';
import Spinner from '../../common/Spinner';
import { customAxios } from '../../../service/CreateApi';
import toast from 'react-hot-toast';
import ErrorComponent from '../../common/ErrorComponent';
import { reWritePrompt } from '../../../helper/prompt';
import { SpellCheck } from '../../ai/SpellCheck';

const AddUpdateNoteModal = ({ noteData, getNoteRecord }) => {
  const [modalShow, setModalShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [accessEmployee, setAccessEmployee] = useState(null);
  const [note, setNote] = useState({
    title: "",
    content: ""
  });
  const [titleError, setTitleError] = useState("");
  const [ContentError, setContentError] = useState("");
  const [error, setError] = useState([]);

  let { get_username, userName, Loading } = useContext(AppProvider);
  const { loading, aiResponse } = SpellCheck();

  const handleShowModal = () => {
    if (noteData) {
      const { title, access, _id, note } = noteData;

      setNote({
        title,
        id: _id,
        content: note ? note : ""
      });
      if (noteData.hasOwnProperty("access")) {
        const result = access.filter((u) => u._id !== noteData.createdBy).map((elem) => {
          return { value: elem._id, label: elem.first_name.concat(" ", elem.last_name) }
        })
        setAccessEmployee(result);
      }
    }
    setModalShow(true);
  }

  const handleHideModal = (e) => {
    e && e.preventDefault();
    setModalShow(false);
    setNote({
      title: "",
      content: ""
    });
    setAccessEmployee(null);
    setTitleError("");
    setContentError("");
    setError([]);
  }

  useEffect(() => {
    if (modalShow && GetLocalStorage("token")) {
      get_username();
    }
  }, [modalShow]);

  const employeeData = useMemo(() => {
    let result = [];
    userName.forEach((val) => {
      if (val.role.toLowerCase() !== "admin" && val._id !== GetLocalStorage("user_id") && val._id !== noteData?.createdBy) {
        result.push({ value: val._id, label: val.name })
      }
    })
    return result
  }, [userName, noteData])

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setNote({ ...note, [name]: value });
  }

  const titleValidation = () => {
    if (!note.title.trim()) {
      setTitleError("Title is a required field.")
    } else {
      setTitleError("");
    }
  }
  const contentValidation = () => {
    if (!note.content.trim()) {
      setContentError("Note is a required field.")
    } else {
      setContentError("");
    }
  }

  const handleFormSubmit = (event) => {
    event.preventDefault();
    setError([]);

    titleValidation();
    contentValidation();

    if (!note.title || !note.content || titleError || ContentError) {
      return false;
    }

    const access_employee = accessEmployee?.map((val) => {
      return val.value
    })

    const payload = {
      title: note.title,
      note: note.content,
      access_employee
    }

    let url = "";
    if (noteData) {
      url = customAxios().put(`/note/${noteData._id}`, payload)
    } else {
      url = customAxios().post('/note', payload)
    }
    setIsLoading(true);

    url.then(data => {
      if (data.data.success) {
        toast.success(data.data.message);
        getNoteRecord();
        handleHideModal();
        setIsLoading(false);
      }
    }).catch((error) => {
      setIsLoading(false);
      if (!error.response) {
        toast.error(error.message);
      } else {
        if (error.response.data.message) {
          toast.error(error.response.data.message)
        } else {
          setError(error.response.data.error);
        }
      }
    })
  }

  const handleAIReWrite = () => {
    aiResponse(reWritePrompt(note.content)).then((correctedText) => {
      setNote({ ...note, content: correctedText })
    }).catch((error) => {
      toast.error(error.message);
    })
  }
  return (
    <>
      {noteData ? <Dropdown.Item className="dropdown-item" onClick={handleShowModal}><i className="fa-solid fa-pen-to-square"></i><label>Edit</label></Dropdown.Item> : <button className="btn btn-gradient-primary btn-rounded btn-fw text-center" onClick={handleShowModal}  ><i className="fa-solid fa-plus"></i>&nbsp;Add</button>}

      {/* modal  */}
      <Modal show={modalShow} animation={true} size="md" aria-labelledby="example-modal-sizes-title-sm" className='department-modal note-modal' centered>
        <Modal.Header className='small-modal'>
          <Modal.Title>{noteData ? 'Edit Note' : 'Add Note'}
          </Modal.Title>
          <p className='close-modal' onClick={handleHideModal}><i className="fa-solid fa-xmark"></i></p>
        </Modal.Header>
        <Modal.Body>
          <div className=" grid-margin stretch-card inner-pages mb-lg-0">
            <div className="card">
              <div className="card-body">
                <form className="forms-sample" onSubmit={handleFormSubmit}>
                  <div className="row">
                    <div className="col-md-12">
                      <div className="form-group mb-2">
                        <label htmlFor="title" className='mt-2'>Title</label>
                        <input type="text" autoComplete='off' className="form-control" id="title" placeholder="Title" name='title' value={note.title} onChange={handleFormChange} onBlur={titleValidation} />
                        {titleError && <small id="title" className="form-text error">{titleError}</small>}
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div className="form-group mb-2">
                        <label htmlFor="note" className='mt-3'>Note</label>
                        <div className='position-relative'>
                          <Form.Control as="textarea" rows={6} className="form-control" id="content" name='content' value={note.content} onChange={handleFormChange} placeholder="Take a note..." onBlur={contentValidation} />
                          {note?.content?.length > 3 && <button className='ai-button' type='button' onClick={handleAIReWrite} title='Improve it' disabled={loading} style={{ zIndex: 0 }} ><i className="fa-solid fa-wand-magic-sparkles"></i></button>}
                          {ContentError && <small id="title" className="form-text error">{ContentError}</small>}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div className="form-group mb-2">
                        <label htmlFor="title" className='mt-3'>Employee</label>
                        <Select className='employee-multiple-select'
                          options={employeeData}
                          isMulti
                          placeholder="select employee"
                          value={accessEmployee}
                          onChange={setAccessEmployee}
                        />
                      </div>
                    </div>
                    {error.length !== 0 &&
                      <div className="col-12 pl-md-2 pr-md-2">
                        <ErrorComponent errors={error} />
                      </div>
                    }
                  </div>
                  <div className='d-flex justify-content-center modal-button mt-3'>
                    <button type="submit" className="btn btn-gradient-primary mr-2" >{noteData ? 'Update' : 'Save'}</button>
                    <button className="btn btn-light" onClick={handleHideModal} >Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </Modal.Body>
        {(Loading || isLoading) && <Spinner />}

      </Modal>
    </>
  )
}

export default AddUpdateNoteModal