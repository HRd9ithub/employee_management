import { useNavigate } from "react-router-dom";
import { RemoveLocalStorage } from "../../service/StoreLocalStorage";

const GlobalPageRedirect = () => {

    let history = useNavigate();

    const getCommonApi = async () => {
        history('/login');
        RemoveLocalStorage("user_id");
        RemoveLocalStorage("token");
    }


    return { getCommonApi }
}

export default GlobalPageRedirect;
