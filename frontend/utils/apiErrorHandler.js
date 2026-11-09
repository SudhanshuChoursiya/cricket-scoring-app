import { showToast } from "../redux/toastSlice.js";

export const handleApiError = (error, dispatch) => {
    const { status, data } = error;

    let message = "Something went wrong";

    switch (status) {
        case "OFFLINE":
            message = "No internet connection";
            break;

        case "FETCH_ERROR":
            message = "Network connection lost.";
            break;

        case "TIMEOUT_ERROR":
            message = "Request timed out";
            break;

        case 401:
            message = "Unauthorized. Please login again.";
            break;

        case 500:
        case 502:
        case 503:
        case 504:
            message = "Server error. Please try again later.";
            break;

        default:
            message = data?.message || "Something went wrong";
    }

    dispatch(showToast({
        type: "error",
        message
    }));
};