import React, { useEffect, useState } from 'react'
import { Modal, Table } from 'react-bootstrap'
import { BiColumns } from 'react-icons/bi';

const RenameComponent = ({ staticHead, newcolumns, setnewcolumns, settableData, count, setCount }) => {
    const [show, setShow] = useState(false);
    const [data, setData] = useState([]);
    const [row, setRow] = useState(1);

    // fixed header
    const fixedHeader = ["itemName", "GST", "rate", "quantity", "amount", "CGST", "SGST", "IGST", "total"];

    useEffect(() => {
        setData(staticHead)
    }, [staticHead])

    // modal show function
    const handleShow = () => {
        setShow(true);
        setData(newcolumns);
        setRow(count)
    }

    // modal close function
    const handleClose = (e) => {
        e.preventDefault();
        setShow(false)
        setData(newcolumns);
    }

    // toggle hide or show
    const toggleHideShow = (id, boolean) => {
        let list = [...data];
        list[id].toggle = !boolean;
        setData(list);
    }

    // Function to rename a column
    const renameColumn = (oldFieldName, newFieldName) => {
        setData(prevColumns => prevColumns.map(column =>
            column.name === oldFieldName ? { ...column, field: newFieldName } : column
        ));
    };

    // Function to REMOVE a column
    const removeColumn = (id) => {
        setData(prevColumns => prevColumns.filter((column, ind) => ind !== id));
    }


    // submit 
    const handleSubmit = (e) => {
        e.preventDefault();
        const errors = data.find((val) => val.error && val.error?.length !== 0);

        if (errors) {
            return false;
        }
        setnewcolumns(data);
        const headData = data.map((val) => {
            return val.name
        })
        settableData(prevData => prevData.map(obj => {
            const newObj = {};
            headData.forEach(key => {
                newObj[key] = obj.hasOwnProperty(key) ? obj[key] : "";
            });
            return {
                ...newObj, description: obj.description,
                descriptionToggle: obj.descriptionToggle
            };
        }));
        setCount(row)
        setShow(false);
    }

    // Function to add a new column
    const addNewColumn = () => {
        const newColumn = { field: `New Column ${row}`, name: `newColumn${row}`, type: 'text', toggle: true, error: [] }
        setRow(row + 1);
        setData(prevColumns => [...prevColumns, newColumn]);
    };

    // validation
    const handleinputValidation = (id) => {
        setData(prevData => prevData.map((val, ind) => {
            if (ind === id) {
                if (!val.field.trim()) {
                    return { ...val, error: ["Field is a reauired."] }
                } else {
                    return { ...val, error: [] }
                }
            }
            return val
        }))
    }

    return (
        <>
            <button type="button" className="btn btn-gradient-primary btn-rounded btn-fw text-center button-full-width ml-2 d-flex align-items-center" onClick={handleShow}>
                <BiColumns />&nbsp;Rename/Add Fields
            </button>
            <Modal show={show} animation={true} size="md" aria-labelledby="example-modal-sizes-title-sm" className='department-modal' centered>
                <Modal.Header className='small-modal'>
                    <Modal.Title>Edit Columns</Modal.Title>
                    <p className='close-modal' onClick={handleClose}><i className="fa-solid fa-xmark"></i></p>
                </Modal.Header>
                <Modal.Body>
                    <div className=" grid-margin stretch-card inner-pages mb-lg-0">
                        <div className="card">
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-12 text-right">
                                        <button className="btn btn-gradient-primary mr-2" onClick={addNewColumn}><i className="fa-solid fa-plus"></i> Add New Column</button>
                                    </div>
                                </div>
                                <div className='row'>
                                    <div className="col-md-6 pb-3">
                                        <span className='rename-table-head'>Column Name</span>
                                    </div>
                                    <div className="col-md-6 pb-3 text-center">
                                        <span className='rename-table-head'>Action</span>
                                    </div>
                                </div>
                                {
                                    data.map((val, ind) => {
                                        return (
                                            !val.hide && <div className='row' key={ind}>
                                                <div className="col-md-6 mb-2">
                                                    <input className='form-control' type="text" value={val.field || ''} onChange={(event) => renameColumn(val.name, event.target.value)} onBlur={() => handleinputValidation(ind)} />
                                                    {val.error?.length !== 0 && val.error?.map((val, id) => {
                                                        return <span className="form-text error" key={id}>{val}</span>
                                                    })}
                                                </div>
                                                {ind !== 0 &&
                                                    <div className="col-md-6">
                                                        <div className="d-flex align-items-center justify-content-center" style={{ gap: "13px" }}>
                                                            {val.toggle ?
                                                                <div className="text-center cursor-pointer w-50" onClick={() => toggleHideShow(ind, val.toggle)}>
                                                                    <i className="fa-regular fa-eye"></i>
                                                                    <h6 className='mb-0'>Hide</h6>
                                                                </div> :
                                                                <div className="text-center cursor-pointer w-50" onClick={() => toggleHideShow(ind, val.toggle)}>
                                                                    <i className="fa-regular fa-eye-slash"></i>
                                                                    <h6 className='mb-0'>Unhide</h6>
                                                                </div>}
                                                            {!fixedHeader.includes(val.name) &&
                                                                <div className="text-center cursor-pointer" onClick={() => removeColumn(ind)}>
                                                                    <i className="fa-solid fa-trash-can"></i>
                                                                    <h6 className='mb-0'>Delete</h6>
                                                                </div>}
                                                        </div>
                                                    </div>}
                                            </div>
                                        )
                                    })
                                }
                                <div className='row'>
                                    <div className='col-md-12'>
                                        <Table responsive="md" gap="10" style={{ background: "rgb(247, 250, 255)" }}>
                                            <thead className='head-item'>
                                                <tr>
                                                    {data.map((val, ind) => val.toggle && <th key={ind}>{val.field}</th>)}
                                                </tr>
                                            </thead>
                                        </Table>
                                    </div>
                                </div>
                                <div className='d-flex justify-content-center modal-button mt-3'>
                                    <button type="submit" className="btn btn-gradient-primary mr-2" onClick={handleSubmit}>Save</button>
                                    <button className="btn btn-light" onClick={handleClose}>Cancel</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* {isLoading && <Spinner />} */}
                </Modal.Body>
            </Modal>
        </>
    )
}

export default RenameComponent
