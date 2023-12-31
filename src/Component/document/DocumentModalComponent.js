import React, { useState } from 'react'
import { Modal } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import Spinner from '../common/Spinner';
import { Form } from 'react-bootstrap';
import { customAxios1 } from '../../service/CreateApi';
import { alphNumSpaceFormat } from '../common/RegaulrExp';
import ErrorComponent from '../common/ErrorComponent';

const DocumentModalComponent = ({ data, setToggle, toggle, permission }) => {
    const [show, setShow] = useState(false);
    const [document, setDoument] = useState({
        name: "",
        description: "",
        image: "",
        imageName: ""
    })
    const [nameError, setNameError] = useState('')
    const [descriptioneError, setDescriptioneError] = useState('')
    const [imageError, setImagerror] = useState('');
    const [isLoading, setisLoading] = useState(false)
    const [Error, setError] = useState([])

    // modal show function
    const handleShow = () => {
        if (data) {
            setDoument({
                name: data.name,
                description: data.description,
                imageName: data.image,
                id: data._id
            })
        }
        setShow(true)
    }

    // modal close function
    const handleClose = (e) => {
        e.preventDefault();
        setShow(false)
        setDoument({
            name: "",
            description: "",
            image: "",
            imageName: ""
        });
        setNameError('');
        setDescriptioneError('');
        setImagerror('');
        setError([])
    }

    //onchange function
    const InputEvent = (e) => {
        let { name, value } = e.target;

        setDoument({ ...document, [name]: value })
    }

    // image field onchange function
    const fileChange = (e) => {
        if (e.target.files.length !== 0) {
            setDoument({ ...document, image: e.target.files[0], imageName: e.target.files[0].name });
        }
        if (e.target.files.length === 0 && !document.image) {
            setImagerror('Please select file.')
        } else {
            setImagerror('');
        }
    }

    // submit function
    const HandleSubmit = (e) => {
        e.preventDefault();
        validationName();
        validationDescription();
        validationImage();
        setError([])

        let { name, description, image, imageName, id } = document
        if (!name || !description || !imageName) {
            return false;
        }
        if (nameError || descriptioneError || imageError) {
            return false;
        }
        var formdata = new FormData();
        formdata.append('image', image);
        formdata.append('name', name);
        formdata.append('description', description);

        let url = "";
        if (id) {
            url = customAxios1().put(`/document/${id}`, formdata)
        } else {
            url = customAxios1().post('/document/', formdata)
        }
        setisLoading(true)
        url.then((res) => {
            if (res.data.success) {
                toast.success(res.data.message)
                setToggle(!toggle)
                setShow(false)
                setDoument({
                    name: '',
                    description: '',
                    image: '',
                    imageName: ''
                })
            }
        }).catch((error) => {
            if (!error.response) {
                toast.error(error.message)
            } else {
                if (error.response.data.message) {
                    toast.error(error.response.data.message)
                } else {
                    setError(error.response.data.error);
                }
            }
        }).finally(() => setisLoading(false))
    }

    // file name field vlidation
    const validationName = () => {
        if (!document.name) {
            setNameError('File name is a required field.')
        } else if (!document.name.trim() || !document.name.match(alphNumSpaceFormat)) {
            setNameError('File name must be a number or alphabetic or space.')
        } else {
            setNameError('')
        }
    }

    // descrption field validation
    const validationDescription = () => {
        if (!document.description.trim()) {
            setDescriptioneError('Description is a required field.')
        } else {
            setDescriptioneError('');
        }
    }

    // image validation
    const validationImage = () => {
        if (!document.imageName) {
            setImagerror('File is a required field.')
        } else {
            setImagerror('');
        }
    }

    return (
        <>
            {data ? <i className="fa-solid fa-pen-to-square" onClick={handleShow} ></i>
                : permission && permission.permissions.create === 1 &&
                <button
                    className='btn btn-gradient-primary btn-rounded btn-fw text-center' onClick={handleShow}>
                    <i className="fa-solid fa-plus" ></i>&nbsp;Add
                </button>
            }
            <Modal show={show} animation={true} size="md" aria-labelledby="example-modal-sizes-title-sm" className='department-modal' centered>
                <Modal.Header className='small-modal'>
                    <Modal.Title>{data ? 'Edit Document' : 'Add Document'}
                    </Modal.Title>
                    <p className='close-modal' onClick={handleClose}><i className="fa-solid fa-xmark"></i></p>
                </Modal.Header>
                <Modal.Body>
                    <div className=" grid-margin stretch-card inner-pages mb-lg-0">
                        <div className="card">
                            <div className="card-body">
                                <form className="forms-sample">
                                    <div className="row">
                                        <div className="col-md-12 pr-md-2 pl-md-2">
                                            <div className='form-group'>
                                                <label>File</label>
                                                <div className='d-flex justify-content-between'>
                                                    <div className="custom-file">
                                                        <Form.Control type="file" className="form-control visibility-hidden" id="document" name='file' lang="es" accept="image/png,image/jpeg,image/jpg,.doc,.pdf" onChange={fileChange} />
                                                        <label className="custom-file-label" htmlFor="document">{`${document.imageName ? document.imageName : 'Upload file'}`}</label>
                                                    </div>
                                                    {data && <button disabled={!document.imageName || document.image} className='custom-file-btn'>
                                                        <a className='btn-light btn' href={`${process.env.REACT_APP_IMAGE_API}/uploads/${document.imageName}`} target='_VIEW'>Preview</a>
                                                    </button>}
                                                </div>
                                                {imageError && <small id="emailHelp" className="form-text error">{imageError}</small>}
                                            </div>
                                        </div>
                                        <div className="col-md-12 pr-md-2 pl-md-2">
                                            <div className="form-group">
                                                <label htmlFor="1" className='mt-1'>File Name</label>
                                                <input type="text" className="form-control" id="1" placeholder="Enter your name" name='name' onChange={InputEvent} value={document.name} onBlur={validationName} />
                                                {nameError && <small id="emailHelp" className="form-text error">{nameError}</small>}
                                            </div>
                                        </div>
                                        <div className="col-md-12 pr-md-2 pl-md-2">
                                            <div className="form-group">
                                                <label htmlFor="2" className='mt-1'>Description</label>
                                                <input type="text" className="form-control" id="2" placeholder="Enter your description" name='description' onChange={InputEvent} value={document.description} onBlur={validationDescription} />
                                                {descriptioneError && <small id="emailHelp" className="form-text error">{descriptioneError}</small>}
                                            </div>
                                        </div>
                                        {Error.length !== 0 && 
                                            <div className="col-12 pl-md-2 pr-md-2">
                                                <ErrorComponent errors={Error} />
                                            </div>
                                        }
                                    </div>
                                    <div className='d-flex justify-content-center modal-button'>
                                        <button type="submit" className="btn btn-gradient-primary mr-2" onClick={HandleSubmit}>{data ? 'Update' : 'Save'}</button>
                                        <button className="btn btn-light" onClick={handleClose}>Cancel</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    {isLoading && <Spinner />}
                </Modal.Body>
            </Modal>
        </>
    )
}

export default DocumentModalComponent
