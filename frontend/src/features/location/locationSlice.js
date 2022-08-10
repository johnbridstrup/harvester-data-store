import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { invalidateCache } from "../auth/authSlice";
import locationService from "./locationService";

const initialState = {
  loading: false,
  location: {},
  locations: [],
  errorMsg: null,
};

export const listLocations = createAsyncThunk(
  "location/listLocations",
  async (limit, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await locationService.listLocations(token, limit);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getLocationById = createAsyncThunk(
  "location/getLocationById",
  async (locId, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await locationService.getLocationById(locId, token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(listLocations.pending, (state) => {
        state.loading = true;
      })
      .addCase(listLocations.fulfilled, (state, action) => {
        state.loading = false;
        state.locations = action.payload;
      })
      .addCase(listLocations.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      })
      .addCase(getLocationById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getLocationById.fulfilled, (state, action) => {
        state.loading = false;
        state.location = action.payload;
      })
      .addCase(getLocationById.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      });
  },
});

export default locationSlice.reducer;
