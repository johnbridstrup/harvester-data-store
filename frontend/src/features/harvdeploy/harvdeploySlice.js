import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { invalidateCache } from "../auth/authSlice";
import harvdeployService from "./harvdeployService";
import { paginateRequest } from "features/base/service";

const initialState = {
  loading: false,
  editting: false,
  releasecode: {},
  releasecodes: [],
  versions: [],
  version: {},
  errorMsg: null,
  tags: [],
  installed: [],
  pagination: {
    next: null,
    previous: null,
    count: null,
    limit: 10,
    offset: 1,
  },
};

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

export const updateRelease = createAsyncThunk(
  "harvdeploy/updateRelease",
  async (data, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await harvdeployService.updateRelease(data, token);
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
      return await paginateRequest(url, token);
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
      return await paginateRequest(url, token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const queryRelease = createAsyncThunk(
  "harvdeploy/queryRelease",
  async (queryObj, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await harvdeployService.queryRelease(queryObj, token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const listTags = createAsyncThunk(
  "harvdeploy/listTags",
  async (_, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await harvdeployService.listTags(token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const installedHarvesters = createAsyncThunk(
  "harvdeploy/installedHarvesters",
  async (id, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await harvdeployService.installedHarvesters(token, id);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const paginateInstalled = createAsyncThunk(
  "harvdeploy/paginateInstalled",
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

const harvdeploySlice = createSlice({
  name: "harvdeploy",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
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
      .addCase(updateRelease.pending, (state) => {
        state.editting = true;
      })
      .addCase(updateRelease.fulfilled, (state, action) => {
        state.editting = false;
        state.releasecode = action.payload.data;
      })
      .addCase(updateRelease.rejected, (state, action) => {
        state.editting = false;
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
      })
      .addCase(queryRelease.pending, (state) => {
        state.loading = true;
      })
      .addCase(queryRelease.fulfilled, (state, action) => {
        state.loading = false;
        state.releasecodes = action.payload.results;
        state.pagination.count = action.payload.count;
        state.pagination.next = action.payload.next;
        state.pagination.previous = action.payload.previous;
      })
      .addCase(queryRelease.rejected, (state, action) => {
        state.loading = true;
        state.errorMsg = action.payload;
      })
      .addCase(listTags.pending, (state) => {
        state.loading = true;
      })
      .addCase(listTags.fulfilled, (state, action) => {
        state.loading = false;
        state.tags = action.payload.tags;
      })
      .addCase(listTags.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      })
      .addCase(installedHarvesters.pending, (state) => {
        state.loading = true;
      })
      .addCase(installedHarvesters.fulfilled, (state, action) => {
        state.loading = false;
        state.installed = action.payload.results;
        state.pagination.count = action.payload.count;
        state.pagination.next = action.payload.next;
        state.pagination.previous = action.payload.previous;
      })
      .addCase(installedHarvesters.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      })
      .addCase(paginateInstalled.pending, (state) => {
        state.loading = true;
      })
      .addCase(paginateInstalled.fulfilled, (state, action) => {
        state.loading = false;
        state.installed = action.payload.results;
        state.pagination.count = action.payload.count;
        state.pagination.next = action.payload.next;
        state.pagination.previous = action.payload.previous;
      })
      .addCase(paginateInstalled.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      });
  },
});

export default harvdeploySlice.reducer;
