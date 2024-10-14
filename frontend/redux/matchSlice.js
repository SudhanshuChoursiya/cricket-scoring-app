import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    teamA: {
        name: null,
        playing11: []
    },
    teamB: {
        name: null,
        playing11: []
    }
};

const matchSlice = createSlice({
    name: "match",
    initialState,
    reducers: {
        setTeamA: (state, action) => {
            state.teamA.name = action.payload;
        },
        setTeamB: (state, action) => {
            state.teamB.name = action.payload;
        },
        setTeamAPlaying11: (state, action) => {
            state.teamA.playing11 = [
                ...state.teamA.playing11,
                ...action.payload
            ];
        },
        setTeamBPlaying11: (state, action) => {
            state.teamB.playing11 = [
                ...state.teamB.playing11,
                ...action.payload
            ];
        }
    }
});

export const { setTeamA, setTeamB, setTeamAPlaying11, setTeamBPlaying11 } =
    matchSlice.actions;

export default matchSlice.reducer;
