import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { invalidateCache } from "../auth/authSlice";
import jobschedulerService from "./jobschedulerService";

const initialState = {
  loading: false,
  creating: false,
  scheduledjobs: [],
  scheduledjob: {},
  jobtypeschema: {},
  formbuilder: {},
  errorMsg: null,
  pagination: {
    next: null,
    previous: null,
    count: 0,
    limit: 10,
    offset: 1,
  },
};

export const queryScheduledJobs = createAsyncThunk(
  "jobscheduler/queryScheduledJobs",
  async (data, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await jobschedulerService.queryScheduledJobs(data, token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getScheduledJobById = createAsyncThunk(
  "jobscheduler/getScheduledJobById",
  async (id, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await jobschedulerService.getScheduledJobById(id, token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getJobTypeSchema = createAsyncThunk(
  "jobscheduler/getJobTypeSchema",
  async (_, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await jobschedulerService.getJobTypeSchema(token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getScheduledJobForm = createAsyncThunk(
  "jobscheduler/getScheduledJobForm",
  async (url, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await jobschedulerService.getScheduledJobForm(url, token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const createScheduledJob = createAsyncThunk(
  "jobscheduler/createScheduledJob",
  async (data, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await jobschedulerService.createScheduledJob(
        data.url,
        token,
        data.data
      );
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const paginateScheduledJob = createAsyncThunk(
  "harvjobs/paginateScheduledJob",
  async (url, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await jobschedulerService.paginateScheduledJob(url, token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const jobschedulerSlice = createSlice({
  name: "jobscheduler",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(queryScheduledJobs.pending, (state) => {
        state.loading = true;
      })
      .addCase(queryScheduledJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.scheduledjobs = action.payload.results;
        state.pagination.count = action.payload.count;
        state.pagination.next = action.payload.next;
        state.pagination.previous = action.payload.previous;
      })
      .addCase(queryScheduledJobs.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      })
      .addCase(getScheduledJobById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getScheduledJobById.fulfilled, (state, action) => {
        state.loading = false;
        state.scheduledjob = action.payload;
      })
      .addCase(getScheduledJobById.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      })
      .addCase(getJobTypeSchema.pending, (state) => {
        state.loading = true;
      })
      .addCase(getJobTypeSchema.fulfilled, (state, action) => {
        state.loading = false;
        state.jobtypeschema = action.payload;
      })
      .addCase(getJobTypeSchema.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      })
      .addCase(getScheduledJobForm.pending, (state) => {
        state.loading = true;
      })
      .addCase(getScheduledJobForm.fulfilled, (state, action) => {
        state.loading = false;
        state.formbuilder = action.payload;
      })
      .addCase(getScheduledJobForm.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      })
      .addCase(createScheduledJob.pending, (state) => {
        state.creating = true;
      })
      .addCase(createScheduledJob.fulfilled, (state, action) => {
        state.creating = false;
      })
      .addCase(createScheduledJob.rejected, (state, action) => {
        state.creating = false;
        state.errorMsg = action.payload;
      })
      .addCase(paginateScheduledJob.pending, (state) => {
        state.loading = true;
      })
      .addCase(paginateScheduledJob.fulfilled, (state, action) => {
        state.loading = false;
        state.scheduledjobs = action.payload.results;
        state.pagination.count = action.payload.count;
        state.pagination.next = action.payload.next;
        state.pagination.previous = action.payload.previous;
      })
      .addCase(paginateScheduledJob.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      });
  },
});

export default jobschedulerSlice.reducer;
