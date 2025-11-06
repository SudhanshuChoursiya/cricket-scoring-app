import { baseApi } from "./baseApi";

export const authApi = baseApi.injectEndpoints({
    endpoints: builder => ({
        // Login with Google
        loginWithGoogle: builder.mutation({
            query: authCode => ({
                url: "/login",
                method: "POST",
                body: { authCode }
            })
        })
    }),
    overrideExisting: false
});

export const { useLoginWithGoogleMutation } = authApi;

