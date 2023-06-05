import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { paginateRequest } from "features/base/service";
import { invalidateCache } from "../auth/authSlice";
import distributorService from "./distributorService";

const initialState = {
  loading: false,
  adding: false,
  editting: false,
  distributor: {},
  distributors: [],
  errorMsg: null,
  pagination: {
    next: null,
    previous: null,
    count: null,
    limit: 10,
    offset: 1,
  },
};

export const listDistributors = createAsyncThunk(
  "distributor/listDistributors",
  async (limit, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await distributorService.listDistributors(token, limit);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getDistributorById = createAsyncThunk(
  "distributor/getDistributorById",
  async (distId, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await distributorService.getDistributorById(distId, token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const createDistributor = createAsyncThunk(
  "distributor/createDistributor",
  async (data, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await distributorService.createDistributor(data, token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const updateDistributor = createAsyncThunk(
  "distributor/updateDistributor",
  async (data, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await distributorService.updateDistributor(data, token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const paginateDistributor = createAsyncThunk(
  "distributor/paginateDistributor",
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

const distributorSlice = createSlice({
  name: "distributor",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(listDistributors.pending, (state) => {
        state.loading = true;
      })
      .addCase(listDistributors.fulfilled, (state, action) => {
        state.loading = false;
        state.distributors = action.payload.results;
        state.pagination.count = action.payload.count;
        state.pagination.next = action.payload.next;
        state.pagination.previous = action.payload.previous;
      })
      .addCase(listDistributors.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      })
      .addCase(getDistributorById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getDistributorById.fulfilled, (state, action) => {
        state.loading = false;
        state.distributor = action.payload;
      })
      .addCase(getDistributorById.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      })
      .addCase(createDistributor.pending, (state) => {
        state.adding = true;
      })
      .addCase(createDistributor.fulfilled, (state, action) => {
        state.adding = false;
      })
      .addCase(createDistributor.rejected, (state, action) => {
        state.adding = false;
        state.errorMsg = action.payload;
      })
      .addCase(updateDistributor.pending, (state) => {
        state.editting = true;
      })
      .addCase(updateDistributor.fulfilled, (state, action) => {
        state.editting = false;
      })
      .addCase(updateDistributor.rejected, (state, action) => {
        state.editting = false;
        state.errorMsg = action.payload;
      })
      .addCase(paginateDistributor.pending, (state) => {
        state.loading = true;
      })
      .addCase(paginateDistributor.fulfilled, (state, action) => {
        state.loading = false;
        state.distributors = action.payload.results;
        state.pagination.count = action.payload.count;
        state.pagination.next = action.payload.next;
        state.pagination.previous = action.payload.previous;
      })
      .addCase(paginateDistributor.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      });
  },
});

export default distributorSlice.reducer;
