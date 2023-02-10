import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAftConfigKeys } from "utils/utils";
import { invalidateCache } from "../auth/authSlice";
import aftconfigService from "./aftconfigService";

const initialState = {
  loading: false,
  configreport: {},
  configs: {},
  configkeys: [],
  errorMsg: null,
};

export const fullConfigReport = createAsyncThunk(
  "aftconfig/fullConfigReport",
  async (id, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await aftconfigService.fullConfigReport(id, token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const aftconfigSlice = createSlice({
  name: "aftconfig",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fullConfigReport.pending, (state) => {
        state.loading = true;
      })
      .addCase(fullConfigReport.fulfilled, (state, action) => {
        state.loading = false;
        state.configreport = action.payload;
        state.configs = action.payload.report?.data;
        state.configkeys = getAftConfigKeys(action.payload.report?.data);
      })
      .addCase(fullConfigReport.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      });
  },
});

export default aftconfigSlice.reducer;
