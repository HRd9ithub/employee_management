/* eslint-disable react-hooks/exhaustive-deps */
import { NavLink, useNavigate, useParams } from 'react-router-dom'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import Spinner from '../../common/Spinner';
import { customAxios } from '../../../service/CreateApi';
import toast from 'react-hot-toast';
import ErrorComponent from '../../common/ErrorComponent';
import { reWriteWithHTMLPrompt } from '../../../helper/prompt';
import { SpellCheck } from '../../ai/SpellCheck';
import Error500 from '../../error_pages/Error500';
import Error403 from '../../error_pages/Error403';
import JoditEditor from 'jodit-react';

const AddUpdateForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [rule, setRule] = useState({
    title: "",
    rules: ""
  });
  const [titleError, setTitleError] = useState("");
  const [ContentError, setContentError] = useState("");
  const [error, setError] = useState([]);
  const [serverError, setServerError] = useState(false);
  const [permission, setPermission] = useState("");
  const [permissionToggle, setPermissionToggle] = useState(true);

  const { loading, aiResponse } = SpellCheck();

  const navigate = useNavigate();
  const { id } = useParams();
  const editorsRef = useRef();

  const handleResetForm = (e) => {
    e && e.preventDefault();
    setRule({
      title: "",
      rules: ""
    });
    setTitleError("");
    setContentError("");
    setError([]);
  }

  const fetchRule = () => {
    setServerError(false);
    setIsLoading(true);
    setPermissionToggle(true);
    customAxios().get(`/rule/${id}`).then((res) => {
      if (res.data.success) {
        const { permissions, data } = res.data;
        const { title, _id, rules } = data;

        setRule({
          title,
          id: _id,
          rules: rules ? rules : ""
        });
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

  useEffect(() => id && fetchRule(), [id])

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setRule({ ...rule, [name]: value });
  }

  const titleValidation = () => {
    if (!rule.title.trim()) {
      setTitleError("Title is a required field.")
    } else {
      setTitleError("");
    }
  }
  const contentValidation = () => {
    if (!rule.rules.trim() || !rule.rules.replaceAll("<p><br></p>", "")) {
      setContentError("Rules is a required field.")
    } else {
      setContentError("");
    }
  }

  const handleRedirect = () => {
    navigate("/rules");
  }

  const handleFormSubmit = (event) => {
    event.preventDefault();
    setError([]);

    titleValidation();
    contentValidation();

    if (!rule.title || !rule.rules || titleError || ContentError) {
      return false;
    }

    const payload = {
      title: rule.title,
      rules: rule.rules
    }

    let url = "";
    if (id) {
      url = customAxios().put(`/rule/${id}`, payload)
    } else {
      url = customAxios().post('/rule', payload)
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

  const handleAIReWrite = (text) => {
    aiResponse(reWriteWithHTMLPrompt(text)).then((correctedText) => {
      setRule({ ...rule, rules: correctedText });
    }).catch((error) => {
      toast.error(error.message);
    })
  }

  const config = useMemo(() => {
    return {
      readonly: false,
      placeholder: 'write your content ....'
    }
  }, []);

  const handleContentChange = (content) => {
    setRule({ ...rule, rules: content });
  };

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
                  <li><NavLink to="/notes" className="ibeaker"><i className="fa-solid fa-play"></i> &nbsp; Rules</NavLink></li>
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
                        <input type="text" autoComplete='off' className="form-control" id="title" placeholder="Title" name='title' value={rule.title} onChange={handleFormChange} onBlur={titleValidation} />
                        {titleError && <small id="title" className="form-text error">{titleError}</small>}
                      </div>
                    </div>
                    <div className="col-md-12 pr-md-2 pl-md-2">
                      <div className="form-group">
                        <label htmlFor="note" className='mt-2'>Note</label>
                        <div className="position-relative">
                          <JoditEditor
                            config={config}
                            value={rule.rules}
                            onChange={newContent => handleContentChange(newContent)}
                            onBlur={contentValidation}
                            ref={editorsRef}
                          />
                          {rule?.rules?.length > 3 && <button className='ai-button editor-ai' type='button' onClick={() => handleAIReWrite(rule.rules)} title='Improve it' disabled={loading}><i className="fa-solid fa-wand-magic-sparkles"></i></button>}
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
      {(isLoading) && <Spinner />}
    </>
  )
}

export default AddUpdateForm