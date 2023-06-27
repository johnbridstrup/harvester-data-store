import {
  render,
  act,
  screen,
  getAllByRole,
  getByText,
} from "test-utils/testing-libary-utils";
import EmulatorstatsDetailView from "pages/emulatorstats/detailview";

test("should render the emustats detail view", async () => {
  let routeObject = [
    {
      path: "/emustats/:emustatsId",
      element: <EmulatorstatsDetailView />,
    },
  ];
  let routeHistory = ["/emustats/1"];
  let initialRouteIndex = 0;

  await act(() => {
    render(<EmulatorstatsDetailView />, {
      routeHistory,
      initialRouteIndex,
      routeObject,
    });
  });

  const header = screen.getByText("HDS Emulator Statistics 1");
  expect(header).toBeInTheDocument();

  const backBtn = screen.getByRole("link", { name: "Back" });
  expect(backBtn).toBeInTheDocument();

  const table = screen.getByRole("table");
  expect(table).toBeInTheDocument();

  let rows = getAllByRole(table, "row");
  expect(rows.length).toBe(2);
  let lastRow = rows[1];
  expect(getByText(lastRow, "20230617T004931.0")).toBeInTheDocument();
  expect(getByText(lastRow, "mar_goodfarms")).toBeInTheDocument();
  expect(getByText(lastRow, "mar")).toBeInTheDocument();
  expect(getByText(lastRow, "HEAD")).toBeInTheDocument();
  expect(getByText(lastRow, "799")).toBeInTheDocument();
  expect(getByText(lastRow, "804")).toBeInTheDocument();
  expect(getByText(lastRow, "EmuNullTag")).toBeInTheDocument();
});
