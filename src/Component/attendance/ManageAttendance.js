/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { customAxios } from '../../service/CreateApi';
import Spinner from '../common/Spinner';
import Error500 from '../error_pages/Error500';
import Error403 from '../error_pages/Error403';
import { AppProvider } from '../context/RouteContext';
import { SpellCheck } from '../ai/SpellCheck';
import { reWritePrompt } from '../../helper/prompt';
import { Form } from 'react-bootstrap';

const ManageAttendance = () => {
    const [isLoading, setisLoading] = useState(false);
    const [records, setRecords] = useState([]);
    const [serverError, setServerError] = useState(false);
    const [comment, setComment] = useState("");
    const [error, setError] = useState([]);
    const [permission, setpermission] = useState("");

    let { getLeaveNotification, Loading } = useContext(AppProvider);
    const { loading, aiResponse } = SpellCheck();

    const navigate = useNavigate();
    const { id } = useParams();
    //get attendance
    const getAttendancemanagement = async () => {
        try {
            setisLoading(true);
            setServerError(false);
            const res = await customAxios().get(`/attendance/regulation/${id}`);
            if (res.data.success) {
                const { data, permissions } = res.data;
                setRecords(data)
                setpermission(permissions);
            }
        } catch (error) {
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
        } finally {
            setisLoading(false)
        }
    }

    useEffect(() => {
        getAttendancemanagement();
    }, []);

    // onchange comment
    const onChangeComment = (event) => {
        setComment(event.target.value);
    }

    // add comment 
    const handleAddComment = async (e, name, data) => {
        e.preventDefault();
        setisLoading(true);
        setError([]);

        const { attendanceId, clock_in, clock_out, userId } = data;

        customAxios().post('/attendance/comment', {
            comment,
            status: name,
            attendanceRegulationId: attendanceId,
            clock_in,
            clock_out,
            userId
        }).then(data => {
            if (data.data.success) {
                toast.success(data.data.message);
                setComment("");
                navigate("/attendance/requests", { replace: true });
                getLeaveNotification();
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
        }).finally(() => setisLoading(false))
    }

    const handleAIReWrite = () => {
        aiResponse(reWritePrompt(comment)).then((correctedText) => {
            setComment(correctedText)
        }).catch((error) => {
            toast.error(error.message);
        })
    }

    if (isLoading || Loading) {
        return <Spinner />;
    } else if (serverError) {
        return <Error500 />;
    } else if (!permission) {
        return <Error403 />;
    }

    return (
        <>
            <div className="container-fluid py-4">
                <div className="background-wrapper bg-white pb-4">
                    <div className='row justify-content-end align-items-center row-std m-0 px-4'>
                        <div className="col-12 col-sm-7 d-flex justify-content-between align-items-center p-0">
                            <div>
                                <ul id="breadcrumb" className="mb-0">
                                    <li><NavLink to="/" className="ihome">Dashboard</NavLink></li>
                                    <li><NavLink to="/attendance" className="ibeaker"><i className="fa-solid fa-play"></i> &nbsp; Attendance</NavLink></li>
                                    <li><NavLink to="/attendance/requests" className="ibeaker"><i className="fa-solid fa-play"></i> &nbsp; Requests</NavLink></li>
                                    <li><NavLink to="" className="ibeaker"><i className="fa-solid fa-play"></i> &nbsp; Manage</NavLink></li>
                                </ul>
                            </div>
                        </div>
                        <div className="col-12 col-sm-5 d-flex justify-content-end pr-0" id="two">
                            <div>
                                <button className='btn-gradient-primary' onClick={() => navigate('/attendance/requests')}><i className="fa-solid fa-arrow-left"></i>&nbsp; Back</button>
                            </div>
                        </div>
                    </div>
                    {records.length !== 0 ? records.map((val) => {
                        return (
                            <div className="mx-4 mt-4" key={val._id}>
                                <div className="grid-margin stretch-card inner-pages mb-lg-0">
                                    <div className="card">
                                        <div className="card-body px-4">
                                            <form className="forms-sample pt-1 pb-2">
                                                <div className="row">
                                                    <div className="col-md-12">
                                                        <div className="attendance-header d-flex justify-content-between align-items-center flex-wrap">
                                                            <h4 className="mb-0 mt-1">{val.user.name}</h4>
                                                            <h5 className="text-gray mb-0 mt-1">{new Date(val.attendance.timestamp).toDateString()}</h5>
                                                        </div>
                                                        <hr className='my-4' />
                                                        {val.clock_in &&
                                                            <div className="d-flex align-items-center flex-wrap">
                                                                <div className="d-flex align-items-center flex-wrap mr-4 mb-3">
                                                                    <h5 className="mb-0 text-gray mr-1">Clock In Time:</h5>
                                                                    <h5 className="mb-0">{val.clock_in}</h5>
                                                                </div>
                                                                <div className="d-flex align-items-center flex-wrap mb-3">
                                                                    <h5 className="mb-0 text-gray mr-1">Clock Out Time:</h5>
                                                                    <h5 className="mb-0">{val.clock_out}</h5>
                                                                </div>
                                                            </div>}
                                                        <h5 className="mb-0 text-justify">
                                                            <span className='text-gray'>Explanation:</span>
                                                            <p className='ml-1 mb-0 d-inline'>{val.explanation}</p>
                                                        </h5>
                                                    </div>
                                                </div>
                                                <hr className='my-4' />
                                                <div className="form-group">
                                                    <h5 className="mb-0 text-gray mr-1">Comment</h5>
                                                    <div className='position-relative'>
                                                        <Form.Control as="textarea" id='comment' rows={4} cols={10} className="form-control" name="Comment" value={comment} onChange={onChangeComment} />
                                                        {comment?.length > 3 && <button className='ai-button' type='button' onClick={handleAIReWrite} title='Improve it' disabled={loading}><i className="fa-solid fa-wand-magic-sparkles"></i></button>}
                                                    </div>
                                                </div>
                                                {error.length !== 0 &&
                                                    <ol>
                                                        {error.map((val) => {
                                                            return <li className='error' key={val}>{val}</li>
                                                        })}
                                                    </ol>}
                                                <div className="submit-section d-flex justify-content-end">
                                                    <button className="btn btn-gradient-primary" onClick={(e) => handleAddComment(e, "Approved", val)}>Approve</button>
                                                    <button className="btn btn-light" onClick={(e) => handleAddComment(e, "Declined", val)}>Reject</button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    }) :
                        <div className="row m-0 pb-3">
                            <div className="col-12 text-center pt-3">
                                <h3 style={{ color: "rgb(163, 170, 177)" }}>No Records Found</h3>
                            </div>
                        </div>
                    }
                </div>
            </div>
        </>
    )
}

export default ManageAttendance
