import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { GetLocalStorage } from '../service/StoreLocalStorage';
import GlobalPageRedirect from "../Component/auth_context/GlobalPageRedirect";


const ProtectedRoute = ({ children, name }) => {
    // use for redirect the page
    let navigate = useNavigate();
    // get url of page
    let location = useLocation();

    let currDate = new Date().getDate();
    let { getCommonApi } = GlobalPageRedirect();


    const getProtectedData = async () => {
        // get localstorage in token
        if (!GetLocalStorage("token")) {
            // redirect page
            navigate('/login')
        }
    }

    useEffect(() => {
        setInterval(async() => {
            if (currDate !== new Date().getDate()) {
                getCommonApi(); 
                currDate = new Date().getDate()
            } else {
                currDate = new Date().getDate()
            }
        }, 1000)
    }, [currDate])

    useEffect(() => {
        getProtectedData()
        // eslint-disable-next-line
    }, [location])

    return children
}

export default ProtectedRoute;
