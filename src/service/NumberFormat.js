const convertNumberFormat = (value) => {
    // return new Intl.NumberFormat('en-IN', {
    //         style: 'currency',
    //         currency: currency,
    //     }).format(value)

    return new Intl.NumberFormat('en-IN').format(value)
}

export default convertNumberFormat;


