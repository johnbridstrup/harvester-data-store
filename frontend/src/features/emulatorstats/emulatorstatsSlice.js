import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { invalidateCache } from "features/auth/authSlice";
import emulatorstatsService from "./emulatorstatsService";
import { paginateRequest } from "features/base/service";

const initialState = {
  loading: false,
  errorMsg: null,
  emustats: [],
  emustatsObj: {},
  annotates: [],
  tags: [],
  pagination: {
    count: 0,
    limit: 10,
    next: null,
    previous: null,
  },
};

export const queryEmulatorstats = createAsyncThunk(
  "emulatorstats/queryEmulatorstats",
  async (queryObj, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await emulatorstatsService.queryEmulatorstats(queryObj, token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getEmulatorstatsById = createAsyncThunk(
  "emulatorstats/getEmulatorstatsById",
  async (id, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await emulatorstatsService.getEmulatorstatsById(id, token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const paginateEmulatorstats = createAsyncThunk(
  "emulatorstats/paginateEmulatorstats",
  async (url, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await paginateRequest(url, token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getEmulatorstatsTags = createAsyncThunk(
  "emulatorstats/getEmulatorstatsTags",
  async (_, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await emulatorstatsService.getEmulatorstatsTags(token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const emulatorstatsSlice = createSlice({
  name: "emulatorstats",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(queryEmulatorstats.pending, (state) => {
        state.loading = true;
      })
      .addCase(queryEmulatorstats.fulfilled, (state, action) => {
        state.loading = false;
        state.pagination.count = action.payload.count;
        state.pagination.next = action.payload.next;
        state.pagination.previous = action.payload.previous;
        state.emustats = action.payload.results;
      })
      .addCase(queryEmulatorstats.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      })
      .addCase(getEmulatorstatsById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getEmulatorstatsById.fulfilled, (state, action) => {
        state.loading = false;
        state.emustatsObj = action.payload;
      })
      .addCase(getEmulatorstatsById.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      })
      .addCase(paginateEmulatorstats.pending, (state) => {
        state.loading = true;
      })
      .addCase(paginateEmulatorstats.fulfilled, (state, action) => {
        state.loading = false;
        state.pagination.count = action.payload.count;
        state.pagination.next = action.payload.next;
        state.pagination.previous = action.payload.previous;
        state.reports = action.payload.results;
      })
      .addCase(paginateEmulatorstats.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      })
      .addCase(getEmulatorstatsTags.pending, (state) => {
        state.loading = true;
      })
      .addCase(getEmulatorstatsTags.fulfilled, (state, action) => {
        state.loading = false;
        state.tags = action.payload.tags;
      })
      .addCase(getEmulatorstatsTags.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      });
  },
});

export default emulatorstatsSlice.reducer;
