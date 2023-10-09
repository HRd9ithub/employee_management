import React from 'react'
import { useState } from 'react'
import { Globalcomponent } from '../auth_context/GlobalComponent'
import { toast } from 'react-hot-toast'
import GlobalPageRedirect from '../auth_context/GlobalPageRedirect'
import Spinner from '../common/Spinner';
import { customAxios } from '../../service/CreateApi'

const ChangePassword = () => {
    // change password state
    const [list, setList] = useState({
        password: "",
        newpassword: "",
        renewpassword: ""
    })
    const [passwordError, setpasswordError] = useState("")
    const [newPasswordError, setnewPasswordError] = useState("")
    const [renewpasswordError, setrenewpasswordError] = useState("");
    const [isLoading, setisLoading] = React.useState(false);
    const [error, setError] = React.useState([]);

    let { getCommonApi } = GlobalPageRedirect();

    let { handleLogout, loading } = Globalcomponent();

    // ******** change password functionality part  *********
    // onchange function
    const InputEvent = (e) => {
        let { name, value } = e.target;

        setList({ ...list, [name]: value })
    }

    // password validation function
    const handlepasswordValidate = () => {
        if (!list.password) {
            setpasswordError("Password is a required field.");
        } else if (!list.password.match(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/)) {
            setpasswordError("Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character.");
        } else {
            setpasswordError("")
        }
    }
    // new password validation function
    const handlenewPasswordValidate = () => {
        if (!list.newpassword) {
            setnewPasswordError("New password is a required field.");
        } else if (!list.newpassword.match(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/)) {
            setnewPasswordError("Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character.");
        } else {
            setnewPasswordError("")
        }
    }
    // repeat new password validation function
    const handleRepeatnewPasswordValidate = () => {
        if (!list.renewpassword) {
            setrenewpasswordError("Confirm Password is a required field.");
        } else if (list.renewpassword !== list.newpassword) {
            setrenewpasswordError("New Password and Confirm Password does not match.");
        } else {
            setrenewpasswordError("")
        }
    }

    // change password submit function
    const changePaasword = async (e) => {
        e.preventDefault();
        handlepasswordValidate();
        handlenewPasswordValidate();
        handleRepeatnewPasswordValidate();
        setError([]);

        // object destructuring
        let { password, newpassword, renewpassword } = list;

        if (!password || !newpassword || !renewpassword || passwordError || newPasswordError || renewpasswordError) {
            return false;
        } else {
            setisLoading(true)
            try {
                const response = await customAxios().post('/user/password', { current_password: password, new_password: newpassword, confirm_password: renewpassword });

                if (response.data.success) {
                    toast.success(response.data.message);
                    handleLogout();
                    setList({
                        newpassword: '',
                        renewpassword: "",
                        password: ""
                    })
                }
            } catch (error) {
                setList({
                    newpassword: '',
                    renewpassword: "",
                    password: ""
                })
                if (!error.response) {
                    toast.error(error.message)
                } else if (error.response.status === 401) {
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
            } finally {
                setisLoading(false)
            }

        }
    }

    return (
        <form>
            <div className="row mb-3">
                <div className="col-md-4 pr-md-1">
                    <label htmlFor="currentPassword" className="col-form-label">Current Password</label>
                    <input name="password" type="password" className="form-control" id="currentPassword" placeholder='Enter password' value={list.password} onChange={InputEvent} onBlur={handlepasswordValidate} />
                    {passwordError && <small className="error">{passwordError}</small>}
                </div>

                <div className="col-md-4 pr-md-1 pl-md-2">
                    <label htmlFor="newPassword" className="col-form-label">New Password</label>
                    <input name="newpassword" type="password" className="form-control" id="newPassword" placeholder='Enter new password' value={list.newpassword} onChange={InputEvent} onBlur={handlenewPasswordValidate} />
                    {newPasswordError && <small className="error">{newPasswordError}</small>}
                </div>
                <div className="col-md-4 pl-md-2">
                    <label htmlFor="renewPassword" className="col-form-label">Confirm Password</label>
                    <input name="renewpassword" type="password" className="form-control" id="renewPassword" placeholder='Re-enter New Password' value={list.renewpassword} onChange={InputEvent} onBlur={handleRepeatnewPasswordValidate} />
                    {renewpasswordError && <small className="error">{renewpasswordError}</small>}
                </div>
            </div>
            {error.length !== 0 && 
            <ol>
                {error.map((val) => {
                    return <li className='error' key={val} >{val}</li>
                })}
            </ol>}
            <div className="submit-section pb-3">
                <button type="submit" className="btn btn-gradient-primary" onClick={changePaasword}>Change Password</button>
            </div>
            {(loading || isLoading) && <Spinner />}
        </form>
    )
}

export default ChangePassword