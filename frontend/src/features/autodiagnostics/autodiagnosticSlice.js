import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { invalidateCache } from "features/auth/authSlice";
import { transformSensors } from "utils/utils";
import autodiagnosticService from "./autodiagnosticService";

const initialState = {
  loading: false,
  pagination: {
    count: 0,
    limit: 10,
    offset: 1,
    next: null,
    previous: null,
  },
  errorMsg: null,
  reports: [],
  report: {},
  sensors: {
    fingers: [],
    vacuum: [],
    touch: [],
  },
};

export const queryAutodiagReport = createAsyncThunk(
  "autodiagnostics/queryAutodiagReport",
  async (queryObj, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await autodiagnosticService.queryAutodiagReport(queryObj, token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getAutodiagReport = createAsyncThunk(
  "errorreport/getAutodiagReport",
  async (id, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await autodiagnosticService.getAutodiagReport(id, token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const paginateAutodiagReport = createAsyncThunk(
  "autodiagnostics/paginateAutodiagReport",
  async (url, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await autodiagnosticService.paginateAutodiagReport(url, token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const autodiagnosticSlice = createSlice({
  name: "autodiagnostics",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(queryAutodiagReport.pending, (state) => {
        state.loading = true;
      })
      .addCase(queryAutodiagReport.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload.results;
        state.pagination.count = action.payload.count;
        state.pagination.next = action.payload.next;
        state.pagination.previous = action.payload.previous;
      })
      .addCase(queryAutodiagReport.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      })
      .addCase(getAutodiagReport.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAutodiagReport.fulfilled, (state, action) => {
        state.loading = false;
        const report = action.payload;
        state.report = report;
        const { vacuum, finger, touch } = transformSensors(
          report.run_data?.sensors
        );
        state.sensors.fingers = finger;
        state.sensors.touch = touch;
        state.sensors.vacuum = vacuum;
      })
      .addCase(getAutodiagReport.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      })
      .addCase(paginateAutodiagReport.pending, (state) => {
        state.loading = true;
      })
      .addCase(paginateAutodiagReport.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload.results;
        state.pagination.count = action.payload.count;
        state.pagination.next = action.payload.next;
        state.pagination.previous = action.payload.previous;
      })
      .addCase(paginateAutodiagReport.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      });
  },
});

export default autodiagnosticSlice.reducer;
