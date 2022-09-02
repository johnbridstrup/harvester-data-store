import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "../pages/404";
import Login from "../pages/auth/login";
import ErrorsReportDetail from "../pages/errorreports/errordetail";
import ErrorsReportList from "../pages/errorreports/errorlist";
import ErrorReportPareto from "../pages/errorreports/errorpareto";
import Home from "../pages/home";
import NotificationDetail from "../pages/notification/notifydetail";
import NotificationList from "../pages/notification/notifylist";
import UserProfileView from "../pages/profile/profiledetail";
import { RequireUser, UserAuth } from "../utils/guards";

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
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default BaseRouter;
