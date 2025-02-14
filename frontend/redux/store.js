import { configureStore, combineReducers } from "@reduxjs/toolkit";

import authReducer from "./authSlice.js";

import alertReducer from "./alertSlice.js";
import toastReducer from "./toastSlice.js";

import matchReducer from "./matchSlice.js";
import modalReducer from "./modalSlice.js";

const rootReducer = combineReducers({
    auth: authReducer,
    alert: alertReducer,
    toast: toastReducer,
    match: matchReducer,
    modal: modalReducer
});

const store = configureStore({
    reducer: rootReducer
});

export default store;
