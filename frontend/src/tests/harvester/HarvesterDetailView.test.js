import {
  render,
  act,
  screen,
  getAllByRole,
  getByText,
} from "test-utils/testing-libary-utils";
import HarvesterDetailView from "pages/harvester/harvesterdetail";

test("should render the harvester detail view", async () => {
  let routeObject = [
    {
      path: "/harvesters/:harvId",
      element: <HarvesterDetailView />,
    },
  ];
  let routeHistory = ["/harvesters/1"];
  let initialRouteIndex = 0;

  await act(() => {
    render(<HarvesterDetailView />, {
      routeHistory,
      initialRouteIndex,
      routeObject,
    });
  });

  const tabledata = screen.getAllByRole("table");
  expect(tabledata.length).toBe(2);
  const firstTable = tabledata[0];
  let rowData = getAllByRole(firstTable, "row");
  let lastRowData = rowData[1];
  expect(rowData.length).toBe(2);
  expect(getByText(lastRowData, "aft-harv011")).toBeInTheDocument();
  expect(getByText(lastRowData, "11")).toBeInTheDocument();
  expect(getByText(lastRowData, "apple")).toBeInTheDocument();
  expect(getByText(lastRowData, "Ranch B")).toBeInTheDocument();
  expect(getByText(lastRowData, "False")).toBeInTheDocument();

  const secondTable = tabledata[1];
  rowData = getAllByRole(secondTable, "row");
  lastRowData = rowData[1];
  expect(rowData.length).toBe(2);
  expect(getByText(lastRowData, "6")).toBeInTheDocument();
  expect(getByText(lastRowData, "20220920T065652.933")).toBeInTheDocument();
  expect(getByText(lastRowData, "0*, 0")).toBeInTheDocument();
  expect(
    getByText(lastRowData, "drivesys.0*, harvester.0")
  ).toBeInTheDocument();

  const alllistItem = screen.getAllByRole("listitem");
  expect(getByText(alllistItem[2], "Release")).toBeInTheDocument();
  expect(getByText(alllistItem[3], "Version")).toBeInTheDocument();
  expect(getByText(alllistItem[4], "AFTConfig")).toBeInTheDocument();
});
