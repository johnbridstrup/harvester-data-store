import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { invalidateCache } from "../auth/authSlice";
import userService from "./userService";
import { paginateRequest } from "features/base/service";

const initialState = {
  loading: false,
  adding: false,
  editting: false,
  user: {},
  users: [],
  errorMsg: null,
  pagination: {
    next: null,
    previous: null,
    count: null,
    limit: 10,
    offset: 1,
  },
};

export const listUsers = createAsyncThunk(
  "user/listUsers",
  async (limit, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await userService.listUsers(token, limit);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getUserById = createAsyncThunk(
  "user/getUserById",
  async (userId, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await userService.getUserById(userId, token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const createUser = createAsyncThunk(
  "user/createUser",
  async (userData, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await userService.createUser(userData, token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const paginateUser = createAsyncThunk(
  "user/paginateUser",
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

export const updateUser = createAsyncThunk(
  "user/updateUser",
  async (data, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await userService.updateUser(data, token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(listUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(listUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.results;
        state.pagination.count = action.payload.count;
        state.pagination.next = action.payload.next;
        state.pagination.previous = action.payload.previous;
      })
      .addCase(listUsers.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      })
      .addCase(getUserById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      })
      .addCase(createUser.pending, (state, action) => {
        state.adding = true;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.adding = false;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.adding = false;
        state.errorMsg = action.payload;
      })
      .addCase(paginateUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(paginateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.results;
        state.pagination.count = action.payload.count;
        state.pagination.next = action.payload.next;
        state.pagination.previous = action.payload.previous;
      })
      .addCase(paginateUser.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      })
      .addCase(updateUser.pending, (state) => {
        state.editting = true;
      })
      .addCase(updateUser.fulfilled, (state) => {
        state.editting = false;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.editting = false;
        state.errorMsg = action.payload;
      });
  },
});

export default userSlice.reducer;
