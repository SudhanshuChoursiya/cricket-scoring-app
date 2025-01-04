import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    extrasModal: {
        title: "",
        inputLabel: "",
        inputValue: 0,
        payload: null,
        isShow: false
    },
    overCompleteModal: {
        isShow: false
    },
    inningCompleteModal: {
        isShow: false
    },
    matchCompleteModal: {
        isShow: false
    },
    undoModal: {
        isShow: false
    },
    changeStrikeModal: {
        isShow: false
    },
    replaceBowlerModal: {
        isShow: false
    },
    outMethodModal: {
        isShow: false
    },
    customRunsModal: {
        inputLabel: "",
        inputValue: 0,
        payload: null,
        isShow: false
    }
};

const modalSlice = createSlice({
    name: "modal",
    initialState,
    reducers: {
        setExtrasModal: (state, action) => {
            state.extrasModal = { ...state.extrasModal, ...action.payload };
        },
        setOverCompleteModal: (state, action) => {
            state.overCompleteModal = {
                ...state.overCompleteModal,
                ...action.payload
            };
        },
        setInningCompleteModal: (state, action) => {
            state.inningCompleteModal = {
                ...state.inningCompleteModal,
                ...action.payload
            };
        },
        setMatchCompleteModal: (state, action) => {
            state.matchCompleteModal = {
                ...state.matchCompleteModal,
                ...action.payload
            };
        },
        setUndoModal: (state, action) => {
            state.undoModal = {
                ...state.undoModal,
                ...action.payload
            };
        },
        setChangeStrikeModal: (state, action) => {
            state.changeStrikeModal = {
                ...state.changeStrikeModal,
                ...action.payload
            };
        },
        setReplaceBowlerModal: (state, action) => {
            state.replaceBowlerModal = {
                ...state.replaceBowlerModal,
                ...action.payload
            };
        },
        setOutMethodModal: (state, action) => {
            state.outMethodModal = {
                ...state.outMethodModal,
                ...action.payload
            };
        },
        setCustomRunsModal: (state, action) => {
            state.customRunsModal = {
                ...state.customRunsModal,
                ...action.payload
            };
        }
    }
});

export const {
    setExtrasModal,
    setOverCompleteModal,
    setInningCompleteModal,
    setMatchCompleteModal,
    setUndoModal,
    setChangeStrikeModal,
    setReplaceBowlerModal,
    setOutMethodModal,
    setCustomRunsModal
} = modalSlice.actions;

export default modalSlice.reducer;
