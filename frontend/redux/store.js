import { configureStore, combineReducers } from "@reduxjs/toolkit";

import authReducer from "./authSlice.js";

import alertReducer from "./alertSlice.js";

import matchReducer from "./matchSlice.js";

const rootReducer = combineReducers({
    auth: authReducer,
    alert: alertReducer,
    match: matchReducer
});

const store = configureStore({
    reducer: rootReducer
});

export default store;
