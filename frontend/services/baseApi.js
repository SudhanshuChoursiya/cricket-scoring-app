import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { handleApiError } from "../utils/apiErrorHandler.js";

const rawBaseQuery = fetchBaseQuery({
    baseUrl: process.env.EXPO_PUBLIC_BASE_URL,
    timeout: 15000,

    prepareHeaders: (headers, { getState }) => {
        const token = getState().auth.accessToken;

        if (token) {
            headers.set("authorization", `Bearer ${token}`);
        }

        return headers;
    }
});

const baseQuery = async (args, api, extraOptions) => {
    const isOffline = api.getState().network.isOffline;

    if (isOffline !== false) {
        const error = {
            status: "OFFLINE",
            error: "No internet connection"
        };

        handleApiError(error, api.dispatch);

        return { error };
    }

    const result = await rawBaseQuery(args, api, extraOptions);

    if (result.error) {
        handleApiError(result.error, api.dispatch);
    }

    return result;
};

export const baseApi = createApi({
    reducerPath: "api",
    baseQuery,

    tagTypes: [
        "Matches",
        "Match",
        "Tournaments",
        "Tournament",
        "Teams",
        "Team",
        "Auth"
    ],

    endpoints: () => ({})
});