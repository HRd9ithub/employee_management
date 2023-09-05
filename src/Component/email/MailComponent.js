import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { AppProvider } from "../context/RouteContext";
import { NavLink } from "react-router-dom";
import GlobalPageRedirect from "../auth_context/GlobalPageRedirect";
import { GetLocalStorage } from "../../service/StoreLocalStorage";
import Spinner from "../common/Spinner";

const MailComponent = ({ HandleProgress }) => {
    const [loader, setloader] = useState(false);

    let { getCommonApi } = GlobalPageRedirect();

    // eslint-disable-next-line
    const [mailDetail, setMailDetail] = useState([]);
    const [mail, setMail] = useState({
        mail_encryption: "",
        mail_from_address: "",
        mail_from_name: "",
        mail_host: "",
        mail_mailer: "",
        mail_password: "",
        mail_port: "",
        mail_username: "",
    });
    const [mail_mailer_error, setmail_mailer_error] = useState("");
    const [mail_host_error, setmail_host_error] = useState("");
    const [mail_encryption_error, setmail_encryption_error] = useState("");
    const [mail_from_address_error, setmail_from_address_error] = useState("");
    const [mail_from_name_error, setmail_from_name_error] = useState("");
    const [mail_password_error, setmail_password_error] = useState("");
    const [mail_port_error, setmail_port_error] = useState("");
    const [mail_username_error, setmail_username_error] = useState("");
    const [error, setError] = useState([]);

    let { UserData, accessData } = useContext(AppProvider)

    // get data in api
    const getmailDetail = async () => {
        HandleProgress(20)
        try {
            setloader(true);
            let token = GetLocalStorage("token");
            const request = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            };
            HandleProgress(50)
            const res = await axios.get(
                `${process.env.REACT_APP_API_KEY}/mailing_details/list`,
                request
            );
            HandleProgress(70)
            if (res.data.success) {
                if (res.data.data.length > 0) {
                    setMailDetail(res.data.data);
                    setMail(res.data.data[0]);
                }
            }
        } catch (error) {
            console.log(error, "<<< ===  MailComponent page get api");
            if (error.response.status === 401) {
                getCommonApi();
            } else {
                toast.error(error.response.data.message)
            }
        } finally {
            HandleProgress(100)
            setloader(false);
        }
    };

    useEffect(() => {
        getmailDetail();
        // eslint-disable-next-line
    }, []);

    // onchange function
    const InputEvent = (event) => {
        let { name, value } = event.target;

        setMail({ ...mail, [name]: value });
    };

    // ======================================validation part ========================================//
    // mailler field validation
    const ValidationMailler = () => {
        if (!mail.mail_mailer.trim()) {
            setmail_mailer_error("Please enter mail mailler.");
        } else if (!mail.mail_mailer.match(/^[a-zA-Z0-9 ]*$/)) {
            setmail_mailer_error("Please enter a valid mail mailler.");
        } else {
            setmail_mailer_error("");
        }
    };

    // mail host field validation
    const ValidationHost = () => {
        if (!mail.mail_host.trim()) {
            setmail_host_error("Please enter mail host.");
        } else if (!mail.mail_host.match(/^[a-zA-Z0-9. ]*$/)) {
            setmail_host_error("Please enter a valid mail host.");
        } else {
            setmail_host_error("");
        }
    };

    // mail port field validation
    const ValidationPort = () => {
        if (!mail.mail_port) {
            setmail_port_error("Please enter mail port.");
        } else {
            setmail_port_error("");
        }
    };
    // mail username field validation
    const ValidationUserName = () => {
        if (!mail.mail_username.trim()) {
            setmail_username_error("Please enter user name.");
        } else if (
            // eslint-disable-next-line
            !mail.mail_username.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
        ) {
            setmail_username_error("Please enter a valid user name.");
        } else {
            setmail_username_error("");
        }
    };
    // mail password field validate
    const validationPassword = () => {
        if (!mail.mail_password.trim()) {
            setmail_password_error("Please enter password.");
        } else {
            setmail_password_error("");
        }
    };
    // mail password field validate
    const validationEncryption = () => {
        if (!mail.mail_encryption.trim()) {
            setmail_encryption_error("Please enter mail encryption.");
        } else {
            setmail_encryption_error("");
        }
    };
    // mail from address field validate
    const validationFromAddress = () => {
        if (!mail.mail_from_address.trim()) {
            setmail_from_address_error("Please enter mail from address.");
        } else if (
            // eslint-disable-next-line
            !mail.mail_from_address.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
            setmail_from_address_error("Please enter a valid mail from address.");
        } else {
            setmail_from_address_error("");
        }
    };

    // mail from name field validate
    const validationFromName = () => {
        if (!mail.mail_from_name.trim()) {
            setmail_from_name_error("Please enter mail from name.");
        } else {
            setmail_from_name_error("");
        }
    };

    // submit function
    const handleSubmit = async (e) => {
        e.preventDefault();
        ValidationMailler();
        ValidationHost();
        ValidationPort();
        ValidationUserName();
        validationPassword();
        validationEncryption();
        validationFromAddress();
        validationFromName();

        setError([]);
        let { mail_encryption, mail_from_address, mail_from_name, mail_host, mail_mailer, mail_password, mail_port, mail_username, } = mail;

        if (!mail_encryption || !mail_from_address || !mail_from_name || !mail_host || !mail_mailer || !mail_password || !mail_port || !mail_username) {
            return false;
        } else if (mail_encryption_error || mail_from_address_error || mail_from_name_error || mail_host_error || mail_mailer_error || mail_password_error || mail_port_error || mail_username_error
        ) {
            return false;
        } else {
            // update data for use
            setloader(true)
            try {
                let token = GetLocalStorage("token");
                let request = {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                };
                let res = await axios.post(`${process.env.REACT_APP_API_KEY}/mailing_details/add`, mail, request);
                if (res.data.success) {
                    if (mailDetail.length === 0) {
                        toast.success("Successfully added a new mail detail.");
                    } else {
                        toast.success("Successfully updated!");
                    }
                    // redirect('/maildetail')
                } else {
                    toast.error("Something went wrong, Please check your details and try again.");
                }
            } catch (error) {
                console.log("mailcomponent ✈ error => ", error);
                if (error.response.status === 401) {
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
                setloader(false)
            }
        }
    };

    return (
        <>
            <motion.div className="box" initial={{ opacity: 0, transform: "translateY(-20px)" }} animate={{ opacity: 1, transform: "translateY(0px)" }} transition={{ duration: 0.5 }}>
                <div className=" container-fluid pt-4">
                    <div className="background-wrapper bg-white pt-2">
                        <div className=''>
                            <div className='row justify-content-end align-items-center row-std m-0'>
                                <div className="col-12 d-flex justify-content-between align-items-center">
                                    <div>
                                        <NavLink className="path-header">Email</NavLink>
                                        <ul id="breadcrumb" className="mb-0">
                                            <li><NavLink to="/" className="ihome">Dashboard</NavLink></li>
                                            <li><NavLink to="/email" className="ibeaker"><i class="fa-solid fa-play"></i> &nbsp; Email</NavLink></li>
                                        </ul>
                                    </div>
                                    <div className="d-flex" id="two">
                                        <button
                                            type="submit"
                                            className="btn btn-gradient-primary  me-2"
                                            onClick={handleSubmit}
                                        >
                                            Submit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>


                            <div className='container-fluid inner-pages px-2'>
                                <form className="forms-sample pt-4">
                                    <div className="container-fluid">
                                        <div className="row">
                                            <div className="form-group col-md-6">
                                                <label htmlFor="mail_mailer">Mail Mailer</label>
                                                <input type="text" className="form-control" id="mail_mailer" placeholder="Enter mail mailer" name="mail_mailer" onChange={InputEvent} value={mail.mail_mailer} onKeyUp={ValidationMailler} />
                                                {mail_mailer_error && (
                                                    <div className="error"> {mail_mailer_error}</div>
                                                )}
                                            </div>
                                            <div className="form-group col-md-6">
                                                <label htmlFor="mail_host">Mail Host</label>
                                                <input type="text" className="form-control" id="mail_host" placeholder="Enter mail host" name="mail_host" onChange={InputEvent} value={mail.mail_host} onKeyUp={ValidationHost} />
                                                {mail_host_error && (
                                                    <div className="error"> {mail_host_error}</div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="form-group col-md-6">
                                                <label htmlFor="mail_port">Mail Port</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    id="mail_port"
                                                    placeholder="Enter mail port"
                                                    name="mail_port"
                                                    onChange={InputEvent}
                                                    value={mail.mail_port}
                                                    onKeyUp={ValidationPort}
                                                />
                                                {mail_port_error && (
                                                    <div className="error"> {mail_port_error}</div>
                                                )}
                                            </div>
                                            <div className="form-group col-md-6">
                                                <label htmlFor="mail_username">Mail User Name</label>
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    id="mail_username"
                                                    placeholder="Enter mail username"
                                                    name="mail_username"
                                                    onChange={InputEvent}
                                                    value={mail.mail_username}
                                                    onKeyUp={ValidationUserName}
                                                />
                                                {mail_username_error && (
                                                    <div className="error"> {mail_username_error}</div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="form-group col-md-6">
                                                <label htmlFor="mail_password">Mail Password</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="mail_password"
                                                    placeholder="Enter mail password"
                                                    name="mail_password"
                                                    onChange={InputEvent}
                                                    value={mail.mail_password}
                                                    onKeyUp={validationPassword}
                                                />
                                                {mail_password_error && (
                                                    <div className="error"> {mail_password_error}</div>
                                                )}
                                            </div>
                                            <div className="form-group col-md-6">
                                                <label htmlFor="mail_encryption">Mail Encryption</label>
                                                <input type="text" className="form-control" id="mail_encryption" placeholder="Enter mail encryption" name="mail_encryption" onChange={InputEvent} value={mail.mail_encryption} onKeyUp={validationEncryption} />
                                                {mail_encryption_error && (
                                                    <div className="error"> {mail_encryption_error}</div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="form-group col-md-6 ">
                                                <label htmlFor="mail_from_address">Mail From Address</label>
                                                <input type="email" className="form-control" id="mail_from_address" placeholder="Enter mail from address" name="mail_from_address" onChange={InputEvent} value={mail.mail_from_address} onKeyUp={validationFromAddress} />
                                                {mail_from_address_error && (<div className="error"> {mail_from_address_error}</div>)}
                                            </div>
                                            <div className="form-group col-md-6 ">
                                                <label htmlFor="mail_from_name">Mail From Name</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="mail_from_name"
                                                    placeholder="Enter mail from name"
                                                    name="mail_from_name"
                                                    onChange={InputEvent}
                                                    value={mail.mail_from_name}
                                                    onKeyUp={validationFromName}
                                                />
                                                {mail_from_name_error && (
                                                    <div className="error"> {mail_from_name_error}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <ol>
                                        {error.map((val) => {
                                            return <li className="error" key={val}>{val}</li>
                                        })}
                                    </ol>
                                </form>
                            </div>
                        </div>
                </div>

            </motion.div>
            {loader && <Spinner />}
        </>
    );
};

export default MailComponent;
