import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  theme: localStorage.getItem("theme"),
};

const homeSlice = createSlice({
  name: "home",
  initialState,
  reducers: {
    setAppTheme: (state, action) => {
      state.theme = action.payload;
    },
  },
});

export default homeSlice.reducer;
export const { setAppTheme } = homeSlice.actions;
