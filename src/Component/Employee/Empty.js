import React from 'react'
import { Table } from 'react-bootstrap'
import { useLocation } from 'react-router-dom'

const Empty = () => {

    // custom style in table
    const customHeadstyle = {
        backgroundColor: '#e6f4fb',
        marginTop: '10px',
        textTransform: "uppercase",
        fontSize: '15px',
        fontStyle : 'bold'
    }

    let location = useLocation()

    return (
        <>
            <Table className=' mb-4' style={{border :"1px solid #e6f4fb"}}>
                <thead style={customHeadstyle}>
                    {location.pathname.toLowerCase() === '/employees' ?
                        <tr>
                            <th>Employee Id</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Mobile No</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr> :
                        location.pathname.toLowerCase()  === '/department' ?
                        <tr>
                            <th>Id</th>
                            <th>Department Name</th>
                            <th>Action</th>
                        </tr>: location.pathname.toLowerCase()  === '/designation' ?
                        <tr>
                        <th>Id</th>
                        <th>Designation </th>
                        <th>Action</th>
                    </tr> : location.pathname.toLowerCase()  === '/userrole' ?
                     <tr>
                     <th>Id</th>
                     <th>User Role </th>
                     <th>Action</th>
                     </tr> :location.pathname.toLowerCase()  === '/leavetype' ?
                     <tr>
                         <th>Id</th>
                         <th>Leave Type </th>
                         <th>Action</th>
                     </tr>: location.pathname.toLowerCase()  === '/leave' ?
                         <tr>
                            <th>Id</th>
                            <th>Employee</th>
                            <th>Leave Type</th>
                            <th>From</th>
                            <th>To</th>
                            <th>Duration</th>
                            <th>Leave For</th>
                            <th>Reason</th>
                            <th>Status</th>
                            <th>Action</th>
                         </tr> :location.pathname.toLowerCase()  === '/page' ?
                         <tr>
                            <th>Id</th>
                            <th>Page</th>
                            <th>Action</th>
                         </tr>:location.pathname.toLowerCase()  === '/documents' ?
                         <tr>
                            <th>Id</th>
                            <th>File</th>
                            <th>File Name</th>
                            <th>Description</th>
                            <th>Action</th>
                         </tr>:location.pathname.toLowerCase()  === '/timesheet' ?
                         <tr>
                            <th>Id</th>
                            <th>Employee</th>
                            <th>Date</th>
                            <th>Login Time</th>
                            <th>Logout Time</th>
                            <th>Total Hours</th>
                         </tr>:location.pathname.toLowerCase()  === '/account' ?
                         <tr>
                            <th>Id</th>
                            <th>Employee</th>
                            <th>Account No</th>
                            <th>IFSC Code</th>
                            <th>Bank name</th>
                            <th>Branch Name</th>
                            <th>Name</th>
                            <th>Action</th>
                         </tr>:location.pathname.toLowerCase()  === '/eduction' ?
                         <tr>
                            <th>Id</th>
                            <th>Employee</th>
                            <th>University Name</th>
                            <th>Degree</th>
                            <th>Percentage</th>
                            <th>Year</th>
                            <th>Action</th>
                         </tr>:location.pathname.toLowerCase()  === '/timesheetreport' ?
                         <tr>
                            <th>Id</th>
                            <th>Date</th>
                            <th>Day</th>
                            <th>Total Hours</th>
                         </tr>:''
                        }
                </thead>
                <tbody>
                    <tr className='text-center'>
                        <td colSpan={17}>No Data Found</td>
                    </tr>
                </tbody>
            </Table>
        </>
    )
}

export default Empty
