import { configureStore, combineReducers } from "@reduxjs/toolkit";

import authReducer from "./authSlice.js";

import alertReducer from "./alertSlice.js";


const rootReducer = combineReducers({
    auth: authReducer,
    alert: alertReducer,
});

const store = configureStore({
    reducer: rootReducer
});

export default store;
