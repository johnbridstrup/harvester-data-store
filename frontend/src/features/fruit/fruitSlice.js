import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { invalidateCache } from "../auth/authSlice";
import fruitService from "./fruitService";

const initialState = {
  loading: false,
  fruits: [],
  fruit: {},
  errorMsg: null,
};

export const listFruits = createAsyncThunk(
  "fruit/listFruits",
  async (limit, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await fruitService.listFruits(token, limit);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getFruitById = createAsyncThunk(
  "fruit/getFruitById",
  async (fruitId, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await fruitService.getFruitById(token, fruitId);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const fruitSlice = createSlice({
  name: "fruit",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(listFruits.pending, (state) => {
        state.loading = true;
      })
      .addCase(listFruits.fulfilled, (state, action) => {
        state.loading = false;
        state.fruits = action.payload;
      })
      .addCase(listFruits.rejected, (state, action) => {
        state.loading = false;
        state.fruits = [];
        state.errorMsg = action.payload;
      })
      .addCase(getFruitById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getFruitById.fulfilled, (state, action) => {
        state.loading = false;
        state.fruit = action.payload;
      })
      .addCase(getFruitById.rejected, (state, action) => {
        state.loading = false;
        state.fruit = {};
        state.errorMsg = action.payload;
      });
  },
});

export default fruitSlice.reducer;
