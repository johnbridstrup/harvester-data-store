import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { invalidateCache } from "features/auth/authSlice";
import emulatorstatsService from "./emulatorstatsService";
import { paginateRequest } from "features/base/service";
import {
  transformEmustatSeries,
  transformEmustatAggs,
} from "components/emulatorstats/EmulatorstatsHelpers";
import { uniqueValues } from "utils/utils";

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
  internal: {
    emuplots: {},
    emuseries: {},
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
  reducers: {
    scenePickerAndCalc: (state, action) => {
      const date = action.payload;
      const filtered = state.emustats.filter((x) => x.date === date);
      state.internal.emuseries = transformEmustatSeries(filtered);
      state.internal.emuseries.dates = uniqueValues("date", state.emustats);
    },
  },
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
        state.internal.emuplots = transformEmustatAggs(action.payload.results);
        state.internal.emuseries = transformEmustatSeries(
          action.payload.results
        );
        state.internal.emuseries.dates = uniqueValues(
          "date",
          action.payload.results
        );
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
        state.internal.emuplots = transformEmustatAggs(action.payload.results);
        state.internal.emuseries = transformEmustatSeries(
          action.payload.results
        );
        state.internal.emuseries.dates = uniqueValues(
          "date",
          action.payload.results
        );
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

export const { scenePickerAndCalc } = emulatorstatsSlice.actions;
export default emulatorstatsSlice.reducer;
