import moment from "moment";

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
                notification: action.payload.notification,
            }
            // eslint-disable-next-line
            break;
        case "GET_LEAVE":
            return {
                ...state,
                leave: action.payload.data,
                leaveFilter: action.payload.data,
                permission: action.payload.permissions,
                permissionToggle: false,
                leaveSetting: action.payload.leaveSettings
            }
            // eslint-disable-next-line
            break;
        case "GET_USER":
            return {
                ...state,
                userName: action.payload.data,
            }
            // eslint-disable-next-line
            break;
        case "GET_REPORT":
            return {
                ...state,
                reportData: action.payload.data,
                summary: action.payload.summary,
            }
            // eslint-disable-next-line
            break;
        case "SERVER_ERROR":
            return {
                ...state,
                serverError: true,
                permissionToggle: false
            }
            // eslint-disable-next-line
            break;
        case "START_LEAVE_LOADING":
            return {
                ...state,
                leaveLoading: true,
                permissionToggle: true,
            }
            // eslint-disable-next-line
            break;
        case "STOP_LEAVE_LOADING":
            return {
                ...state,
                leaveLoading: false,
                permissionToggle: false,
            }
            // eslint-disable-next-line
            break;
        case "SERACH_FILTER":
            let data = action.payload.toLowerCase();
            let result = state.leaveFilter.filter((val) => {
                return (val.user?.first_name && val.user.first_name.concat(" ", val.user.last_name).toLowerCase().includes(data)) ||
                    val.leaveType.toLowerCase().includes(data) ||
                    // val.from_date.toString().includes(data) ||
                    moment(val.to_date).format("DD MMM YYYY").toLowerCase().includes(data) ||
                    moment(val.from_date).format("DD MMM YYYY").toLowerCase().includes(data) ||
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

