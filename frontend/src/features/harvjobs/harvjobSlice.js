import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { invalidateCache } from "../auth/authSlice";
import harvjobService from "./harvjobService";

const initialState = {
  loading: false,
  adding: false,
  editting: false,
  jobtypes: [],
  jobtype: {},
  jobschemas: [],
  jobschema: {},
  jobs: [],
  job: {},
  errorMsg: null,
  pagination: {
    next: null,
    previous: null,
    count: 0,
    limit: 10,
    offset: 1,
  },
};

export const listJobTypes = createAsyncThunk(
  "harvjobs/listJobTypes",
  async (limit, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await harvjobService.listJobTypes(token, limit);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getJobTypeById = createAsyncThunk(
  "harvjobs/getJobTypeById",
  async (jobtypeId, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await harvjobService.getJobTypeById(jobtypeId, token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const createJobType = createAsyncThunk(
  "harvjobs/createJobType",
  async (data, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await harvjobService.createJobType(data, token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const updateJobType = createAsyncThunk(
  "harvjobs/updateJobType",
  async (data, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await harvjobService.updateJobType(data, token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const paginateJobType = createAsyncThunk(
  "harvjobs/paginateJobType",
  async (url, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await harvjobService.paginateJob(url, token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const listJobSchemas = createAsyncThunk(
  "harvjobs/listJobSchemas",
  async (limit, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await harvjobService.listJobSchemas(token, limit);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getJobSchemaById = createAsyncThunk(
  "harvjobs/getJobSchemaById",
  async (id, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await harvjobService.getJobSchemaById(id, token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const createJobSchema = createAsyncThunk(
  "harvjobs/createJobSchema",
  async (data, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await harvjobService.createJobSchema(data, token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const updateJobSchema = createAsyncThunk(
  "harvjobs/updateJobSchema",
  async (data, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await harvjobService.updateJobSchema(data, token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const queryJobSchema = createAsyncThunk(
  "harvjobs/queryJobSchema",
  async (data, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await harvjobService.queryJobSchema(data, token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const listJobs = createAsyncThunk(
  "harvjobs/listJobs",
  async (limit, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await harvjobService.listJobs(token, limit);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getJobById = createAsyncThunk(
  "harvjobs/getJobById",
  async (id, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await harvjobService.getJobById(id, token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const queryJobs = createAsyncThunk(
  "harvjobs/queryJobs",
  async (data, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await harvjobService.queryJobs(data, token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const createJob = createAsyncThunk(
  "harvjobs/createJob",
  async (data, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await harvjobService.createJob(data, token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const paginateJob = createAsyncThunk(
  "harvjobs/paginateJob",
  async (url, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await harvjobService.paginateJob(url, token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const harvjobSlice = createSlice({
  name: "harvjobs",
  initialState,
  reducers: {
    resetSelectOptions: (state) => {
      state.jobschema = {};
      state.jobs = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(listJobTypes.pending, (state) => {
        state.loading = true;
      })
      .addCase(listJobTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.jobtypes = action.payload.results;
        state.pagination.count = action.payload.count;
        state.pagination.next = action.payload.next;
        state.pagination.previous = action.payload.previous;
      })
      .addCase(listJobTypes.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      })
      .addCase(getJobTypeById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getJobTypeById.fulfilled, (state, action) => {
        state.loading = false;
        state.jobtype = action.payload;
      })
      .addCase(getJobTypeById.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      })
      .addCase(createJobType.pending, (state) => {
        state.adding = true;
      })
      .addCase(createJobType.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(createJobType.rejected, (state, action) => {
        state.adding = false;
        state.errorMsg = action.payload;
      })
      .addCase(updateJobType.pending, (state) => {
        state.editting = true;
      })
      .addCase(updateJobType.fulfilled, (state, action) => {
        state.editting = false;
      })
      .addCase(updateJobType.rejected, (state, action) => {
        state.editting = false;
        state.errorMsg = action.payload;
      })
      .addCase(paginateJobType.pending, (state) => {
        state.loading = true;
      })
      .addCase(paginateJobType.fulfilled, (state, action) => {
        state.loading = false;
        state.jobtypes = action.payload.results;
        state.pagination.count = action.payload.count;
        state.pagination.next = action.payload.next;
        state.pagination.previous = action.payload.previous;
      })
      .addCase(paginateJobType.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      })
      .addCase(listJobSchemas.pending, (state) => {
        state.loading = true;
      })
      .addCase(listJobSchemas.fulfilled, (state, action) => {
        state.loading = false;
        state.jobschemas = action.payload.results;
        state.pagination.count = action.payload.count;
        state.pagination.next = action.payload.next;
        state.pagination.previous = action.payload.previous;
      })
      .addCase(listJobSchemas.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      })
      .addCase(getJobSchemaById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getJobSchemaById.fulfilled, (state, action) => {
        state.loading = false;
        state.jobschema = action.payload;
      })
      .addCase(getJobSchemaById.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      })
      .addCase(createJobSchema.pending, (state) => {
        state.adding = true;
      })
      .addCase(createJobSchema.fulfilled, (state) => {
        state.adding = false;
      })
      .addCase(createJobSchema.rejected, (state, action) => {
        state.adding = false;
        state.errorMsg = action.payload;
      })
      .addCase(updateJobSchema.pending, (state) => {
        state.editting = true;
      })
      .addCase(updateJobSchema.fulfilled, (state) => {
        state.editting = false;
      })
      .addCase(updateJobSchema.rejected, (state, action) => {
        state.editting = false;
        state.errorMsg = action.payload;
      })
      .addCase(queryJobSchema.pending, (state) => {
        state.loading = true;
      })
      .addCase(queryJobSchema.fulfilled, (state, action) => {
        state.loading = false;
        state.jobschemas = action.payload.results;
        state.pagination.count = action.payload.count;
        state.pagination.next = action.payload.next;
        state.pagination.previous = action.payload.previous;
      })
      .addCase(queryJobSchema.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      })
      .addCase(listJobs.pending, (state) => {
        state.loading = true;
      })
      .addCase(listJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload.results;
        state.pagination.count = action.payload.count;
        state.pagination.next = action.payload.next;
        state.pagination.previous = action.payload.previous;
      })
      .addCase(listJobs.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      })
      .addCase(getJobById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getJobById.fulfilled, (state, action) => {
        state.loading = false;
        state.job = action.payload;
      })
      .addCase(getJobById.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      })
      .addCase(queryJobs.pending, (state) => {
        state.loading = true;
      })
      .addCase(queryJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload.results;
        state.pagination.count = action.payload.count;
        state.pagination.next = action.payload.next;
        state.pagination.previous = action.payload.previous;
      })
      .addCase(queryJobs.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      })
      .addCase(createJob.pending, (state) => {
        state.adding = true;
      })
      .addCase(createJob.fulfilled, (state) => {
        state.adding = false;
      })
      .addCase(createJob.rejected, (state, action) => {
        state.adding = false;
        state.errorMsg = action.payload;
      })
      .addCase(paginateJob.pending, (state) => {
        state.loading = true;
      })
      .addCase(paginateJob.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload.results;
        state.pagination.count = action.payload.count;
        state.pagination.next = action.payload.next;
        state.pagination.previous = action.payload.previous;
      })
      .addCase(paginateJob.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      });
  },
});

export const { resetSelectOptions } = harvjobSlice.actions;
export default harvjobSlice.reducer;
