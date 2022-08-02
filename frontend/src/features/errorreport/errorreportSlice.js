import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { transformErrorReport } from '../../utils/utils';
import errorreportService from './errorreportService';


const initialState = {
  loading: false,
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
}


export const errorreportListView = createAsyncThunk('errorreport/errorreportListView', async (_, thunkAPI) => {
  try {
    const { auth: { token } } = thunkAPI.getState();
    return await errorreportService.errorListView(token);
  } catch (error) {
    console.log(error)
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
    return thunkAPI.rejectWithValue(message);
  }
});


export const queryErrorReport = createAsyncThunk('errorreport/queryErrorReport', async (queryObj, thunkAPI) => {
  try {
    const { auth: { token } } = thunkAPI.getState();
    return await errorreportService.queryErrorReport(queryObj, token)
  } catch (error) {
    console.log(error)
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
    return thunkAPI.rejectWithValue(message);
  }
})

export const paginateErrorReport = createAsyncThunk('errorreport/paginateErrorReport', async (url, thunkAPI) => {
  try {
    const { auth: { token } } = thunkAPI.getState();
    return await errorreportService.paginateErrorReport(url, token);
  } catch (error) {
    console.log(error);
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
    return thunkAPI.rejectWithValue(message);
  }
})


export const detailErrorReport = createAsyncThunk('errorreport/detailErrorReport', async (reportId, thunkAPI) => {
  try {
    const { auth: { token } } = thunkAPI.getState();
    return await errorreportService.detailErrorReport(reportId, token);
  } catch (error) {
    console.log(error);
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
    return thunkAPI.rejectWithValue(message);
  }
})


const errorreportSlice = createSlice({
  name: 'errorreport',
  initialState,
  reducers: {
    timezoneUpdate: (state, action) => {
      state.timezone = action.payload
    },
    copyQueryUrl: (state, action) => {
      state.queryUrl = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(errorreportListView.pending, (state) => {
        state.loading = true
      })
      .addCase(errorreportListView.fulfilled, (state, action) => {
        state.loading = false
        state.count = action.payload.count
        state.next = action.payload.next
        state.previous = action.payload.previous
        state.reports = transformErrorReport(action.payload.results)
      })
      .addCase(errorreportListView.rejected, (state, action) => {
        state.loading = false
        state.errorMsg = action.payload
      })
      .addCase(queryErrorReport.pending, (state) => {
        state.loading = true
      })
      .addCase(queryErrorReport.fulfilled, (state, action) => {
        state.loading = false
        state.count = action.payload.count
        state.next = action.payload.next
        state.previous = action.payload.previous
        state.reports = transformErrorReport(action.payload.results)
      })
      .addCase(queryErrorReport.rejected, (state, action) => {
        state.loading = false
        state.errorMsg = action.payload
      })
      .addCase(paginateErrorReport.pending, (state) => {
        state.loading = true
      })
      .addCase(paginateErrorReport.fulfilled, (state, action) => {
        state.loading = false
        state.count = action.payload.count
        state.next = action.payload.next
        state.previous = action.payload.previous
        state.reports = transformErrorReport(action.payload.results)
      })
      .addCase(paginateErrorReport.rejected, (state, action) => {
        state.loading = false
        state.errorMsg = action.payload
      })
      .addCase(detailErrorReport.pending, (state) => {
        state.loading = true
      })
      .addCase(detailErrorReport.fulfilled, (state, action) => {
        state.loading = false
        state.report = action.payload
      })
      .addCase(detailErrorReport.rejected, (state, action) => {
        state.loading = false
        state.errorMsg = action.payload
      })
  }
});


export const { timezoneUpdate, copyQueryUrl } = errorreportSlice.actions;
export default errorreportSlice.reducer;