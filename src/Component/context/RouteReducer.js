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
        case "GET_LEAVE":
            return {
                ...state,
                leave: action.payload.data,
                leaveFilter: action.payload.data,
                permission: action.payload.permissions
            }
            // eslint-disable-next-line
            break;
        case "SERVER_ERROR":
            return {
                ...state,
                serverError :true
            }
            // eslint-disable-next-line
            break;
        case "SERACH_FILTER":
            let data = action.payload.toLowerCase();
            let result = state.leaveFilter.filter((val) => {
                return (val.user?.first_name && val.user.first_name.concat(" ", val.user.last_name).toLowerCase().includes(data)) ||
                    val.leaveType.toLowerCase().includes(data) ||
                    val.from_date.toString().includes(data) ||
                    val.to_date.toString().includes(data) ||
                    val.duration.toString().includes(data) ||
                    val.leave_for.toLowerCase().includes(data) ||
                    val.reason.toLowerCase().includes(data) ||
                    val.status.toLowerCase().includes(data)
            })
            return {
                ...state,
                leave: result
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

