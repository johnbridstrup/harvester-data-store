import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { invalidateCache } from "../auth/authSlice";
import harvesterService from "./harvesterService";

const initialState = {
  loading: false,
  harvester: {},
  harvesters: [],
  errorMsg: null,
};

export const listHarvesters = createAsyncThunk(
  "harvester/listHarvesters",
  async (limit, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await harvesterService.listHarvesters(token, limit);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getHarvesterById = createAsyncThunk(
  "harvester/getHarvesterById",
  async (harvId, thunkAPI) => {
    try {
      return await harvesterService.getHarvesterById(harvId);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const harvesterSlice = createSlice({
  name: "harvester",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(listHarvesters.pending, (state) => {
        state.loading = true;
      })
      .addCase(listHarvesters.fulfilled, (state, action) => {
        state.loading = false;
        state.harvesters = action.payload;
      })
      .addCase(listHarvesters.rejected, (state, action) => {
        state.loading = false;
        state.harvesters = [];
        state.errorMsg = action.payload;
      })
      .addCase(getHarvesterById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getHarvesterById.fulfilled, (state, action) => {
        state.loading = false;
        state.harvester = action.payload;
      })
      .addCase(getHarvesterById.rejected, (state, action) => {
        state.loading = false;
        state.harvester = {};
        state.errorMsg = action.payload;
      });
  },
});

export default harvesterSlice.reducer;
