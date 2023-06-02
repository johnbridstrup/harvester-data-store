import {
  getByText,
  render,
  screen,
  act,
} from "test-utils/testing-libary-utils";
import JobTypeListView from "pages/harvjobs/jobtypes/listview";

test("should render jobtype list view", async () => {
  let routeObject = [
    {
      path: "/jobtypes",
      element: <JobTypeListView />,
    },
  ];
  let routeHistory = ["/jobtypes"];

  await act(() => {
    render(<JobTypeListView />, { routeHistory, routeObject });
  });

  const header = screen.getByText(/HDS JobTypes/i);
  expect(header).toBeInTheDocument();

  const backLink = screen.getByRole("link", { name: /Back/i });
  expect(backLink).toBeInTheDocument();

  const table = screen.getByRole("table");
  expect(table).toBeInTheDocument();

  const rows = screen.getAllByRole("row");
  expect(rows.length).toBe(2);

  const lastRow = rows[1];
  expect(getByText(lastRow, "1")).toBeInTheDocument();
  expect(getByText(lastRow, "test")).toBeInTheDocument();
});
