import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { GetLocalStorage } from '../../service/StoreLocalStorage';

const RedirectPage = ({ children }) => {

    let navigate = useNavigate();

    useEffect(() => {
        if (GetLocalStorage("token")) {
            return navigate("/")
        }
        // eslint-disable-next-line
    }, [])

    return children  
}

export default RedirectPage