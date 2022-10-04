import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import distributorReducer from "../features/distributor/distributorSlice";
import errorreportReducer from "../features/errorreport/errorreportSlice";
import eventReducer from "../features/event/eventSlice";
import codeReducer from "../features/excecode/codeSlice";
import fruitReducer from "../features/fruit/fruitSlice";
import releaseReducer from "../features/harvdeploy/releaseSlice";
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
    distributor: distributorReducer,
    event: eventReducer,
    release: releaseReducer,
  },
});

export default store;
