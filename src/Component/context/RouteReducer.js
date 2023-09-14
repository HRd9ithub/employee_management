export const RouteReducer = (state, action) => {
    switch (action.type) {
        case "GET_USER_DATA":
            return {
                ...state,
                UserData: action.payload
            }
            // eslint-disable-next-line
            break;

        case "GET_PAGE_DATA":
            return {
                ...state,
                PageData: action.payload
            }
            // eslint-disable-next-line
            break;

        case "GET_PERMISSION_DATA":
            return {
                ...state,
                Permission: action.payload
            }
            // eslint-disable-next-line
            break;

        case "PAGE_PERMISSION":
            return {
                ...state,
                accessData: action.payload
            }
            // eslint-disable-next-line
            break;
        case "EMPTY_PERMISSION":
            return {
                ...state,
                accessData: []
            }
            // eslint-disable-next-line
            break;
        case "SET_LOADER":
            return {
                ...state,
                loader: action.payload
            }
            // eslint-disable-next-line
            break;
        case "LEAVE_NOTIFICATION":
            return {
                ...state,
                leaveNotification: action.payload
            }
            // eslint-disable-next-line
            break;
        default:
            return {
                ...state
            }
            // eslint-disable-next-line
            break;
    }
}

