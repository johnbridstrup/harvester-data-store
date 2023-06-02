import {
  getByText,
  render,
  screen,
  act,
} from "test-utils/testing-libary-utils";
import DistributorListView from "pages/distributor/distributorlist";

test("should render distributor list view", async () => {
  let routeObject = [
    {
      path: "/distributors",
      element: <DistributorListView />,
    },
  ];
  let routeHistory = ["/distributors"];

  await act(() => {
    render(<DistributorListView />, { routeHistory, routeObject });
  });

  const header = screen.getByText(/HDS Distributors/i);
  expect(header).toBeInTheDocument();

  const addBtn = screen.getByRole("button", { name: "Add New Distributor" });
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
  expect(getByText(lastRow, "aft")).toBeInTheDocument();
});
