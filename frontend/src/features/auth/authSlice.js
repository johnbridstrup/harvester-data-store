import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from './authService';

const isAuthenticated = JSON.parse(sessionStorage.getItem('isAuthenticated')) || false;
const user = JSON.parse(sessionStorage.getItem('user')) || null;
const token = JSON.parse(sessionStorage.getItem('token')) || null;

const initialState = {
  token,
  isAuthenticated,
  loading: false,
  user,
  errorCode: null,
  errorMsg: null
}

export const login = createAsyncThunk('auth/login',async (user, thunkAPI) => {
  try {
    return await authService.login(user);
  } catch (error) {
    console.log(error)
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('isAuthenticated');
    return thunkAPI.rejectWithValue(message);
  }
});

export const logout = createAsyncThunk('auth/logout', async(tokenData, thunkAPI) => {
  try {
    return await authService.logout(tokenData);
  } catch (error) {
    console.log(error);
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
    return thunkAPI.rejectWithValue(message);
  }
})

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      state.loading = false
      state.isAuthenticated = false
      state.token = null
      state.user = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.token = action.payload.data.data.token
        state.user = action.payload.data.data.user
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.isAuthenticated = false
        state.token = null
        state.user = null
        state.errorMsg = action.payload
      })
      .addCase(logout.pending, (state, action) => {
        state.loading = true
      })
      .addCase(logout.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = false
        state.token = null
        state.user = null
        state.errorMsg = null
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false
        state.errorMsg = action.payload
      })
  }
});


export const { reset } = authSlice.actions;
export default authSlice.reducer;