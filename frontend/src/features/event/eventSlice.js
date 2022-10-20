import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { invalidateCache } from "../auth/authSlice";
import eventService from "./eventService";

const initialState = {
  loading: false,
  event: {},
  events: [],
  errorMsg: null,
  pagination: {
    next: null,
    previous: null,
    count: null,
    limit: 10,
    offset: 1,
  },
};

export const listEvents = createAsyncThunk(
  "event/listEvents",
  async (limit, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await eventService.listEvents(token, limit);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getEventById = createAsyncThunk(
  "event/getEventById",
  async (eventId, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await eventService.getEventById(eventId, token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const paginateEvent = createAsyncThunk(
  "event/paginateEvent",
  async (url, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await eventService.paginateEvent(url, token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const queryEvent = createAsyncThunk(
  "event/queryEvent",
  async (queryObj, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await eventService.queryEvent(queryObj, token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const eventSlice = createSlice({
  name: "event",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(listEvents.pending, (state) => {
        state.loading = true;
      })
      .addCase(listEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload.results;
        state.pagination.count = action.payload.count;
        state.pagination.next = action.payload.next;
        state.pagination.previous = action.payload.previous;
      })
      .addCase(listEvents.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      })
      .addCase(getEventById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getEventById.fulfilled, (state, action) => {
        state.loading = false;
        state.event = action.payload;
      })
      .addCase(getEventById.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      })
      .addCase(paginateEvent.pending, (state) => {
        state.loading = true;
      })
      .addCase(paginateEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload.results;
        state.pagination.count = action.payload.count;
        state.pagination.next = action.payload.next;
        state.pagination.previous = action.payload.previous;
      })
      .addCase(paginateEvent.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      })
      .addCase(queryEvent.pending, (state) => {
        state.loading = true;
      })
      .addCase(queryEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload.results;
        state.pagination.count = action.payload.count;
        state.pagination.next = action.payload.next;
        state.pagination.previous = action.payload.previous;
      })
      .addCase(queryEvent.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      });
  },
});

export default eventSlice.reducer;
