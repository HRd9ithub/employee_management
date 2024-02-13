import React, { useMemo } from 'react';
import Table from 'react-bootstrap/Table';
import convertNumberFormat from '../../../../service/NumberFormat';
import JoditEditor from 'jodit-react';

const ItemComponent = (props) => {
    const { removeRowTable, tableData, newcolumns, handleItemchange, toggleDescription, handleDescriptionChange, itemNameError, setitemNameError, rateError, setrateError, quantiyError, setquantiyError, currency } = props

    const config = useMemo(() => {
        return {
            readonly: false,
            placeholder: 'write your content ....'
        }
    }, []);


    return (
        <>
            <div className='row'>
                <div className='col-md-12 pe-5'>
                    <Table responsive="md" gap="10" style={{ background: "rgb(247, 250, 255)" }}>
                        <thead className='head-item'>
                            <tr>
                                {newcolumns.map((val, id) => {
                                    return val.toggle && <th key={id}>{val.field}{val.name === "amount" &&`(${currency.value?.slice(6)})`}</th>
                                })}
                                <th></th>
                            </tr>
                        </thead>
                        <tbody className='body-div'>
                            {tableData.map((itemData, ind) => {
                                return (
                                    <React.Fragment key={ind}>
                                        <tr className="table-border">
                                            {newcolumns.map((column, id) => {
                                                return (
                                                    column.toggle &&<td key={id}>
                                                        {column.name === "itemName" ?
                                                            <div style={{ height: "38px" }}>
                                                                <input className='form-control' placeholder='item name' name="itemName" type="text" value={itemData.itemName || ""} onChange={(e) => handleItemchange(e, ind)} onBlur={(e) => {
                                                                    if (!itemData.itemName.trim()) {
                                                                        let list = itemNameError.filter((val) => {
                                                                            return val.id === ind
                                                                        })
                                                                        if (list.length === 0) {
                                                                            setitemNameError([...itemNameError, { item: "Item name is a required", id: ind }])
                                                                        }
                                                                    } else {
                                                                        let temp = itemNameError.filter((elem) => {
                                                                            return elem.id !== ind
                                                                        })
                                                                        setitemNameError(temp)
                                                                    }
                                                                }} />
                                                                {itemNameError.map((val) => (
                                                                    val.id === ind && <span className='error' key={val.id}>{val.item}</span>
                                                                ))}
                                                            </div> :
                                                            column.name === "GST" ? <input className='form-control' type="number" value={itemData.GST || ""} name='GST' onChange={(e) => handleItemchange(e, ind)} /> :
                                                                column.name === "rate" ?
                                                                    <div style={{ height: "38px" }}>
                                                                        <input className='form-control' type="number" min="0" name="rate" value={itemData.rate || ""} onChange={(e) => handleItemchange(e, ind)} onBlur={(e) => {
                                                                            if (!itemData.rate.trim()) {
                                                                                let list = rateError.filter((val) => {
                                                                                    return val.id === ind
                                                                                })
                                                                                if (list.length === 0) {
                                                                                    setrateError([...rateError, { rate: "Rate is a required field.", id: ind }])
                                                                                }
                                                                            } else {
                                                                                let temp = rateError.filter((elem) => {
                                                                                    return elem.id !== ind
                                                                                })
                                                                                setrateError(temp)
                                                                            }
                                                                        }} />
                                                                        {rateError.map((val) => (
                                                                            val.id === ind && <span className='error' key={val.id}>{val.rate}</span>
                                                                        ))}
                                                                    </div> : column.name === "quantity" ?
                                                                        <div style={{ height: "38px" }}>
                                                                            <input className='form-control' type="number" min="0" name="quantity" value={itemData.quantity || ''} onChange={(e) => handleItemchange(e, ind)} onBlur={(e) => {
                                                                                if (!itemData.quantity) {
                                                                                    let list = quantiyError.filter((val) => {
                                                                                        return val.id === ind
                                                                                    })
                                                                                    if (list.length === 0) {
                                                                                        setquantiyError([...quantiyError, { Quantity: "Quantity is a required field", id: ind }])
                                                                                    }
                                                                                } else {
                                                                                    let temp = quantiyError.filter((elem) => {
                                                                                        return elem.id !== ind
                                                                                    })
                                                                                    setquantiyError(temp)
                                                                                }
                                                                            }} />
                                                                            {quantiyError.map((val) => (
                                                                                val.id === ind && <span className='error' key={val.id}>{val.Quantity}</span>
                                                                            ))}
                                                                        </div> : column.name === "CGST" ?
                                                                            <input className='form-control' type="text" value={itemData.CGST || ''} readOnly />
                                                                            : column.name === "SGST" ?
                                                                                <input className='form-control' type="text" value={itemData.SGST || ''} readOnly />
                                                                                : column.name === "IGST" ?
                                                                                    <input className='form-control' type="text" value={itemData.IGST || ''} readOnly /> :
                                                                                    column.name === "amount" ?
                                                                                        <input className='form-control' type="text" value={convertNumberFormat(itemData.amount) || ''} readOnly /> :
                                                                                    column.name === "total" ?
                                                                                        <input className='form-control' type="text" value={convertNumberFormat(itemData.total) || ''} readOnly /> :
                                                                                        <input
                                                                                            className='form-control'
                                                                                            type="text"
                                                                                            value={itemData[column.name] || ''}
                                                                                            name={column.name}
                                                                                            placeholder={column.field}
                                                                                            onChange={(e) => handleItemchange(e, ind)}
                                                                                        />
                                                        }
                                                    </td>
                                                )
                                            })}
                                            {ind > 0 &&
                                                <td className="text-center"><i className="fa-solid fa-xmark text-maroon cursor-pointer" onClick={() => removeRowTable(ind)}></i></td>}
                                        </tr>
                                        <tr>
                                            <td className='py-0 pb-2'>
                                                {!itemData.descriptionToggle ?
                                                    <div className='invoice-desciption-button'>
                                                        <i className="fa-regular fa-square-plus mr-1"></i>
                                                        <span onClick={() => toggleDescription(ind)}>Add Description</span>
                                                    </div> :
                                                    <JoditEditor
                                                        config={config}
                                                        value={itemData.description || ''}
                                                        tabIndex={1}
                                                        onChange={newContent => handleDescriptionChange(newContent, ind)} // preferred to use only this option to update the content for performance reasons
                                                    />}
                                            </td>
                                        </tr>
                                    </React.Fragment>
                                )
                            })}
                        </tbody>
                    </Table>
                </div>
            </div>
        </>
    )
}

export default ItemComponent
