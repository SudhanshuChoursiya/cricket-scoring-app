import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    extraRunsModal: {
        title: null,
        runsInput: {
            isShow: false,
            value: null,
            label: null
        },
        payload: null,
        isShow: false
    },
    customRunsModal: {
        runsInput: {
            isShow: false,
            value: null,
            label: null
        },
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
    replaceBatsmanModal: {
        isShow: false
    },
    changeSquadModal: {
        isShow: false
    },
    changeCaptainModal: {
        isShow: false
    },
    endInningModal: {
        isShow: false
    },
    endMatchModal: {
        isShow: false
    },
    outMethodModal: {
        isShow: false
    },
    confirmModal: {
        isShow: false,
        actionType: null,
        title: null,
        description: null
    },
    superOverModal: {
        isShow: false
    }
};

const modalSlice = createSlice({
    name: "modal",
    initialState,
    reducers: {
        setExtraRunsModal: (state, action) => {
            state.extraRunsModal = {
                ...state.extraRunsModal,
                ...action.payload
            };
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
        setReplaceBatsmanModal: (state, action) => {
            state.replaceBatsmanModal = {
                ...state.replaceBatsmanModal,
                ...action.payload
            };
        },
        setChangeSquadModal: (state, action) => {
            state.changeSquadModal = {
                ...state.changeSquadModal,
                ...action.payload
            };
        },
        setChangeCaptainModal: (state, action) => {
            state.changeCaptainModal = {
                ...state.changeCaptainModal,
                ...action.payload
            };
        },
        setEndInningModal: (state, action) => {
            state.endInningModal = {
                ...state.endInningModal,
                ...action.payload
            };
        },
        setEndMatchModal: (state, action) => {
            state.endMatchModal = {
                ...state.endMatchModal,
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
        },
        setConfirmModal: (state, action) => {
            state.confirmModal = {
                ...state.confirmModal,
                ...action.payload
            };
        },
        setSuperOverModal: (state, action) => {
            state.superOverModal = {
                ...state.superOverModal,
                ...action.payload
            };
        }
    }
});

export const {
    setExtraRunsModal,
    setOverCompleteModal,
    setInningCompleteModal,
    setMatchCompleteModal,
    setUndoModal,
    setChangeStrikeModal,
    setReplaceBowlerModal,
    setReplaceBatsmanModal,
    setChangeSquadModal,
    setChangeCaptainModal,
    setEndInningModal,
    setEndMatchModal,
    setOutMethodModal,
    setCustomRunsModal,
    setConfirmModal,
    setSuperOverModal
} = modalSlice.actions;

export default modalSlice.reducer;
