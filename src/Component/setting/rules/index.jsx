import React, { useEffect, useMemo, useState } from 'react'
import { motion } from "framer-motion";
import { NavLink, useNavigate } from 'react-router-dom';
import Spinner from '../../common/Spinner';
import Error500 from '../../error_pages/Error500';
import Error403 from '../../error_pages/Error403';
import { customAxios } from '../../../service/CreateApi';
import toast from 'react-hot-toast';
import { Dropdown } from 'react-bootstrap';
import Swal from 'sweetalert2';
import ViewRuleModal from './ViewRuleModal';

const RulesComponent = () => {
  const [serverError, setServerError] = useState(false);
  const [permission, setPermission] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [permissionToggle, setPermissionToggle] = useState(true);
  const [searchItem, setSearchItem] = useState("");

  const navigate = useNavigate();

  // get rule function 
  const getRulesRecord = async () => {
    setServerError(false);
    setIsLoading(true);
    setPermissionToggle(true);
    customAxios().get('/rule').then((res) => {
      if (res.data.success) {
        let { permissions, data } = res.data;
        setPermission(permissions);
        setRecords(data);
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
    getRulesRecord();
  }, []);

  const recordsFilter = useMemo(() => {
    return records.filter((item) => {
      return (
        item.title.toLowerCase().includes(searchItem.toLowerCase())
      )
    });
  }, [records, searchItem]);

  // delete function
  const handleDelete = (id) => {
    Swal.fire({
      title: "Delete Rule",
      text: "Are you sure you want to delete?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1bcfb4",
      cancelButtonColor: "#d33",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      width: "450px",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsLoading(true);
        const res = await customAxios().delete(`/rule/${id}`);
        if (res.data.success) {
          setRecords((pre) => pre.filter((d) => d._id !== id));
          toast.success(res.data.message);
          setIsLoading(false);
        }
      }
    }).catch((error) => {
      setIsLoading(false);
      if (!error.response) {
        toast.error(error.message)
      } else {
        if (error.response.data.message) {
          toast.error(error.response.data.message)
        }
      }
    })
  };

  const handleRedirect = (path) => {
    navigate(path);
  }

  function sanitizeText(htmlData) {
    const text = htmlData.replace(/<\/?[^>]+(>|$)/g, "");
    const sliceText = text.slice(0, 180);
    const indexNumber = htmlData.lastIndexOf(sliceText.slice(174));
    return text.length > 200 ? htmlData.slice(0, indexNumber) + "..." : htmlData;
  }

  if (serverError && !isLoading) {
    return <Error500 />;
  } else if ((!permission || permission.permissions.list !== 1) && !permissionToggle && !isLoading) {
    return <Error403 />;
  }
  return (
    <>
      <motion.div
        className="box"
        initial={{ opacity: 0, transform: 'translateY(-20px)' }}
        animate={{ opacity: 1, transform: 'translateY(0px)' }}
        transition={{ duration: 0.5 }}
      >
        <div className=" container-fluid py-4">
          <div className="background-wrapper bg-white pb-4">
            <div className='row justify-content-start align-items-center row-std m-0'>
              <div className="col-12 col-sm-5 col-xl-3 d-flex justify-content-between align-items-center">
                <div>
                  <ul id="breadcrumb" className="mb-0">
                    <li><NavLink to="/" className="ihome">Dashboard</NavLink></li>
                    <li><NavLink to="" className="ibeaker"><i className="fa-solid fa-play"></i> &nbsp; Rules</NavLink></li>
                  </ul>
                </div>
              </div>
              <div className="col-12 col-sm-7 col-xl-9 d-flex justify-content-end" id="two">
                <div className="search-full">
                  <input type="search" className="input-search-full" autoComplete='off' value={searchItem} name="txt" placeholder="Search" onChange={(event) => setSearchItem(event.target.value)} />
                  <i className="fas fa-search"></i>
                </div>
                <div className="search-box mr-3">
                  <form name="search-inner">
                    <input type="search" className="input-search" autoComplete='off' value={searchItem} name="txt" onChange={(event) => setSearchItem(event.target.value)} />
                  </form>
                  <i className="fas fa-search"></i>
                </div>
                {permission && permission.permissions.create === 1 && <button className="btn btn-gradient-primary btn-rounded btn-fw text-center" onClick={() => handleRedirect("/rules/create")}  ><i className="fa-solid fa-plus"></i>&nbsp;Add</button>}
              </div>
            </div>
            {recordsFilter.length !== 0 ?
              <div className="row justify-content-start align-items-start m-0 pb-3">
                {recordsFilter.map((item) => {
                  return (
                    <div className="col-md-4 mt-3" key={item._id}>
                      <div className="password-info-box">
                        <div className="d-flex align-items-center justify-content-between position-relative w-100 mb-1">
                          <h5 className='mb-0'>{item.title}</h5>
                          <Dropdown>
                            <Dropdown.Toggle id="password-action">
                              <i className="fa-solid fa-ellipsis-vertical" style={{ cursor: "pointer" }}></i>
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="password-action--dropdown">
                              <ViewRuleModal ruleData={item} />
                              {permission && permission.permissions.update === 1 && <>
                                <Dropdown.Divider />
                                <Dropdown.Item className="dropdown-item" onClick={() => handleRedirect(`/rules/edit/${item._id}`)}><i className="fa-solid fa-pen-to-square"></i><label>Edit</label></Dropdown.Item>
                              </>}
                              {permission && permission.permissions.delete === 1 && <>
                                <Dropdown.Divider />
                                <Dropdown.Item onClick={() => handleDelete(item._id)}><i className="fa-solid fa-trash-can"></i><label>Delete</label></Dropdown.Item>
                              </>}
                            </Dropdown.Menu>
                          </Dropdown>
                        </div>
                        <hr className='mt-1 mb-2' />
                        <div className="note-content">
                          {item.rules &&
                            <div className='mb-0 px-0 py-2' style={{ background: "transparent" }} dangerouslySetInnerHTML={{ __html: sanitizeText(item.rules) }}></div>}                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              :
              <div className="row m-0 pb-3">
                <div className="col-12 text-center pt-3">
                  <h3 style={{ color: "rgb(163, 170, 177)" }}>No Records Found</h3>
                </div>
              </div>
            }

          </div>
        </div>
      </motion.div>
      {isLoading && <Spinner />}
    </>
  )
}

export default RulesComponent