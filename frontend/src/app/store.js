import { configureStore } from "@reduxjs/toolkit";
import authReducer from "features/auth/authSlice";
import distributorReducer from "features/distributor/distributorSlice";
import errorreportReducer from "features/errorreport/errorreportSlice";
import eventReducer from "features/event/eventSlice";
import codeReducer from "features/excecode/codeSlice";
import fruitReducer from "features/fruit/fruitSlice";
import harvdeployReducer from "features/harvdeploy/harvdeploySlice";
import harvesterReducer from "features/harvester/harvesterSlice";
import harvjobReducer from "features/harvjobs/harvjobSlice";
import locationReducer from "features/location/locationSlice";
import logparserReducer from "features/logparser/logparserSlice";
import notificationReducer from "features/notification/notificationSlice";
import userReducer from "features/user/userSlice";
import migrationReducer from "features/migration/migrationSlice";
import homeReducer from "features/home/homeSlice";
import s3fileReducer from "features/s3file/s3fileSlice";
import aftconfigReducer from "features/aftconfigs/aftconfigSlice";
import autodiagnosticReducer from "features/autodiagnostics/autodiagnosticSlice";
import emulatorstatsReducer from "features/emulatorstats/emulatorstatsSlice";
import { PROD_ENV } from "features/base/constants";

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
    harvdeploy: harvdeployReducer,
    harvjobs: harvjobReducer,
    logparser: logparserReducer,
    migration: migrationReducer,
    home: homeReducer,
    s3file: s3fileReducer,
    aftconfig: aftconfigReducer,
    autodiagnostic: autodiagnosticReducer,
    emulatorstats: emulatorstatsReducer,
  },
  devTools: process.env.REACT_APP_NODE_ENV !== PROD_ENV,
});

export default store;
