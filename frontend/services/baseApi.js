import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseApi = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({
        baseUrl: process.env.EXPO_PUBLIC_BASE_URL,
        prepareHeaders: (headers, { getState }) => {
            const token = getState().auth.accessToken;
            if (token) {
                headers.set("authorization", `Bearer ${token}`);
            }
            return headers;
        }
    }),
    tagTypes: [
        "Matches",
        "Match",
        "Tournament",
        "Tournaments",
        "Teams",
        "Team",
        "Auth"
    ],
    endpoints: () => ({})
});
