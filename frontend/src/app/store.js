import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import errorreportReducer from "../features/errorreport/errorreportSlice";
import harvesterReducer from "../features/harvester/harvesterSlice";
import locationReducer from "../features/location/locationSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    harvester: harvesterReducer,
    location: locationReducer,
    errorreport: errorreportReducer,
  },
});

export default store;
