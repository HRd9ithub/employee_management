import react from 'react';
const ErrorComponent = () => {
    return(
        <div className='invoice-error-box p-3'>
            <span><i className="fa-solid fa-circle-exclamation mr-2"></i> Please fill the following details</span>
            <ol className='mt-3 mb-0'>
                <li>Name is invalid</li>
                <li>Name is invalid</li>
                <li>Name is invalid</li>
            </ol>
        </div>
    )
}

export default ErrorComponent