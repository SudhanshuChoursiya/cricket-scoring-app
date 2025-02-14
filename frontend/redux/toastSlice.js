import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    message: null,
    visible: false
};

const toastSlice = createSlice({
    name: "toast",
    initialState,
    reducers: {
        showToast: (state, action) => {
            state.message = action.payload;
            state.visible = true;
        },
        hideToast: state => {
            state.visible = false;
            state.message = null;
        }
    }
});

export const { showToast, hideToast } = toastSlice.actions;
export default toastSlice.reducer;
