import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import AsyncStorage from "@react-native-async-storage/async-storage";

//action
export const fetchAuth = createAsyncThunk("fetchAuth", async () => {
  try {
    const accessToken = await AsyncStorage.getItem("accessToken");
    const refreshToken = await AsyncStorage.getItem("refreshToken");

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_BASE_URL}/check-auth`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const data = await response.json();
    
    if (response.status === 403) {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/refresh-access-token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken }),
        }
      );
      const refreshData = await response.json();

      if (response.status === 200 && refreshData.data.accessToken) {
        await AsyncStorage.setItem("accessToken", refreshData.data.accessToken);

        const response = await fetch(
          `${process.env.EXPO_PUBLIC_BASE_URL}/check-auth`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${refreshData.data.accessToken}`,
            },
          }
        );
        const newData = await response.json();
        return {
          data: newData,
        };
      }
    } else {
      return {
        data,
      };
    }
  } catch (error) {
    throw new Error(error.message);
  }
});

const initialState = {
  isLoading: true,
  user: null,
  isLoggedin: false,
  isError: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  extraReducers: (builder) => {
    builder.addCase(fetchAuth.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(fetchAuth.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload.data.statusCode === 200) {
        state.user = action.payload.data.data;
        state.isLoggedin = true;
      } else {
        state.user = null;
        state.isLoggedin = false;
      }
    });
    builder.addCase(fetchAuth.rejected, (state, action) => {
      state.isError = true;
      state.isLoading = false;
    });
  },
});

export default authSlice.reducer;
