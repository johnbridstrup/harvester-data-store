import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { findLogIndex, sortServices } from "utils/utils";
import { uniqueVideoTabs } from "utils/utils";
import { invalidateCache } from "../auth/authSlice";
import logparserService from "./logparserService";

const initialState = {
  loading: false,
  uploading: false,
  logsessions: [],
  logsession: {},
  logfile: {},
  oglogfile: {},
  logvideo: {},
  currentMarker: null,
  currentIndex: null,
  internal: {
    harv_id: null,
    services: [],
    robots: [],
    videos: [],
    search: {
      searchText: null,
      content: [],
      currentIndex: null,
      countIndex: 0,
    },
  },
  errorMsg: null,
  pagination: {
    next: null,
    previous: null,
    count: 0,
    limit: 10,
    offset: 1,
  },
};

export const listLogSession = createAsyncThunk(
  "logparser/listLogSession",
  async (data, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await logparserService.listLogSession(token, data);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getLogSessionById = createAsyncThunk(
  "logparser/getLogSessionById",
  async (id, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await logparserService.getLogSessionById(id, token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const createLogSession = createAsyncThunk(
  "logparser/createLogSession",
  async (data, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await logparserService.createLogSession(token, data);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const paginateLogSession = createAsyncThunk(
  "logparser/paginateLogSession",
  async (url, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await logparserService.paginateLog(url, token);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getLogFileById = createAsyncThunk(
  "logparser/getLogFileById",
  async (id, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      // cache log files by id in session
      let cachedData = sessionStorage.getItem(String(id));
      if (cachedData) {
        return JSON.parse(cachedData);
      } else {
        let data = await logparserService.getLogFileById(id, token);
        try {
          sessionStorage.setItem(String(id), JSON.stringify(data));
        } catch (error) {
          console.log(error);
        }
        return data;
      }
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const queryLogVideo = createAsyncThunk(
  "logparser/queryLogVideo",
  async (data, thunkAPI) => {
    try {
      const {
        auth: { token },
      } = thunkAPI.getState();
      return await logparserService.queryLogVideo(token, data);
    } catch (error) {
      console.log(error);
      const message = invalidateCache(error, thunkAPI.dispatch);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const logparserSlice = createSlice({
  name: "logparser",
  initialState,
  reducers: {
    setMarker: (state, action) => {
      let payload = action.payload;
      state.currentMarker = payload.log.timestamp;
      state.currentIndex = payload.index;
    },
    clearMarker: (state) => {
      state.currentMarker = null;
    },
    setCurrIndex: (state, action) => {
      state.currentIndex = action.payload;
    },
    searchLog: (state, action) => {
      if (action.payload) {
        let filtered = state.oglogfile.content?.filter((x) =>
          x.log_message.toLowerCase().includes(action.payload.toLowerCase())
        );
        let objIndex = findLogIndex(state.oglogfile.content, filtered[0]);
        state.internal.search.searchText = action.payload;
        state.internal.search.currentIndex = objIndex;
        state.internal.search.countIndex = 0;
        state.internal.search.content = filtered;
        state.currentIndex = objIndex;
      } else {
        state.internal.search.currentIndex = null;
        state.internal.search.countIndex = 0;
        state.internal.search.content = [];
      }
    },
    scrollUpIndex: (state) => {
      let current = state.internal.search.countIndex - 1;
      if (
        state.internal.search.searchText &&
        state.internal.search.content[current]
      ) {
        let obj = state.internal.search.content[current];
        let objIndex = findLogIndex(state.oglogfile.content, obj);
        state.internal.search.currentIndex = objIndex;
        state.internal.search.countIndex = current;
        state.currentIndex = objIndex;
      }
    },
    scrollDownIndex: (state) => {
      let current = state.internal.search.countIndex + 1;
      if (
        state.internal.search.searchText &&
        state.internal.search.content[current]
      ) {
        let obj = state.internal.search.content[current];
        let objIndex = findLogIndex(state.oglogfile.content, obj);
        state.internal.search.currentIndex = objIndex;
        state.internal.search.countIndex = current;
        state.currentIndex = objIndex;
      }
    },
    clearSearch: (state) => {
      state.internal.search.searchText = null;
      state.internal.search.currentIndex = null;
      state.internal.search.countIndex = 0;
      state.internal.search.content = [];
    },
    tabChangeSearch: (state) => {
      let searchText = state.internal.search.searchText;
      if (searchText) {
        let filtered = state.oglogfile.content?.filter((x) =>
          x.log_message.toLowerCase().includes(searchText.toLowerCase())
        );
        state.internal.search.countIndex = 0;
        state.internal.search.content = filtered;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(listLogSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(listLogSession.fulfilled, (state, action) => {
        state.loading = false;
        state.logsessions = action.payload.results;
        state.pagination.count = action.payload.count;
        state.pagination.next = action.payload.next;
        state.pagination.previous = action.payload.previous;
      })
      .addCase(listLogSession.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      })
      .addCase(getLogSessionById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getLogSessionById.fulfilled, (state, action) => {
        let payload = action.payload;
        state.loading = false;
        state.logsession = payload;
        state.internal.services = sortServices(payload.logs?.services || []);
        state.internal.robots = payload.logs?.robots || [];
        state.internal.harv_id = payload.logs?.harv_id;
        state.internal.videos = uniqueVideoTabs(payload.logs?.videos || []);
      })
      .addCase(getLogSessionById.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      })
      .addCase(createLogSession.pending, (state) => {
        state.uploading = true;
      })
      .addCase(createLogSession.fulfilled, (state, action) => {
        state.uploading = false;
        state.logsession = action.payload;
      })
      .addCase(createLogSession.rejected, (state, action) => {
        state.uploading = false;
        state.errorMsg = action.payload;
      })
      .addCase(paginateLogSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(paginateLogSession.fulfilled, (state, action) => {
        state.loading = false;
        state.logsessions = action.payload.results;
        state.pagination.count = action.payload.count;
        state.pagination.next = action.payload.next;
        state.pagination.previous = action.payload.previous;
      })
      .addCase(paginateLogSession.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      })
      .addCase(getLogFileById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getLogFileById.fulfilled, (state, action) => {
        state.loading = false;
        state.logfile = action.payload;
        state.oglogfile = action.payload;
      })
      .addCase(getLogFileById.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      })
      .addCase(queryLogVideo.pending, (state) => {
        state.loading = true;
      })
      .addCase(queryLogVideo.fulfilled, (state, action) => {
        state.loading = false;
        state.logvideo = action.payload.results[0] || {};
      })
      .addCase(queryLogVideo.rejected, (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
      });
  },
});

export const {
  setMarker,
  clearMarker,
  searchLog,
  setCurrIndex,
  scrollUpIndex,
  scrollDownIndex,
  clearSearch,
  tabChangeSearch,
} = logparserSlice.actions;
export default logparserSlice.reducer;
