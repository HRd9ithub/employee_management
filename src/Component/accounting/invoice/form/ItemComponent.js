import React from 'react';
import Table from 'react-bootstrap/Table';
import convertNumberFormat from '../../../../service/NumberFormat';

const ItemComponent = (props) => {
    const { removeRowTable, tableData, handleItemchange, itemNameError, tax, setitemNameError, rateError, setrateError, quantiyError, setquantiyError, currency } = props

    return (
        <>
            <div className='row'>
                <div className='col-md-12 pe-5'>
                    <Table responsive="md" gap="10" style={{ background: "rgb(247, 250, 255)" }}>
                        <thead className='head-item'>
                            <tr>
                                <th>Item Name</th>
                                {tax && <th>GST</th>}
                                <th>Rate</th>
                                <th>Quantity</th>
                                {tax === "IGST" && <th>IGST</th>}
                                {tax === "CGST" && <><th>CGST</th><th>SGST</th></>}
                                <th>Amount({currency.value?.slice(6)})</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody className='body-div'>
                            {tableData.map((itemData, ind) => {
                                return (
                                    <tr key={ind} className="table-border">
                                        <td>
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
                                            </div>
                                        </td>
                                        {tax && <td><input className='form-control' type="text" value={itemData.GST || ""} name='GST' onChange={(e) => handleItemchange(e, ind)} /></td>}
                                        <td>
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
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ height: "38px" }}>
                                                <input className='form-control' type="number" min="0" name="quantity" value={itemData.quantity} onChange={(e) => handleItemchange(e, ind)} onBlur={(e) => {
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
                                            </div>
                                        </td>
                                        {tax === "IGST" && <td><input className='form-control' type="text" value={itemData.IGST} readOnly /></td>}
                                        {tax === "CGST" && <><td><input className='form-control' type="text" value={itemData.CGST} readOnly /></td><td><input className='form-control' type="text" value={itemData.SGST} readOnly /></td></>}
                                        <td><input className='form-control' type="text" value={convertNumberFormat(itemData.amount)} readOnly /></td>
                                        {ind > 0 &&
                                            <td onClick={() => removeRowTable(ind)} className="text-center"><i className="fa-solid fa-xmark text-maroon"></i></td>}
                                    </tr>
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
