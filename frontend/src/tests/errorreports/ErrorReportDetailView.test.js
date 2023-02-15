import {
  render,
  act,
  screen,
  getAllByRole,
  getByText,
} from "test-utils/testing-libary-utils";
import ErrorsReportDetail from "pages/errorreports/errordetail";

// mock the react-plotly.js library, which fails to run server side
// TypeError: window.URL.createObjectURL is not a function

// Best practices on testing react app follow link
// https://blog.sapegin.me/all/react-testing-1-best-practices/

jest.mock("react-plotly.js", () => ({
  __esModule: true,
  default: jest.fn(() => <div>React Plotly Component</div>),
}));

test("should render the error report detail view", async () => {
  let routeObject = [
    {
      path: "/errorreports/:reportId",
      element: <ErrorsReportDetail />,
    },
  ];
  let routeHistory = ["/errorreports/1"];
  let initialRouteIndex = 0;

  await act(() => {
    render(<ErrorsReportDetail />, {
      routeHistory,
      initialRouteIndex,
      routeObject,
    });
  });

  const tables = screen.getAllByRole("table");
  expect(tables.length).toBe(3);

  const firstTable = tables[0];
  let rows = getAllByRole(firstTable, "row");
  expect(rows.length).toBe(2);
  let lastRow = rows[1];
  expect(getByText(lastRow, "20220920T065652.933")).toBeInTheDocument();
  expect(getByText(lastRow, "11")).toBeInTheDocument();
  expect(getByText(lastRow, "Ranch B")).toBeInTheDocument();
  expect(getByText(lastRow, "0*, 0")).toBeInTheDocument();
  expect(getByText(lastRow, "drivesys.0*, harvester.0")).toBeInTheDocument();

  const secondTable = tables[1];
  rows = getAllByRole(secondTable, "row");
  expect(rows.length).toBe(2);
  expect(getByText(rows[0], "-5.3e-8")).toBeInTheDocument();
  expect(getByText(rows[1], "1663646207.2189846")).toBeInTheDocument();

  const thirdTable = tables[2];
  rows = getAllByRole(thirdTable, "row");
  expect(rows.length).toBe(9);
  expect(getByText(rows[1], "rcoop.0")).toBeInTheDocument();
  expect(
    getByText(rows[rows.length - 1], "robotpathstore.0")
  ).toBeInTheDocument();
});
