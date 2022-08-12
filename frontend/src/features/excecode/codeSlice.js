import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { invalidateCache } from "../auth/authSlice";
import codeService from "./codeService";

const initialState = {
  loading: false,
  exceptioncodes: [],
  exceptioncode: {},
  errorMsg: null,
};

export const listCodes = createAsyncThunk(
  "exceptioncode/listCodes",
  async (limit, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await codeService.listCodes(token, limit);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getCodeById = createAsyncThunk(
  "exceptioncode/getCodeById",
  async (fruitId, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await codeService.getCodeById(token, fruitId);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const codeslice = createSlice({
  name: "exceptioncode",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(listCodes.pending, (state) => {
        state.loading = true;
      })
      .addCase(listCodes.fulfilled, (state, action) => {
        state.loading = false;
        state.exceptioncodes = action.payload;
      })
      .addCase(listCodes.rejected, (state, action) => {
        state.loading = false;
        state.exceptioncodes = [];
        state.errorMsg = action.payload;
      })
      .addCase(getCodeById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCodeById.fulfilled, (state, action) => {
        state.loading = false;
        state.exceptioncode = action.payload;
      })
      .addCase(getCodeById.rejected, (state, action) => {
        state.loading = false;
        state.exceptioncode = {};
        state.errorMsg = action.payload;
      });
  },
});

export default codeslice.reducer;
