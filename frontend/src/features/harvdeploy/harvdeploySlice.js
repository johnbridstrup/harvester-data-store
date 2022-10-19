import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { invalidateCache } from "../auth/authSlice";
import harvdeployService from "./harvdeployService";

const initialState = {
  loading: false,
  releasecode: {},
  releasecodes: [],
  versions: [],
  version: {},
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
  "harvdeploy/listRelease",
  async (limit, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await harvdeployService.listRelease(token, limit);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getReleaseById = createAsyncThunk(
  "harvdeploy/getReleaseById",
  async (releaseId, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await harvdeployService.getReleaseById(token, releaseId);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const paginateRelease = createAsyncThunk(
  "harvdeploy/paginateRelease",
  async (url, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await harvdeployService.paginateRelease(url, token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const listVersion = createAsyncThunk(
  "harvdeploy/listVersion",
  async (limit, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await harvdeployService.listVersion(token, limit);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getVersionById = createAsyncThunk(
  "harvdeploy/getVersionById",
  async (releaseId, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await harvdeployService.getVersionById(token, releaseId);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const paginateVersion = createAsyncThunk(
  "harvdeploy/paginateVersion",
  async (url, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await harvdeployService.paginateVersion(url, token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const harvdeploySlice = createSlice({
  name: "harvdeploy",
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
      })
      .addCase(listVersion.pending, (state) => {
        state.loading = true;
      })
      .addCase(listVersion.fulfilled, (state, action) => {
        state.loading = false;
        state.versions = action.payload.results;
        state.pagination.count = action.payload.count;
        state.pagination.next = action.payload.next;
        state.pagination.previous = action.payload.previous;
      })
      .addCase(listVersion.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      })
      .addCase(getVersionById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getVersionById.fulfilled, (state, action) => {
        state.loading = false;
        state.version = action.payload;
      })
      .addCase(getVersionById.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      })
      .addCase(paginateVersion.pending, (state) => {
        state.loading = true;
      })
      .addCase(paginateVersion.fulfilled, (state, action) => {
        state.loading = false;
        state.versions = action.payload.results;
        state.pagination.count = action.payload.count;
        state.pagination.next = action.payload.next;
        state.pagination.previous = action.payload.previous;
      })
      .addCase(paginateVersion.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      });
  },
});

export default harvdeploySlice.reducer;
