import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { RouteLoader } from "components/styled";
import { IsAdminOnly, RequireUser, UserAuth } from "utils/guards";
import { Loader } from "utils/utils";

import Forbidden from "pages/403";
import NotFound from "pages/404";
const Login = lazy(() => import("pages/auth/login"));
const DistributorListView = lazy(() =>
  import("pages/distributor/distributorlist")
);
const ErrorsReportDetail = lazy(() => import("pages/errorreports/errordetail"));
const ErrorsReportList = lazy(() => import("pages/errorreports/errorlist"));
const ErrorReportPareto = lazy(() => import("pages/errorreports/errorpareto"));
const EventDetailView = lazy(() => import("pages/event/eventdetail"));
const EventListView = lazy(() => import("pages/event/eventlist"));
const ReleaseCodeDetailView = lazy(() =>
  import("pages/harvdeploy/releasedetail")
);
const ReleaseCodeListView = lazy(() => import("pages/harvdeploy/releaselist"));
const VersionReportDetailView = lazy(() =>
  import("pages/harvdeploy/versiondetail")
);
const VersionReportListView = lazy(() =>
  import("pages/harvdeploy/versionlist")
);
const HarvesterDetailView = lazy(() =>
  import("pages/harvester/harvesterdetail")
);
const HarvesterListView = lazy(() => import("pages/harvester/harvesterlist"));
const HarvVersionListView = lazy(() =>
  import("pages/harvester/harvversionlist")
);
const HarvesterHistoryDetailView = lazy(() =>
  import("pages/harvester/historydetail")
);
const HarvesterHistoryListView = lazy(() =>
  import("pages/harvester/historylist")
);
const Home = lazy(() => import("pages/home"));
const LocationListView = lazy(() => import("pages/location/locationlist"));
const NotificationDetail = lazy(() =>
  import("pages/notification/notifydetail")
);
const NotificationList = lazy(() => import("pages/notification/notifylist"));
const UserProfileView = lazy(() => import("pages/profile/profiledetail"));
const UserListView = lazy(() => import("pages/users/userslist"));
const JobTypeDetailView = lazy(() =>
  import("pages/harvjobs/jobtypes/detailview")
);
const JobTypeListView = lazy(() => import("pages/harvjobs/jobtypes/listview"));
const JobSchemaDetailView = lazy(() =>
  import("pages/harvjobs/jobschemas/detailview")
);
const JobSchemaListVIew = lazy(() =>
  import("pages/harvjobs/jobschemas/listview")
);
const JobSchedulerView = lazy(() => import("pages/harvjobs/jobscheduler"));
const ScheduleJobView = lazy(() => import("pages/harvjobs/schedulejob"));
const JobListView = lazy(() => import("pages/harvjobs/jobs/listview"));
const JobDetailView = lazy(() => import("pages/harvjobs/jobs/detailview"));
const JobResultListView = lazy(() =>
  import("pages/harvjobs/jobresults/listview")
);
const JobResultDetailView = lazy(() =>
  import("pages/harvjobs/jobresults/detailview")
);
const JobHistoryView = lazy(() => import("pages/harvjobs/jobhistory"));
const LogSessionListView = lazy(() =>
  import("pages/logparser/logsession/listview")
);
const LogSessionDetailView = lazy(() =>
  import("pages/logparser/logsession/detailview")
);
const LogFileListView = lazy(() => import("pages/logparser/logfile/listview"));
const MigrationListView = lazy(() => import("pages/migration/listview"));
const MigrationDetailView = lazy(() => import("pages/migration/detailview"));
const S3FileListView = lazy(() => import("pages/s3files/listview"));
const S3FileDetailView = lazy(() => import("pages/s3files/detailview"));
const AutodiagnosticListView = lazy(() =>
  import("pages/autodiagnostics/listview")
);
const AutodiagnosticDetailView = lazy(() =>
  import("pages/autodiagnostics/detailview")
);
const PickSessionListView = lazy(() => import("pages/event/picksessionlist"));

const BaseRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <RequireUser>
            <Suspense
              fallback={
                <RouteLoader>
                  <Loader size={50} />
                </RouteLoader>
              }
            >
              <Home />
            </Suspense>
          </RequireUser>
        }
      />
      <Route
        path="/login"
        element={
          <UserAuth>
            <Suspense
              fallback={
                <RouteLoader>
                  <Loader size={50} />
                </RouteLoader>
              }
            >
              <Login />
            </Suspense>
          </UserAuth>
        }
      />
      <Route
        path="/errorreports"
        element={
          <RequireUser>
            <Suspense
              fallback={
                <RouteLoader>
                  <Loader size={50} />
                </RouteLoader>
              }
            >
              <ErrorsReportList />
            </Suspense>
          </RequireUser>
        }
      />
      <Route
        path="/errorreports/view/pareto"
        element={
          <RequireUser>
            <Suspense
              fallback={
                <RouteLoader>
                  <Loader size={50} />
                </RouteLoader>
              }
            >
              <ErrorReportPareto />
            </Suspense>
          </RequireUser>
        }
      />
      <Route
        path="/errorreports/:reportId"
        element={
          <RequireUser>
            <Suspense
              fallback={
                <RouteLoader>
                  <Loader size={50} />
                </RouteLoader>
              }
            >
              <ErrorsReportDetail />
            </Suspense>
          </RequireUser>
        }
      />
      <Route
        path="/users/profile/me"
        element={
          <RequireUser>
            <Suspense
              fallback={
                <RouteLoader>
                  <Loader size={50} />
                </RouteLoader>
              }
            >
              <UserProfileView />
            </Suspense>
          </RequireUser>
        }
      />
      <Route
        path="/notifications"
        element={
          <RequireUser>
            <Suspense
              fallback={
                <RouteLoader>
                  <Loader size={50} />
                </RouteLoader>
              }
            >
              <NotificationList />
            </Suspense>
          </RequireUser>
        }
      />
      <Route
        path="/notifications/:notifyId"
        element={
          <RequireUser>
            <Suspense
              fallback={
                <RouteLoader>
                  <Loader size={50} />
                </RouteLoader>
              }
            >
              <NotificationDetail />
            </Suspense>
          </RequireUser>
        }
      />
      <Route
        path="/users"
        element={
          <RequireUser>
            <IsAdminOnly>
              <Suspense
                fallback={
                  <RouteLoader>
                    <Loader size={50} />
                  </RouteLoader>
                }
              >
                <UserListView />
              </Suspense>
            </IsAdminOnly>
          </RequireUser>
        }
      />
      <Route
        path="/harvesters"
        element={
          <RequireUser>
            <Suspense
              fallback={
                <RouteLoader>
                  <Loader size={50} />
                </RouteLoader>
              }
            >
              <HarvesterListView />
            </Suspense>
          </RequireUser>
        }
      />
      <Route
        path="/harvesters/:harvId"
        element={
          <RequireUser>
            <Suspense
              fallback={
                <RouteLoader>
                  <Loader size={50} />
                </RouteLoader>
              }
            >
              <HarvesterDetailView />
            </Suspense>
          </RequireUser>
        }
      />
      <Route
        path="/harvesters/:harvId/versions"
        element={
          <RequireUser>
            <Suspense
              fallback={
                <RouteLoader>
                  <Loader size={50} />
                </RouteLoader>
              }
            >
              <HarvVersionListView />
            </Suspense>
          </RequireUser>
        }
      />
      <Route
        path="/harvesterhistory"
        element={
          <RequireUser>
            <Suspense
              fallback={
                <RouteLoader>
                  <Loader size={50} />
                </RouteLoader>
              }
            >
              <HarvesterHistoryListView />
            </Suspense>
          </RequireUser>
        }
      />
      <Route
        path="/harvesterhistory/:historyId"
        element={
          <RequireUser>
            <Suspense
              fallback={
                <RouteLoader>
                  <Loader size={50} />
                </RouteLoader>
              }
            >
              <HarvesterHistoryDetailView />
            </Suspense>
          </RequireUser>
        }
      />
      <Route
        path="/locations"
        element={
          <RequireUser>
            <Suspense
              fallback={
                <RouteLoader>
                  <Loader size={50} />
                </RouteLoader>
              }
            >
              <LocationListView />
            </Suspense>
          </RequireUser>
        }
      />
      <Route
        path="/distributors"
        element={
          <RequireUser>
            <Suspense
              fallback={
                <RouteLoader>
                  <Loader size={50} />
                </RouteLoader>
              }
            >
              <DistributorListView />
            </Suspense>
          </RequireUser>
        }
      />
      <Route
        path="/events"
        element={
          <RequireUser>
            <Suspense
              fallback={
                <RouteLoader>
                  <Loader size={50} />
                </RouteLoader>
              }
            >
              <EventListView />
            </Suspense>
          </RequireUser>
        }
      />
      <Route
        path="/events/:eventId"
        element={
          <RequireUser>
            <Suspense
              fallback={
                <RouteLoader>
                  <Loader size={50} />
                </RouteLoader>
              }
            >
              <EventDetailView />
            </Suspense>
          </RequireUser>
        }
      />
      <Route
        path="/release"
        element={
          <RequireUser>
            <Suspense
              fallback={
                <RouteLoader>
                  <Loader size={50} />
                </RouteLoader>
              }
            >
              <ReleaseCodeListView />
            </Suspense>
          </RequireUser>
        }
      />
      <Route
        path="/release/:releaseId"
        element={
          <RequireUser>
            <Suspense
              fallback={
                <RouteLoader>
                  <Loader size={50} />
                </RouteLoader>
              }
            >
              <ReleaseCodeDetailView />
            </Suspense>
          </RequireUser>
        }
      />
      <Route
        path="/harvversion"
        element={
          <RequireUser>
            <Suspense
              fallback={
                <RouteLoader>
                  <Loader size={50} />
                </RouteLoader>
              }
            >
              <VersionReportListView />
            </Suspense>
          </RequireUser>
        }
      />
      <Route
        path="/harvversion/:versionId"
        element={
          <RequireUser>
            <Suspense
              fallback={
                <RouteLoader>
                  <Loader size={50} />
                </RouteLoader>
              }
            >
              <VersionReportDetailView />
            </Suspense>
          </RequireUser>
        }
      />
      <Route
        path="/jobtypes"
        element={
          <RequireUser>
            <Suspense
              fallback={
                <RouteLoader>
                  <Loader size={50} />
                </RouteLoader>
              }
            >
              <JobTypeListView />
            </Suspense>
          </RequireUser>
        }
      />
      <Route
        path="/jobtypes/:jobtypeId"
        element={
          <RequireUser>
            <Suspense
              fallback={
                <RouteLoader>
                  <Loader size={50} />
                </RouteLoader>
              }
            >
              <JobTypeDetailView />
            </Suspense>
          </RequireUser>
        }
      />
      <Route
        path="/jobschemas"
        element={
          <RequireUser>
            <Suspense
              fallback={
                <RouteLoader>
                  <Loader size={50} />
                </RouteLoader>
              }
            >
              <JobSchemaListVIew />
            </Suspense>
          </RequireUser>
        }
      />
      <Route
        path="/jobschemas/:jobschemaId"
        element={
          <RequireUser>
            <Suspense
              fallback={
                <RouteLoader>
                  <Loader size={50} />
                </RouteLoader>
              }
            >
              <JobSchemaDetailView />
            </Suspense>
          </RequireUser>
        }
      />
      <Route
        path="/jobscheduler"
        element={
          <RequireUser>
            <Suspense
              fallback={
                <RouteLoader>
                  <Loader size={50} />
                </RouteLoader>
              }
            >
              <JobSchedulerView />
            </Suspense>
          </RequireUser>
        }
      />
      <Route
        path="/schedulejob/:jobschemaId"
        element={
          <RequireUser>
            <Suspense
              fallback={
                <RouteLoader>
                  <Loader size={50} />
                </RouteLoader>
              }
            >
              <ScheduleJobView />
            </Suspense>
          </RequireUser>
        }
      />
      <Route
        path="/jobs"
        element={
          <RequireUser>
            <Suspense
              fallback={
                <RouteLoader>
                  <Loader size={50} />
                </RouteLoader>
              }
            >
              <JobListView />
            </Suspense>
          </RequireUser>
        }
      />
      <Route
        path="/jobs/:jobId"
        element={
          <RequireUser>
            <Suspense
              fallback={
                <RouteLoader>
                  <Loader size={50} />
                </RouteLoader>
              }
            >
              <JobDetailView />
            </Suspense>
          </RequireUser>
        }
      />
      <Route
        path="/jobresults"
        element={
          <RequireUser>
            <Suspense
              fallback={
                <RouteLoader>
                  <Loader size={50} />
                </RouteLoader>
              }
            >
              <JobResultListView />
            </Suspense>
          </RequireUser>
        }
      />
      <Route
        path="/jobresults/:jobresultId"
        element={
          <RequireUser>
            <Suspense
              fallback={
                <RouteLoader>
                  <Loader size={50} />
                </RouteLoader>
              }
            >
              <JobResultDetailView />
            </Suspense>
          </RequireUser>
        }
      />
      <Route
        path="/jobstatus/:jobId"
        element={
          <RequireUser>
            <Suspense
              fallback={
                <RouteLoader>
                  <Loader size={50} />
                </RouteLoader>
              }
            >
              <JobHistoryView />
            </Suspense>
          </RequireUser>
        }
      />
      <Route
        path="/logsession"
        element={
          <RequireUser>
            <Suspense
              fallback={
                <RouteLoader>
                  <Loader size={50} />
                </RouteLoader>
              }
            >
              <LogSessionListView />
            </Suspense>
          </RequireUser>
        }
      />
      <Route
        path="/logsession/:sessionId"
        element={
          <RequireUser>
            <Suspense
              fallback={
                <RouteLoader>
                  <Loader size={50} />
                </RouteLoader>
              }
            >
              <LogSessionDetailView />
            </Suspense>
          </RequireUser>
        }
      />
      <Route
        path="/logfiles/:sessionId"
        element={
          <RequireUser>
            <Suspense
              fallback={
                <RouteLoader>
                  <Loader size={50} />
                </RouteLoader>
              }
            >
              <LogFileListView />
            </Suspense>
          </RequireUser>
        }
      />
      <Route
        path="/migrations"
        element={
          <RequireUser>
            <Suspense
              fallback={
                <RouteLoader>
                  <Loader size={50} />
                </RouteLoader>
              }
            >
              <MigrationListView />
            </Suspense>
          </RequireUser>
        }
      />
      <Route
        path="/migrations/:migrationId"
        element={
          <RequireUser>
            <Suspense
              fallback={
                <RouteLoader>
                  <Loader size={50} />
                </RouteLoader>
              }
            >
              <MigrationDetailView />
            </Suspense>
          </RequireUser>
        }
      />
      <Route
        path="/s3files"
        element={
          <RequireUser>
            <Suspense
              fallback={
                <RouteLoader>
                  <Loader size={50} />
                </RouteLoader>
              }
            >
              <S3FileListView />
            </Suspense>
          </RequireUser>
        }
      />
      <Route
        path="/s3files/:s3fileId"
        element={
          <RequireUser>
            <Suspense
              fallback={
                <RouteLoader>
                  <Loader size={50} />
                </RouteLoader>
              }
            >
              <S3FileDetailView />
            </Suspense>
          </RequireUser>
        }
      />
      <Route
        path="/autodiagnostics"
        element={
          <RequireUser>
            <Suspense
              fallback={
                <RouteLoader>
                  <Loader size={50} />
                </RouteLoader>
              }
            >
              <AutodiagnosticListView />
            </Suspense>
          </RequireUser>
        }
      />
      <Route
        path="/autodiagnostics/:reportId"
        element={
          <RequireUser>
            <Suspense
              fallback={
                <RouteLoader>
                  <Loader size={50} />
                </RouteLoader>
              }
            >
              <AutodiagnosticDetailView />
            </Suspense>
          </RequireUser>
        }
      />
      <Route
        path="/picksessions"
        element={
          <RequireUser>
            <Suspense
              fallback={
                <RouteLoader>
                  <Loader size={50} />
                </RouteLoader>
              }
            >
              <PickSessionListView />
            </Suspense>
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
  );
};

export default BaseRoutes;
