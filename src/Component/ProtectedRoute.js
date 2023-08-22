import React, { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AppProvider } from './context/RouteContext';
import Error403 from './error_pages/Error403';
import { GetLocalStorage } from '../service/StoreLocalStorage';

const ProtectedRoute = ({ children, name }) => {
    // use for redirect the page
    let navigate = useNavigate();
    // get url of page
    let location = useLocation();
    // const [toggle,setToggle] = useState(false)

    let { PageData, UserData, Permission, getUserData, FindPermission, accessData, getPremission, getPage } = useContext(AppProvider)
    const getProtectedData = async () => {
        // get localstorage in token
        if (!GetLocalStorage("token")) {
            // redirect page
            navigate('/login')
        } else {
            // get single user data
            if(Permission.length === 0){
                getPremission();
            }
            if(!UserData){
                getUserData();
            }
            if (PageData.length === 0) {
                getPage();
            }
            // find only one page permision condition
            if (Permission.length !== 0 && (UserData && UserData.role && UserData.role.name.toLowerCase() !== 'admin') && !name) {
                FindPermission(location.pathname)
            }
        }
    }

    useEffect(() => {
        getProtectedData()
        // eslint-disable-next-line
    }, [location, PageData])

    if ((UserData && UserData.role && UserData.role.name.toLowerCase() === 'admin') || (accessData.length !== 0 && accessData[0].list === '1') || name === "view" || name === "Dashboard" ) {
        return children
    } else {
        if (PageData.length === 0) {
            setTimeout(() => {
                return (
                    <Error403 />
                )
            }, 3000)
        } else {
            return (
                <Error403 />
            )
        }
    }
}

export default ProtectedRoute;
