import {
  act,
  getByText,
  render,
  screen,
  getAllByRole,
} from "test-utils/testing-libary-utils";
import ScheduledJobDetailView from "pages/jobscheduler/detailview";

test("should render scheduledjobs detail view", async () => {
  let routeObject = [
    {
      path: "/scheduledjobs/:jobId",
      element: <ScheduledJobDetailView />,
    },
  ];
  let routeHistory = ["/scheduledjobs/1"];

  await act(() => {
    render(<ScheduledJobDetailView />, { routeHistory, routeObject });
  });

  const header = screen.getByText(/HDS Scheduled Job 1/i);
  expect(header).toBeInTheDocument();

  const tables = await screen.findAllByRole("table");
  expect(tables.length).toBe(4);

  const firstTbl = tables[0];
  let rows = getAllByRole(firstTbl, "row");
  let lastRow = rows[1];
  expect(getByText(lastRow, "1")).toBeInTheDocument();
  expect(getByText(lastRow, "waiting to schedule")).toBeInTheDocument();

  const secondTbl = tables[1];
  rows = getAllByRole(secondTbl, "row");
  lastRow = rows[1];
  expect(getByText(lastRow, "1")).toBeInTheDocument();
  expect(getByText(lastRow, "scheduled_job_1_test")).toBeInTheDocument();
  expect(
    getByText(lastRow, "jobscheduler.tasks.run_scheduled_job")
  ).toBeInTheDocument();
  expect(getByText(lastRow, "[1]")).toBeInTheDocument();
  expect(getByText(lastRow, "0")).toBeInTheDocument();
});
