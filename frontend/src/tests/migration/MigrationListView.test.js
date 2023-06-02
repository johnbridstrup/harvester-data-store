import {
  getByText,
  render,
  screen,
  act,
} from "test-utils/testing-libary-utils";
import userEvent from "@testing-library/user-event";
import MigrationListView from "pages/migration/listview";

test("should render migrationlog list view", async () => {
  const user = userEvent.setup();
  let routeObject = [
    {
      path: "/migrations",
      element: <MigrationListView />,
    },
  ];
  let routeHistory = ["/migrations"];

  await act(() => {
    render(<MigrationListView />, { routeHistory, routeObject });
  });

  const banner = await screen.findByRole("banner");
  expect(banner).toBeInTheDocument();

  const queueBtn = screen.getByRole("button", { name: "Queue Migrations" });
  expect(queueBtn).toBeInTheDocument();

  const queueModal = screen.getByTestId("confirmModal");
  expect(queueModal).toBeInTheDocument();
  expect(queueModal).toHaveStyle({
    display: "none",
  });

  await user.click(queueBtn);

  const logsTable = await screen.findByRole("table");
  expect(logsTable).toBeInTheDocument();

  const rowData = await screen.findAllByRole("row");
  expect(rowData.length).toBe(2);
  const lastRow = rowData[1];
  expect(getByText(lastRow, "1")).toBeInTheDocument();
  expect(getByText(lastRow, "success")).toBeInTheDocument();
  expect(getByText(lastRow, "UNKNOWN")).toBeInTheDocument();

  const link = await screen.findByRole("link", { name: "success" });
  expect(link).toBeInTheDocument();
  expect(link.href).toBe("http://localhost/migrations/1");
});
