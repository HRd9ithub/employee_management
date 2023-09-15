export const RouteReducer = (state, action) => {
    switch (action.type) {
        case "GET_USER_DATA":
            return {
                ...state,
                UserData: action.payload
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

