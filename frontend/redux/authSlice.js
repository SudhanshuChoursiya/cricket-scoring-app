import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import AsyncStorage from "@react-native-async-storage/async-storage";

//action
export const fetchAuth = createAsyncThunk("fetchAuth", async () => {
    try {
        const accessToken = await AsyncStorage.getItem("accessToken");
        const refreshToken = await AsyncStorage.getItem("refreshToken");

        const response = await fetch(
            `${process.env.EXPO_PUBLIC_BASE_URL}/check-auth`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );
        const data = await response.json();

        if (response.status === 403) {
            const refreshResponse = await fetch(
                `${process.env.EXPO_PUBLIC_BASE_URL}/refresh-access-token`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ refreshToken })
                }
            );
            const refreshData = await refreshResponse.json();

            if (
                refreshResponse.status === 200 &&
                refreshData.data.accessToken
            ) {
                await AsyncStorage.setItem(
                    "accessToken",
                    refreshData.data.accessToken
                );

                const newAuthResponse = await fetch(
                    `${process.env.EXPO_PUBLIC_BASE_URL}/check-auth`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${refreshData.data.accessToken}`
                        }
                    }
                );
                const newData = await newAuthResponse.json();
                return {
                    data: newData,
                    accessToken: refreshData.data.accessToken
                };
            }
        } else {
            return {
                data,
                accessToken
            };
        }
    } catch (error) {
        throw new Error(error.message);
    }
});

const initialState = {
    isLoading: true,
    user: null,
    isLoggedin: false,
    isError: null,
    accessToken: null
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    extraReducers: builder => {
        builder.addCase(fetchAuth.pending, (state, action) => {
            state.isLoading = true;
        });
        builder.addCase(fetchAuth.fulfilled, (state, action) => {
            state.isLoading = false;
            if (action.payload.data.statusCode === 200) {
                state.user = action.payload.data.data;
                state.isLoggedin = true;
                state.accessToken = action.payload.accessToken;
            } else {
                state.user = null;
                state.isLoggedin = false;
                state.accessToken = null;
            }
        });
        builder.addCase(fetchAuth.rejected, (state, action) => {
            state.isError = true;
            state.isLoading = false;
            state.user = null;
            state.isLoggedin = false;
            state.accessToken = null;
        });
    }
});

export default authSlice.reducer;
