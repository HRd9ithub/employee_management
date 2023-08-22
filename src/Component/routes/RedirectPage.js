import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { GetLocalStorage } from '../../service/StoreLocalStorage';

const RedirectPage = ({ Component }) => {

    let navigate = useNavigate();

    useEffect(() => {
        if (GetLocalStorage("token")) {
            return navigate("/")
        }
        // eslint-disable-next-line
    }, [])

    return (
        <Component />
    )
}

export default RedirectPage