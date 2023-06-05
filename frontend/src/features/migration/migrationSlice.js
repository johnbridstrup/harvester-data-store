import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { invalidateCache } from "../auth/authSlice";
import migrationService from "./migrationService";
import { paginateRequest } from "features/base/service";

const initialState = {
  loading: false,
  queueing: false,
  migration: {},
  migrations: [],
  errorMsg: null,
  pagination: {
    next: null,
    previous: null,
    count: 0,
    limit: 10,
    offset: 1,
  },
};

export const listMigrationLogs = createAsyncThunk(
  "migration/listMigrationLogs",
  async (queryObj, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await migrationService.listMigrationLogs(token, queryObj);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getMigrationLogById = createAsyncThunk(
  "migration/getMigrationLogById",
  async (id, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await migrationService.getMigrationLogById(id, token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const execMigration = createAsyncThunk(
  "migration/execMigration",
  async (_, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await migrationService.execMigration(token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const paginateMigration = createAsyncThunk(
  "migration/paginateMigration",
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

const migrationSlice = createSlice({
  name: "migration",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(listMigrationLogs.pending, (state) => {
        state.loading = true;
      })
      .addCase(listMigrationLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.migrations = action.payload.results;
        state.pagination.count = action.payload.count;
        state.pagination.next = action.payload.next;
        state.pagination.previous = action.payload.previous;
      })
      .addCase(listMigrationLogs.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      })
      .addCase(getMigrationLogById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMigrationLogById.fulfilled, (state, action) => {
        state.loading = false;
        state.migration = action.payload;
      })
      .addCase(getMigrationLogById.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      })
      .addCase(execMigration.pending, (state) => {
        state.queueing = true;
      })
      .addCase(execMigration.fulfilled, (state) => {
        state.queueing = false;
      })
      .addCase(execMigration.rejected, (state, action) => {
        state.queueing = false;
        state.errorMsg = action.payload;
      })
      .addCase(paginateMigration.pending, (state) => {
        state.loading = true;
      })
      .addCase(paginateMigration.fulfilled, (state, action) => {
        state.loading = false;
        state.migrations = action.payload.results;
        state.pagination.count = action.payload.count;
        state.pagination.next = action.payload.next;
        state.pagination.previous = action.payload.previous;
      })
      .addCase(paginateMigration.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      });
  },
});

export default migrationSlice.reducer;
