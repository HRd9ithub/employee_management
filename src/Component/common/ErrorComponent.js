const ErrorComponent = ({ errors }) => {
    return (
        <div className='invoice-error-box p-3'>
            <span><i className="fa-solid fa-circle-exclamation mr-2"></i> Please complete following details</span>
            <ol className='mt-3 mb-0'>
                {errors.map((curElem, ind) => {
                    return <li key={ind}>{curElem}</li>
                })}
            </ol>
        </div>
    )
}

export default ErrorComponent