import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getExceptionKeys,
  getServicesInError,
  transformErrorReport,
  transformExceptionObj,
  transformReportDetail,
  transformSysmonKeys,
  transformSysmonReport,
} from "../../utils/utils";
import { invalidateCache } from "../auth/authSlice";
import errorreportService from "./errorreportService";

const initialState = {
  loading: false,
  adding: false,
  count: null,
  limit: 10,
  offset: 1,
  next: null,
  previous: null,
  reports: [],
  report: {},
  timezone: null,
  errorMsg: null,
  queryUrl: null,
  paretos: [],
  transformed: {
    exceptionkeys: [],
    sysmonkeys: [],
    sysmonreport: {},
    reportobj: {},
    erroredservices: [],
    exceptions: [],
  },
  hovered: null,
};

export const errorreportListView = createAsyncThunk(
  "errorreport/errorreportListView",
  async (_, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await errorreportService.errorListView(token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const queryErrorReport = createAsyncThunk(
  "errorreport/queryErrorReport",
  async (queryObj, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await errorreportService.queryErrorReport(queryObj, token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const paginateErrorReport = createAsyncThunk(
  "errorreport/paginateErrorReport",
  async (url, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await errorreportService.paginateErrorReport(url, token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const detailErrorReport = createAsyncThunk(
  "errorreport/detailErrorReport",
  async (reportId, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await errorreportService.detailErrorReport(reportId, token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const generatePareto = createAsyncThunk(
  "errorreport/generatePareto",
  async (queryObj, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await errorreportService.generatePareto(queryObj, token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const createNotification = createAsyncThunk(
  "errorreport/createNotification",
  async (queryObj, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await errorreportService.createNotification(queryObj, token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const errorreportSlice = createSlice({
  name: "errorreport",
  initialState,
  reducers: {
    timezoneUpdate: (state, action) => {
      state.timezone = action.payload;
    },
    copyQueryUrl: (state, action) => {
      state.queryUrl = action.payload;
    },
    hoverEffect: (state, action) => {
      state.hovered = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(errorreportListView.pending, (state) => {
        state.loading = true;
      })
      .addCase(errorreportListView.fulfilled, (state, action) => {
        state.loading = false;
        state.count = action.payload.count;
        state.next = action.payload.next;
        state.previous = action.payload.previous;
        state.reports = transformErrorReport(action.payload.results);
      })
      .addCase(errorreportListView.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      })
      .addCase(queryErrorReport.pending, (state) => {
        state.loading = true;
      })
      .addCase(queryErrorReport.fulfilled, (state, action) => {
        state.loading = false;
        state.count = action.payload.count;
        state.next = action.payload.next;
        state.previous = action.payload.previous;
        state.reports = transformErrorReport(action.payload.results);
      })
      .addCase(queryErrorReport.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      })
      .addCase(paginateErrorReport.pending, (state) => {
        state.loading = true;
      })
      .addCase(paginateErrorReport.fulfilled, (state, action) => {
        state.loading = false;
        state.count = action.payload.count;
        state.next = action.payload.next;
        state.previous = action.payload.previous;
        state.reports = transformErrorReport(action.payload.results);
      })
      .addCase(paginateErrorReport.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      })
      .addCase(detailErrorReport.pending, (state) => {
        state.loading = true;
      })
      .addCase(detailErrorReport.fulfilled, (state, action) => {
        state.loading = false;
        state.report = action.payload;
        let report = action.payload;
        let sysreport = transformSysmonReport(
          report.report?.data?.sysmon_report
        );
        let exceptionskeys = getExceptionKeys(report?.exceptions);
        state.transformed.reportobj = transformReportDetail(report);
        state.transformed.sysmonreport = sysreport;
        state.transformed.exceptionkeys = exceptionskeys;
        let services = getServicesInError(exceptionskeys, sysreport);
        state.transformed.erroredservices = services;
        state.transformed.sysmonkeys = transformSysmonKeys(
          Object.keys(sysreport),
          services,
          sysreport
        );
        state.transformed.exceptions = transformExceptionObj(report.exceptions);
      })
      .addCase(detailErrorReport.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      })
      .addCase(generatePareto.pending, (state) => {
        state.loading = true;
      })
      .addCase(generatePareto.fulfilled, (state, action) => {
        state.loading = false;
        state.paretos = action.payload;
      })
      .addCase(generatePareto.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      })
      .addCase(createNotification.pending, (state) => {
        state.adding = true;
      })
      .addCase(createNotification.fulfilled, (state, action) => {
        state.adding = false;
      })
      .addCase(createNotification.rejected, (state, action) => {
        state.adding = false;
        state.errorMsg = action.payload;
      });
  },
});

export const { timezoneUpdate, copyQueryUrl, hoverEffect } =
  errorreportSlice.actions;
export default errorreportSlice.reducer;
