// store.js
import { configureStore, combineReducers } from "@reduxjs/toolkit";

// slices
import authReducer from "./authSlice.js";
import toastReducer from "./toastSlice.js";
import matchReducer from "./matchSlice.js";
import tournamentReducer from "./tournamentSlice.js";
import modalReducer from "./modalSlice.js";

// shared base API
import { baseApi } from "../services/baseApi.js";

const rootReducer = combineReducers({
    auth: authReducer,
    toast: toastReducer,
    match: matchReducer,
    tournament: tournamentReducer,
    modal: modalReducer,
    [baseApi.reducerPath]: baseApi.reducer
});

const store = configureStore({
    reducer: rootReducer,
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
            serializableCheck: { warnAfter: 104 }
        }).concat(baseApi.middleware)
});

export default store;
