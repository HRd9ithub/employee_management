import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { GetLocalStorage } from '../../service/StoreLocalStorage';
import GlobalPageRedirect from "../auth_context/GlobalPageRedirect";

const ProtectedRoute = ({ children, authentication }) => {
    // use for redirect the page
    let navigate = useNavigate();
    // get url of page
    let { pathname } = useLocation();

    let currDate = new Date().getDate();
    let { getCommonApi } = GlobalPageRedirect();

    const getProtectedData = async () => {
        // get localstorage in token
        if (authentication && !GetLocalStorage("token")) {
            // redirect page
            navigate('/login');
        } else if (authentication && GetLocalStorage("userVerify") === "true") {
            navigate(`/profile/${GetLocalStorage("user_id")}`);
        } else if (!authentication && GetLocalStorage("token")) {
            navigate('/');
        }
    }

    useEffect(() => {
        setInterval(async () => {
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
        getProtectedData();
        // eslint-disable-next-line
    }, [pathname])

    if (GetLocalStorage("userVerify") !== "true" && authentication) {
        return children
    } else if (!authentication) {
        return children
    }
}

export default ProtectedRoute;
