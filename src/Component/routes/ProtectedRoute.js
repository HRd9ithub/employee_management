import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { GetLocalStorage } from '../../service/StoreLocalStorage';

const ProtectedRoute = ({ children, authentication }) => {
    // use for redirect the page
    const navigate = useNavigate();
    // get url of page
    const { pathname } = useLocation();

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
