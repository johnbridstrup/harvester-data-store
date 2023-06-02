import {
  getByText,
  render,
  screen,
  act,
} from "test-utils/testing-libary-utils";
import LocationListView from "pages/location/locationlist";

test("should render location list view", async () => {
  let routeObject = [
    {
      path: "/locations",
      element: <LocationListView />,
    },
  ];
  let routeHistory = ["/locations"];

  await act(() => {
    render(<LocationListView />, { routeHistory, routeObject });
  });

  const header = screen.getByText(/HDS Locations/i);
  expect(header).toBeInTheDocument();

  const addBtn = screen.getByRole("button", { name: "Add New Location" });
  expect(addBtn).toBeInTheDocument();

  const queueModal = screen.getByTestId("addUpdateModal");
  expect(queueModal).toBeInTheDocument();
  expect(queueModal).toHaveStyle({
    display: "none",
  });

  const table = await screen.findByRole("table");
  expect(table).toBeInTheDocument();

  const rows = await screen.findAllByRole("row");
  expect(rows.length).toBe(2);
  const lastRow = rows[1];
  expect(getByText(lastRow, "1")).toBeInTheDocument();
  expect(getByText(lastRow, "Distributor 1")).toBeInTheDocument();
  expect(getByText(lastRow, "Ranch A")).toBeInTheDocument();
  expect(getByText(lastRow, "United States")).toBeInTheDocument();
  expect(getByText(lastRow, "California")).toBeInTheDocument();
  expect(getByText(lastRow, "harvs-dev")).toBeInTheDocument();
  expect(getByText(lastRow, "aft")).toBeInTheDocument();
});
