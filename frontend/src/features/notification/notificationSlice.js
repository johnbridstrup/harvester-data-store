import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { invalidateCache } from "../auth/authSlice";
import notificationService from "./notificationService";
import { paginateRequest } from "features/base/service";

const initialState = {
  loading: false,
  notification: {},
  notifications: [],
  errorMsg: null,
  pagination: {
    next: null,
    previous: null,
    count: null,
    limit: 10,
    offset: 1,
  },
};

export const listNotifications = createAsyncThunk(
  "notification/listNotifications",
  async (limit, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await notificationService.listNotifications(token, limit);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getNotificationById = createAsyncThunk(
  "notification/getNotificationById",
  async (notifyId, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await notificationService.getNotificationById(notifyId, token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const deleteNotification = createAsyncThunk(
  "notification/deleteNotification",
  async (notifyId, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await notificationService.deleteNotification(notifyId, token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const deleteManyNotif = async (notifs, token) => {
  try {
    for (let i = 0; i < notifs.length; i++) {
      await notificationService.deleteNotification(notifs[i].id, token);
    }
    return { success: true, message: "Notification(s) deleted successfully" };
  } catch (error) {
    console.log(error);
    return { success: false, message: error.message };
  }
};

export const paginateNotification = createAsyncThunk(
  "notification/paginateNotification",
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

export const queryNotification = createAsyncThunk(
  "notification/queryNotification",
  async (queryObj, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await notificationService.queryNotification(queryObj, token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(listNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(listNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.results;
        state.pagination.count = action.payload.count;
        state.pagination.next = action.payload.next;
        state.pagination.previous = action.payload.previous;
      })
      .addCase(listNotifications.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      })
      .addCase(getNotificationById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getNotificationById.fulfilled, (state, action) => {
        state.loading = false;
        state.notification = action.payload;
      })
      .addCase(getNotificationById.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      })
      .addCase(deleteNotification.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      })
      .addCase(paginateNotification.pending, (state) => {
        state.loading = true;
      })
      .addCase(paginateNotification.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.results;
        state.pagination.count = action.payload.count;
        state.pagination.next = action.payload.next;
        state.pagination.previous = action.payload.previous;
      })
      .addCase(paginateNotification.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      })
      .addCase(queryNotification.pending, (state) => {
        state.loading = true;
      })
      .addCase(queryNotification.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.results;
        state.pagination.count = action.payload.count;
        state.pagination.next = action.payload.next;
        state.pagination.previous = action.payload.previous;
      })
      .addCase(queryNotification.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      });
  },
});

export default notificationSlice.reducer;
