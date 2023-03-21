import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { invalidateCache } from "../auth/authSlice";
import s3fileService from "./s3fileService";

const initialState = {
  loading: false,
  flagging: false,
  s3file: {},
  s3files: [],
  errorMsg: null,
  pagination: {
    next: null,
    previous: null,
    count: 0,
    limit: 10,
    offset: 1,
  },
};

export const queryS3File = createAsyncThunk(
  "s3file/queryS3File",
  async (queryObj, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await s3fileService.queryS3File(queryObj, token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getS3FileById = createAsyncThunk(
  "s3file/getS3FileById",
  async (fileId, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await s3fileService.getS3FileById(fileId, token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const paginateS3File = createAsyncThunk(
  "s3file/paginateS3File",
  async (url, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await s3fileService.paginateS3File(url, token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const deleteS3File = createAsyncThunk(
  "s3file/deleteS3File",
  async (id, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await s3fileService.deleteS3File(id, token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const s3fileSlice = createSlice({
  name: "s3file",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(queryS3File.pending, (state) => {
        state.loading = true;
      })
      .addCase(queryS3File.fulfilled, (state, action) => {
        state.loading = false;
        state.s3files = action.payload.results;
        state.pagination.count = action.payload.count;
        state.pagination.next = action.payload.next;
        state.pagination.previous = action.payload.previous;
      })
      .addCase(queryS3File.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      })
      .addCase(getS3FileById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getS3FileById.fulfilled, (state, action) => {
        state.loading = false;
        state.s3file = action.payload;
      })
      .addCase(getS3FileById.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      })
      .addCase(paginateS3File.pending, (state) => {
        state.loading = true;
      })
      .addCase(paginateS3File.fulfilled, (state, action) => {
        state.loading = false;
        state.s3files = action.payload.results;
        state.pagination.count = action.payload.count;
        state.pagination.next = action.payload.next;
        state.pagination.previous = action.payload.previous;
      })
      .addCase(paginateS3File.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      })
      .addCase(deleteS3File.pending, (state) => {
        state.flagging = true;
      })
      .addCase(deleteS3File.fulfilled, (state) => {
        state.flagging = false;
      })
      .addCase(deleteS3File.rejected, (state, action) => {
        state.flagging = false;
        state.errorMsg = action.payload;
      });
  },
});

export default s3fileSlice.reducer;
