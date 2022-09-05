import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import errorreportReducer from "../features/errorreport/errorreportSlice";
import codeReducer from "../features/excecode/codeSlice";
import fruitReducer from "../features/fruit/fruitSlice";
import harvesterReducer from "../features/harvester/harvesterSlice";
import locationReducer from "../features/location/locationSlice";
import notificationReducer from "../features/notification/notificationSlice";
import userReducer from "../features/user/userSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    harvester: harvesterReducer,
    location: locationReducer,
    errorreport: errorreportReducer,
    fruit: fruitReducer,
    exceptioncode: codeReducer,
    notification: notificationReducer,
    user: userReducer,
  },
});

export default store;
