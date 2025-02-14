import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    teamA: {
        id: null,
        name: null,
        playing11: [],
        captain: null
    },
    teamB: {
        id: null,
        name: null,
        playing11: [],
        captain: null
    },
    totalOvers: null,
    matchPlace: {
        city: null,
        ground: null
    },
    tossWinner: null,
    tossDecision: null,
    strikeBatsman: {
        playerId: null,
        name: null
    },
    nonStrikeBatsman: {
        playerId: null,
        name: null
    },
    currentBowler: {
        playerId: null,
        name: null
    },
    fielder: {
        playerId: null,
        name: null
    },
    undoStack: []
};

const matchSlice = createSlice({
    name: "match",
    initialState,
    reducers: {
        setTeamAId: (state, action) => {
            state.teamA.id = action.payload;
        },
        setTeamBId: (state, action) => {
            state.teamB.id = action.payload;
        },
        setTeamAName: (state, action) => {
            state.teamA.name = action.payload;
        },
        setTeamBName: (state, action) => {
            state.teamB.name = action.payload;
        },
        setTeamAPlaying11: (state, action) => {
            state.teamA.playing11 = action.payload;
        },
        setTeamBPlaying11: (state, action) => {
            state.teamB.playing11 = action.payload;
        },
        setTeamACaptain: (state, action) => {
            state.teamA.captain = action.payload;
        },
        setTeamBCaptain: (state, action) => {
            state.teamB.captain = action.payload;
        },
        setTotalOvers: (state, action) => {
            state.totalOvers = action.payload;
        },
        setCity: (state, action) => {
            state.matchPlace.city = action.payload;
        },
        setGround: (state, action) => {
            state.matchPlace.ground = action.payload;
        },
        setTossWinner: (state, action) => {
            state.tossWinner = action.payload;
        },
        setTossDecision: (state, action) => {
            state.tossDecision = action.payload;
        },
        setStrikeBatsman: (state, action) => {
            state.strikeBatsman.playerId = action.payload._id;
            state.strikeBatsman.name = action.payload.name;
        },
        setNonStrikeBatsman: (state, action) => {
            state.nonStrikeBatsman.playerId = action.payload._id;
            state.nonStrikeBatsman.name = action.payload.name;
        },
        setCurrentBowler: (state, action) => {
            state.currentBowler.playerId = action.payload._id;
            state.currentBowler.name = action.payload.name;
        },
        setFielder: (state, action) => {
            state.fielder.playerId = action.payload._id;
            state.fielder.name = action.payload.name;
        },
        setUndoStack: (state, action) => {
            const newTimeline = action.payload;
            newTimeline.forEach(ball => {
                const exist = state.undoStack.some(
                    exitstingBall => exitstingBall._id === ball._id
                );
                if (!exist) {
                    state.undoStack.push(ball);
                }
            });
        },
        popUndoStack: (state, action) => {
            state.undoStack.pop();
        },
        clearUndoStack: (state, action) => {
            state.undoStack = [];
        }
    }
});

export const {
    setTeamAId,
    setTeamBId,
    setTeamAName,
    setTeamBName,
    setTeamAPlaying11,
    setTeamBPlaying11,
    setTeamACaptain,
    setTeamBCaptain,
    setTotalOvers,
    setCity,
    setGround,
    setTossWinner,
    setTossDecision,
    setStrikeBatsman,
    setNonStrikeBatsman,
    setCurrentBowler,
    setFielder,
    setUndoStack,
    popUndoStack,
    clearUndoStack
} = matchSlice.actions;

export default matchSlice.reducer;
