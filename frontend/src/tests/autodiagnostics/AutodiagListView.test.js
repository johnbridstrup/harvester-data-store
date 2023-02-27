import {
  render,
  act,
  screen,
  getByText,
  getAllByText,
} from "test-utils/testing-libary-utils";
import AutodiagnosticListView from "pages/autodiagnostics/listview";
import userEvent from "@testing-library/user-event";

test("should render the autodiagnostic list view", async () => {
  const user = userEvent.setup();
  let routeObject = [
    {
      path: "/autodiagnostics",
      element: <AutodiagnosticListView />,
    },
  ];
  let routeHistory = ["/autodiagnostics"];

  await act(() => {
    render(<AutodiagnosticListView />, { routeHistory, routeObject });
  });

  const header = screen.getByText(/HDS Autodiagnostics Report/i);
  expect(header).toBeInTheDocument();

  const combobox = screen.getAllByRole("combobox");
  expect(combobox.length).toBe(2);

  const uuidInput = screen.getByRole("textbox", { name: /UUID/i });
  const robotInput = screen.getByRole("spinbutton", { name: /Robot/i });
  const gripperInput = screen.getByRole("spinbutton", { name: /Gripper SN/i });

  await act(async () => {
    await user.clear(uuidInput);
    await user.clear(robotInput);
    await user.clear(gripperInput);

    await user.type(uuidInput, "fake-uuid");
    await user.type(robotInput, "0");
    await user.type(gripperInput, "1277");
  });

  expect(uuidInput).toHaveValue("fake-uuid");
  expect(robotInput).toHaveValue(0);
  expect(gripperInput).toHaveValue(1277);

  const table = screen.getByRole("table");
  expect(table).toBeInTheDocument();

  const rows = screen.getAllByRole("row");
  expect(rows.length).toBe(2);
  const lastRow = rows[1];
  expect(getByText(lastRow, "20230206T234724.671")).toBeInTheDocument();
  expect(getByText(lastRow, "1298")).toBeInTheDocument();
  expect(getAllByText(lastRow, "1").length).toBe(2);
});
