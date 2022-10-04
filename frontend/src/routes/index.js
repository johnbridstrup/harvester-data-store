import { BrowserRouter, Routes, Route } from "react-router-dom";
import Forbidden from "../pages/403";
import NotFound from "../pages/404";
import Login from "../pages/auth/login";
import DistributorListView from "../pages/distributor/distributorlist";
import ErrorsReportDetail from "../pages/errorreports/errordetail";
import ErrorsReportList from "../pages/errorreports/errorlist";
import ErrorReportPareto from "../pages/errorreports/errorpareto";
import EventDetailView from "../pages/event/eventdetail";
import EventListView from "../pages/event/eventlist";
import ReleaseCodeDetailView from "../pages/harvdeploy/releasedetail";
import ReleaseCodeListView from "../pages/harvdeploy/releaselist";
import HarvesterListView from "../pages/harvester/harvesterlist";
import Home from "../pages/home";
import LocationListView from "../pages/location/locationlist";
import NotificationDetail from "../pages/notification/notifydetail";
import NotificationList from "../pages/notification/notifylist";
import UserProfileView from "../pages/profile/profiledetail";
import UserListView from "../pages/users/userslist";
import { IsAdminOnly, RequireUser, UserAuth } from "../utils/guards";

const BaseRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <RequireUser>
              <Home />
            </RequireUser>
          }
        />
        <Route
          path="/login"
          element={
            <UserAuth>
              <Login />
            </UserAuth>
          }
        />
        <Route
          path="/errorreports"
          element={
            <RequireUser>
              <ErrorsReportList />
            </RequireUser>
          }
        />
        <Route
          path="/errorreports/view/pareto"
          element={
            <RequireUser>
              <ErrorReportPareto />
            </RequireUser>
          }
        />
        <Route
          path="/errorreports/:reportId"
          element={
            <RequireUser>
              <ErrorsReportDetail />
            </RequireUser>
          }
        />
        <Route
          path="/users/profile/me"
          element={
            <RequireUser>
              <UserProfileView />
            </RequireUser>
          }
        />
        <Route
          path="/notifications"
          element={
            <RequireUser>
              <NotificationList />
            </RequireUser>
          }
        />
        <Route
          path="/notifications/:notifyId"
          element={
            <RequireUser>
              <NotificationDetail />
            </RequireUser>
          }
        />
        <Route
          path="/users/all"
          element={
            <RequireUser>
              <IsAdminOnly>
                <UserListView />
              </IsAdminOnly>
            </RequireUser>
          }
        />
        <Route
          path="/harvesters"
          element={
            <RequireUser>
              <HarvesterListView />
            </RequireUser>
          }
        />
        <Route
          path="/locations"
          element={
            <RequireUser>
              <LocationListView />
            </RequireUser>
          }
        />
        <Route
          path="/distributors"
          element={
            <RequireUser>
              <DistributorListView />
            </RequireUser>
          }
        />
        <Route
          path="/events"
          element={
            <RequireUser>
              <EventListView />
            </RequireUser>
          }
        />
        <Route
          path="/events/:eventId"
          element={
            <RequireUser>
              <EventDetailView />
            </RequireUser>
          }
        />
        <Route
          path="/release"
          element={
            <RequireUser>
              <ReleaseCodeListView />
            </RequireUser>
          }
        />
        <Route
          path="/release/:releaseId"
          element={
            <RequireUser>
              <ReleaseCodeDetailView />
            </RequireUser>
          }
        />
        <Route
          path="/forbidden"
          element={
            <RequireUser>
              <Forbidden />
            </RequireUser>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default BaseRouter;
