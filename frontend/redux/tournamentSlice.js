import {
  createSlice
} from "@reduxjs/toolkit";

const initialState = {
  name:null,
  location: {
    city: null,
    ground: null
  },
  startDate: null,
  endDate: null,
};

const tournamentSlice = createSlice( {
  name: "tournament",
  initialState,
  reducers: {
    setName: (state, action) => {
      state.name = action.payload;
    },
    setCity: (state, action) => {
      state.location.city = action.payload;
    },
    setGround: (state, action) => {
      state.location.ground = action.payload;
    },
    setStartDate: (state, action) => {
      state.startDate = action.payload;
    },
    setEndDate: (state, action) => {
      state.endDate = action.payload;
    },
    resetTournamentState: () => ({ ...initialState }),
  }
});

export const {
  setName,
  setCity,
  setGround,
  setStartDate,
  setEndDate,
  resetTournamentState
} = tournamentSlice.actions;

export default tournamentSlice.reducer;