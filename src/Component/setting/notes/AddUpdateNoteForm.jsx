/* eslint-disable react-hooks/exhaustive-deps */
import { NavLink, useNavigate, useParams } from 'react-router-dom'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Form } from 'react-bootstrap';
import Select from 'react-select';
import { AppProvider } from '../../context/RouteContext';
import { GetLocalStorage } from '../../../service/StoreLocalStorage';
import Spinner from '../../common/Spinner';
import { customAxios } from '../../../service/CreateApi';
import toast from 'react-hot-toast';
import ErrorComponent from '../../common/ErrorComponent';
import { reWritePrompt } from '../../../helper/prompt';
import { SpellCheck } from '../../ai/SpellCheck';
import Error500 from '../../error_pages/Error500';
import Error403 from '../../error_pages/Error403';
const AddUpdateNoteForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [accessEmployee, setAccessEmployee] = useState(null);
  const [note, setNote] = useState({
    title: "",
    content: ""
  });
  const [titleError, setTitleError] = useState("");
  const [ContentError, setContentError] = useState("");
  const [error, setError] = useState([]);
  const [serverError, setServerError] = useState(false);
  const [permission, setPermission] = useState("");
  const [permissionToggle, setPermissionToggle] = useState(true);

  let { get_username, userName, Loading } = useContext(AppProvider);
  const { loading, aiResponse } = SpellCheck();

  const navigate = useNavigate();
  const { id } = useParams();

  const handleResetForm = (e) => {
    e && e.preventDefault();
    setNote({
      title: "",
      content: ""
    });
    setAccessEmployee(null);
    setTitleError("");
    setContentError("");
    setError([]);
  }

  const fetchNote = () => {
    setServerError(false);
    setIsLoading(true);
    setPermissionToggle(true);
    customAxios().get(`/note/${id}`).then((res) => {
      if (res.data.success) {
        const { permissions, data } = res.data;
        const { title, access, _id, note } = data;

        setNote({
          title,
          id: _id,
          content: note ? note : ""
        });
        if (data.hasOwnProperty("access")) {
          const result = access.filter((u) => u._id !== data.createdBy).map((elem) => {
            return { value: elem._id, label: elem.first_name.concat(" ", elem.last_name) }
          })
          setAccessEmployee(result);
        }
        setPermission(permissions);
        setIsLoading(false)
      }
    }).catch((error) => {
      setIsLoading(false)
      if (!error.response) {
        setServerError(true)
        toast.error(error.message)
      } else {
        if (error.response.status === 500) {
          setServerError(true)
        }
        if (error.response.data.message) {
          toast.error(error.response.data.message)
        }
      }
    }).finally(() => setPermissionToggle(false));
  }

  useEffect(() => {
    get_username();
  }, []);

  useEffect(() => id && fetchNote(), [id])

  const employeeData = useMemo(() => {
    let result = [];
    userName.forEach((val) => {
      // && val._id !== noteData?.createdBy
      if (val.role.toLowerCase() !== "admin" && val._id !== GetLocalStorage("user_id")) {
        result.push({ value: val._id, label: val.name })
      }
    })
    return result
  }, [userName])

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

  const handleRedirect = () => {
    navigate("/notes");
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
    if (id) {
      url = customAxios().put(`/note/${id}`, payload)
    } else {
      url = customAxios().post('/note', payload)
    }
    setIsLoading(true);

    url.then(data => {
      if (data.data.success) {
        toast.success(data.data.message);
        handleRedirect();
        handleResetForm();
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

  if (serverError && !isLoading) {
    return <Error500 />;
  } else if ((!permission || permission.permissions.list !== 1) && !permissionToggle && !isLoading) {
    return <Error403 />;
  }

  return (
    <>
      <div className="container-fluid p-4">
        <div className="background-wrapper bg-white">
          <div className='row justify-content-start align-items-center row-std remove-margin-bottom m-0 px-4'>
            <div className="col-12 col-sm-6 d-flex justify-content-between align-items-center p-0">
              <div>
                <ul id="breadcrumb" className="mb-0">
                  <li><NavLink to="/" className="ihome">Dashboard</NavLink></li>
                  <li><NavLink to="/notes" className="ibeaker"><i className="fa-solid fa-play"></i> &nbsp; Notes</NavLink></li>
                  <li><NavLink to="" className="ibeaker"><i className="fa-solid fa-play"></i> &nbsp;{id ? "Edit" : "Create"}</NavLink></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="grid-margin stretch-card inner-pages mb-lg-0 tab-view">
            <div className="card">
              <div className="card-body">
                <form className="forms-sample" onSubmit={handleFormSubmit}>
                  <div className="row">
                    <div className="col-md-6 pr-md-2 pl-md-2">
                      <div className="form-group">
                        <label htmlFor="title" className='mt-2'>Title</label>
                        <input type="text" autoComplete='off' className="form-control" id="title" placeholder="Title" name='title' value={note.title} onChange={handleFormChange} onBlur={titleValidation} />
                        {titleError && <small id="title" className="form-text error">{titleError}</small>}
                      </div>
                    </div>
                    <div className="col-md-6 pr-md-2 pl-md-2">
                      <div className="form-group">
                        <label htmlFor="title" className='mt-2'>Employee</label>
                        <Select className='employee-multiple-select'
                          options={employeeData}
                          isMulti
                          placeholder="select employee"
                          value={accessEmployee}
                          onChange={setAccessEmployee}
                        />
                      </div>
                    </div>
                    <div className="col-md-12 pr-md-2 pl-md-2">
                      <div className="form-group">
                        <label htmlFor="note" className='mt-2'>Note</label>
                        <div className='position-relative'>
                          <Form.Control as="textarea" rows={10} className="form-control" id="content" name='content' value={note.content} onChange={handleFormChange} placeholder="Take a note..." onBlur={contentValidation} />
                          {note?.content?.length > 3 && <button className='ai-button' type='button' onClick={handleAIReWrite} title='Improve it' disabled={loading} style={{ zIndex: 0 }} ><i className="fa-solid fa-wand-magic-sparkles"></i></button>}
                        </div>
                        {ContentError && <small id="title" className="form-text error">{ContentError}</small>}
                      </div>
                    </div>
                    {error.length !== 0 &&
                      <div className="col-12 pr-md-2 pl-md-2">
                        <ErrorComponent errors={error} />
                      </div>}
                    <div className="col-12 pr-md-2 pl-md-2">
                      <div className="submit-section d-flex justify-content-between pb-3">
                        <button className=" btn btn-gradient-primary" type='submit' >{id ? "Update" : "Save"}</button>
                        <button className="btn btn-light" onClick={handleRedirect}>Back</button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      {(Loading || isLoading) && <Spinner />}
    </>
  )
}

export default AddUpdateNoteForm