import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { GetLocalStorage } from '../service/StoreLocalStorage';

const ProtectedRoute = ({ children, name }) => {
    // use for redirect the page
    let navigate = useNavigate();
    // get url of page
    let location = useLocation();

    const getProtectedData = async () => {
        // get localstorage in token
        if (!GetLocalStorage("token")) {
            // redirect page
            navigate('/login')
        } 
    }

    useEffect(() => {
        getProtectedData()
        // eslint-disable-next-line
    }, [location])

    return children
}

export default ProtectedRoute;
