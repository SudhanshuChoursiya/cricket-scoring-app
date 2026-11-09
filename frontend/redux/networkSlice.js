import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isOffline: null
};

const networkSlice = createSlice({
    name: "network",
    initialState,
    reducers: {
        setNetworkStatus: (state, action) => {
            state.isOffline = !action.payload;
        }
    }
});

export const { setNetworkStatus } = networkSlice.actions;

export default networkSlice.reducer;
