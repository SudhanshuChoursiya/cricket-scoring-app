import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    teamA: {
        name: null,
        playing11: []
    },
    teamB: {
        name: null,
        playing11: []
    },
    totalOvers: null,
    matchPlace: {
        city: null,
        ground: null
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
            state.teamA.playing11 = action.payload;
        },
        setTeamBPlaying11: (state, action) => {
            state.teamB.playing11 = action.payload;
        },
        setTotalOvers: (state, action) => {
            state.totalOvers = action.payload;
        },
        setCity: (state, action) => {
            state.matchPlace.city = action.payload;
        },
        setGround: (state, action) => {
            state.matchPlace.ground = action.payload;
        }
    }
});

export const {
    setTeamA,
    setTeamB,
    setTeamAPlaying11,
    setTeamBPlaying11,
    setTotalOvers,
    setCity,
    setGround
} = matchSlice.actions;

export default matchSlice.reducer;
