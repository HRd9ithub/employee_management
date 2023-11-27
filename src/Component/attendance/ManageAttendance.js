import { NavLink } from 'react-router-dom';

const ManageAttendance = ({data}) => {


    return (
        <>
        <div className="container-fluid py-4">
            <div className="background-wrapper bg-white py-4">
                <div className='row justify-content-end align-items-center row-std m-0 px-4'>
                    <div className="col-12 col-sm-7 d-flex justify-content-between align-items-center p-0">
                        <div>
                            <ul id="breadcrumb" className="mb-0">
                                <li><NavLink to="/" className="ihome">Dashboard</NavLink></li>
                                <li><NavLink to="/attendance" className="ibeaker"><i className="fa-solid fa-play"></i> &nbsp; Attendance</NavLink></li>
                                <li><NavLink to="" className="ibeaker"><i className="fa-solid fa-play"></i> &nbsp; Manage</NavLink></li>
                            </ul>
                        </div>
                    </div>
                    <div className="col-12 col-sm-5 d-flex justify-content-end pr-0" id="two">
                        <div>
                            <button className='btn-gradient-primary'><i className="fa-solid fa-arrow-left"></i>&nbsp; Back</button>
                        </div>
                    </div>
                </div>
                <div className="mx-4 mt-4">
                    <div className="grid-margin stretch-card inner-pages mb-lg-0">
                        <div className="card">
                            <div className="card-body px-4">
                                <form className="forms-sample pt-1 pb-2">
                                    <div className="row">
                                        <div className="col-md-12">
                                            <div className="attendance-header d-flex justify-content-between align-items-center flex-wrap">
                                                <h4 className="mb-0 mt-1">Jd Patel</h4>
                                                <h5 className="text-gray mb-0 mt-1">{new Date().toDateString()}</h5>
                                            </div>
                                            <hr className='my-4'/>
                                            <div className="d-flex align-items-center flex-wrap">
                                                <div className="d-flex align-items-center flex-wrap mr-4 mb-3">
                                                    <h5 className="mb-0 text-gray mr-1">Clock In Time:</h5>
                                                    <h5 className="mb-0">10:21 AM</h5>
                                                </div>
                                                <div className="d-flex align-items-center flex-wrap mb-3">
                                                    <h5 className="mb-0 text-gray mr-1">Clock Out Time:</h5>
                                                    <h5 className="mb-0">12:52 PM</h5>
                                                </div>
                                            </div>
                                            <h5 className="mb-0 text-justify">
                                                <span className='text-gray'>Explanation:</span> 
                                                <p className='ml-1 mb-0 d-inline'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Dicta, ab quas natus, eos minima dolorem ratione illum facilis voluptatem voluptatum eius nulla? Ipsa ullam ipsum similique, iure molestiae aspernatur, id possimus dolorem excepturi maxime qui nam maiores! Consectetur consequuntur et eligendi ullam quae odio soluta, doloribus officia molestias, rerum voluptate cupiditate quod nisi. Alias dolorem impedit porro, quod doloribus necessitatibus sint aliquam non asperiores blanditiis odit perferendis. At, beatae! Velit rem nisi eos. Totam ducimus ea vitae atque quia praesentium.</p> 
                                            </h5>
                                        </div>
                                    </div>
                                    <hr className='my-4'/>
                                    <div className="form-group">
                                        <h5 className="mb-0 text-gray mr-1">Comment</h5>
                                        <textarea id='explanation' rows={2} cols={10} className="form-control" name="Comment"/>
                                    </div>
                                    <div className="submit-section d-flex justify-content-end">
                                        <button className="btn btn-gradient-primary" type="submit">Approve</button>
                                        <button className="btn btn-light">Reject</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    )
}

export default ManageAttendance
