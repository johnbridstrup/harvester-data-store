import {
  render,
  act,
  screen,
  getAllByRole,
  getByText,
} from "test-utils/testing-libary-utils";
import EmulatorstatsListView from "pages/emulatorstats/listview";
import userEvent from "@testing-library/user-event";
import selectEvent from "react-select-event";

test("should render the emustats list view", async () => {
  let user = userEvent.setup();
  let routeObject = [
    {
      path: "/emustats",
      element: <EmulatorstatsListView />,
    },
  ];
  let routeHistory = ["/emustats"];
  let initialRouteIndex = 0;

  await act(() => {
    render(<EmulatorstatsListView />, {
      routeHistory,
      initialRouteIndex,
      routeObject,
    });
  });

  const header = screen.getByText("HDS Emulator Statistics");
  expect(header).toBeInTheDocument();

  const form = screen.getByTestId("query-form");
  expect(form).toHaveFormValues({
    uuid: "",
    runner: "",
    branch: "",
    limit: 10,
    tags: "",
    start_time: "",
    end_time: "",
  });

  const combobox = screen.getAllByRole("combobox");
  expect(combobox).toHaveLength(1);

  const tagSelect = screen.getByLabelText("Tags");
  const uuid = screen.getByLabelText("UUID");
  const runner = screen.getByLabelText("Runner");
  const branch = screen.getByLabelText("Branch");
  const limit = screen.getByLabelText("Limit");
  const startTime = screen.getByLabelText("Start Time");
  const endTime = screen.getByLabelText("End Time");

  await act(async () => {
    await user.click(tagSelect);
  });

  await act(async () => {
    await selectEvent.select(tagSelect, [""]);
    await user.clear(limit);
    await user.type(uuid, "fake-uuid");
    await user.type(runner, "SBDevRunner");
    await user.type(branch, "HEAD");
    await user.type(limit, "100");
    await user.type(startTime, "20230322174630");
    await user.type(endTime, "20230322174631");
  });

  expect(form).toHaveFormValues({
    uuid: "fake-uuid",
    runner: "SBDevRunner",
    branch: "HEAD",
    limit: 100,
    tags: "",
    start_time: "20230322174630",
    end_time: "20230322174631",
  });

  const table = screen.getByRole("table");
  expect(table).toBeInTheDocument();

  let row = getAllByRole(table, "row");
  expect(row.length).toBe(2);
  let lastRow = row[1];
  expect(getByText(lastRow, "mar_goodfarms")).toBeInTheDocument();
  expect(getByText(lastRow, "20230617T004931.0")).toBeInTheDocument();
  expect(getByText(lastRow, "HEAD")).toBeInTheDocument();
  expect(getByText(lastRow, "mar")).toBeInTheDocument();
  expect(getByText(lastRow, "799")).toBeInTheDocument();
  expect(getByText(lastRow, "804")).toBeInTheDocument();
  expect(getByText(lastRow, "EmuNullTag")).toBeInTheDocument();
});
