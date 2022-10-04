import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { invalidateCache } from "../auth/authSlice";
import releaseService from "./releaseService";

const initialState = {
  loading: false,
  releasecode: {},
  releasecodes: [],
  errorMsg: null,
  pagination: {
    next: null,
    previous: null,
    count: null,
    limit: 10,
    offset: 1,
  },
};

export const listRelease = createAsyncThunk(
  "release/listRelease",
  async (limit, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await releaseService.listRelease(token, limit);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getReleaseById = createAsyncThunk(
  "release/getReleaseById",
  async (releaseId, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await releaseService.getReleaseById(token, releaseId);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const paginateRelease = createAsyncThunk(
  "release/paginateRelease",
  async (url, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await releaseService.paginateRelease(url, token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const releaseSlice = createSlice({
  name: "release",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(listRelease.pending, (state) => {
        state.loading = true;
      })
      .addCase(listRelease.fulfilled, (state, action) => {
        state.loading = false;
        state.releasecodes = action.payload.results;
        state.pagination.count = action.payload.count;
        state.pagination.next = action.payload.next;
        state.pagination.previous = action.payload.previous;
      })
      .addCase(listRelease.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      })
      .addCase(getReleaseById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getReleaseById.fulfilled, (state, action) => {
        state.loading = false;
        state.releasecode = action.payload;
      })
      .addCase(getReleaseById.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      })
      .addCase(paginateRelease.pending, (state) => {
        state.loading = true;
      })
      .addCase(paginateRelease.fulfilled, (state, action) => {
        state.loading = false;
        state.releasecodes = action.payload.results;
        state.pagination.count = action.payload.count;
        state.pagination.next = action.payload.next;
        state.pagination.previous = action.payload.previous;
      })
      .addCase(paginateRelease.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      });
  },
});

export default releaseSlice.reducer;
