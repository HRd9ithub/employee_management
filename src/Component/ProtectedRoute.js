import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { GetLocalStorage } from '../service/StoreLocalStorage';
import GlobalPageRedirect from "../Component/auth_context/GlobalPageRedirect";


const ProtectedRoute = ({ children, authentication }) => {
    // use for redirect the page
    let navigate = useNavigate();
    // get url of page
    let location = useLocation();

    let currDate = new Date().getDate();
    let { getCommonApi } = GlobalPageRedirect();


    const getProtectedData = async () => {
        // get localstorage in token
        if (authentication && !GetLocalStorage("token")) {
            // redirect page
            navigate('/login');
        }else if(!authentication && GetLocalStorage("token") ){
            navigate('/');
        }else if(!authentication && !GetLocalStorage("email")){
            navigate('/login');
        }else if(!authentication && GetLocalStorage("email")){
            navigate('/otp');
        }
    }

    useEffect(() => {
        setInterval(async() => {
            if (currDate !== new Date().getDate()) {
                getCommonApi(); 
                 // eslint-disable-next-line
                currDate = new Date().getDate()
            } else {
                currDate = new Date().getDate()
            }
        }, 1000)
    }, [currDate])

    useEffect(() => {
        getProtectedData()
        // eslint-disable-next-line
    }, [])

    return children
}

export default ProtectedRoute;
