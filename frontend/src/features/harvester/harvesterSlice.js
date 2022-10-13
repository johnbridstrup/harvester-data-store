import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { invalidateCache } from "../auth/authSlice";
import harvesterService from "./harvesterService";

const initialState = {
  loading: false,
  adding: false,
  editting: false,
  harvester: {},
  harvesters: [],
  errorMsg: null,
  pagination: {
    next: null,
    previous: null,
    count: null,
    limit: 10,
    offset: 1,
  },
};

export const listHarvesters = createAsyncThunk(
  "harvester/listHarvesters",
  async (limit, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await harvesterService.listHarvesters(token, limit);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getHarvesterById = createAsyncThunk(
  "harvester/getHarvesterById",
  async (harvId, thunkAPI) => {
    try {
      return await harvesterService.getHarvesterById(harvId);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const createHarvester = createAsyncThunk(
  "harvester/createHarvester",
  async (harvData, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await harvesterService.createHarvester(harvData, token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const updateHarvester = createAsyncThunk(
  "harvester/updateHarvester",
  async (harvData, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await harvesterService.updateHarvester(harvData, token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const paginateHarvester = createAsyncThunk(
  "harvester/paginateHarvester",
  async (url, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await harvesterService.paginateHarvester(url, token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const queryHarvester = createAsyncThunk(
  "harvester/queryHarvester",
  async (queryObj, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await harvesterService.queryHarvester(queryObj, token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const harvesterSlice = createSlice({
  name: "harvester",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(listHarvesters.pending, (state) => {
        state.loading = true;
      })
      .addCase(listHarvesters.fulfilled, (state, action) => {
        state.loading = false;
        state.harvesters = action.payload.results;
        state.pagination.count = action.payload.count;
        state.pagination.next = action.payload.next;
        state.pagination.previous = action.payload.previous;
      })
      .addCase(listHarvesters.rejected, (state, action) => {
        state.loading = false;
        state.harvesters = [];
        state.errorMsg = action.payload;
      })
      .addCase(getHarvesterById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getHarvesterById.fulfilled, (state, action) => {
        state.loading = false;
        state.harvester = action.payload;
      })
      .addCase(getHarvesterById.rejected, (state, action) => {
        state.loading = false;
        state.harvester = {};
        state.errorMsg = action.payload;
      })
      .addCase(createHarvester.pending, (state) => {
        state.adding = true;
      })
      .addCase(createHarvester.fulfilled, (state, action) => {
        state.adding = false;
      })
      .addCase(createHarvester.rejected, (state, action) => {
        state.adding = false;
        state.errorMsg = action.payload;
      })
      .addCase(updateHarvester.pending, (state) => {
        state.editting = true;
      })
      .addCase(updateHarvester.fulfilled, (state, action) => {
        state.editting = false;
      })
      .addCase(updateHarvester.rejected, (state, action) => {
        state.editting = false;
        state.errorMsg = action.payload;
      })
      .addCase(paginateHarvester.pending, (state) => {
        state.loading = true;
      })
      .addCase(paginateHarvester.fulfilled, (state, action) => {
        state.loading = false;
        state.harvesters = action.payload.results;
        state.pagination.count = action.payload.count;
        state.pagination.next = action.payload.next;
        state.pagination.previous = action.payload.previous;
      })
      .addCase(paginateHarvester.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      })
      .addCase(queryHarvester.pending, (state) => {
        state.loading = true;
      })
      .addCase(queryHarvester.fulfilled, (state, action) => {
        state.loading = false;
        state.harvesters = action.payload.results;
        state.pagination.count = action.payload.count;
        state.pagination.next = action.payload.next;
        state.pagination.previous = action.payload.previous;
      })
      .addCase(queryHarvester.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      });
  },
});

export default harvesterSlice.reducer;
