import { useNavigate } from "react-router-dom";
import { clearLocalStorage } from "../../service/StoreLocalStorage";

const GlobalPageRedirect = () => {

    let history = useNavigate();

    const getCommonApi = async () => {
        history('/login');
        clearLocalStorage();
    }


    return { getCommonApi }
}

export default GlobalPageRedirect;
