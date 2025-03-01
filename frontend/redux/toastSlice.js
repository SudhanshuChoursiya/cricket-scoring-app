import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    type: null,
    message: null,
    visible: false
};

const toastSlice = createSlice({
    name: "toast",
    initialState,
    reducers: {
        showToast: (state, action) => {
            state.type = action.payload.type;
            state.message = action.payload.message;
            state.visible = true;
        },
        hideToast: state => {
            state.visible = false;
            state.type = null;
            state.message = null;
        }
    }
});

export const { showToast, hideToast } = toastSlice.actions;
export default toastSlice.reducer;
