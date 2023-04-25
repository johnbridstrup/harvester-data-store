import {
  render,
  act,
  screen,
  getByText,
  getAllByText,
} from "test-utils/testing-libary-utils";
import AutodiagnosticListView from "pages/autodiagnostics/listview";
import userEvent from "@testing-library/user-event";
import selectEvent from "react-select-event";

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

  const form = screen.getByTestId("query-form");
  expect(form).toHaveFormValues({
    harv_ids: "",
    locations: "",
    uuid: "",
    robot: null,
    gripper_sn: null,
    start_time: "",
    end_time: "",
  });

  const combobox = screen.getAllByRole("combobox");
  expect(combobox.length).toBe(2);

  const harvIdSelect = screen.getByLabelText("Harv IDS");
  const ranchSelect = screen.getByLabelText("Ranches");

  const uuidInput = screen.getByRole("textbox", { name: /UUID/i });
  const robotInput = screen.getByRole("spinbutton", { name: /Robot/i });
  const gripperInput = screen.getByRole("spinbutton", { name: /Gripper SN/i });
  const result1 = screen.getByRole("radio", { name: /Result Success/i });
  const result0 = screen.getByRole("radio", { name: /Result Failed/i });
  const startTime = screen.getByRole("textbox", { name: /Start Time/i });
  const endTime = screen.getByRole("textbox", { name: /End Time/i });

  await act(async () => {
    await user.click(harvIdSelect);
    await user.click(ranchSelect);

    await user.clear(uuidInput);
    await user.clear(robotInput);
    await user.clear(gripperInput);

    await user.type(uuidInput, "fake-uuid");
    await user.type(robotInput, "0");
    await user.type(gripperInput, "1277");
    await user.click(result1);
    await user.type(startTime, "20230206T234724.670");
    await user.type(endTime, "20230206T234724.671");
  });

  await act(async () => {
    await selectEvent.select(harvIdSelect, ["11"]);
    await selectEvent.select(ranchSelect, ["Ranch A"]);
  });

  expect(form).toHaveFormValues({
    harv_ids: "11",
    locations: "Ranch A",
    uuid: "fake-uuid",
    robot: 0,
    gripper_sn: 1277,
    result: "1",
    start_time: "20230206T234724.670",
    end_time: "20230206T234724.671",
  });
  expect(result1).toBeChecked();
  expect(result0).not.toBeChecked();

  const table = screen.getByRole("table");
  expect(table).toBeInTheDocument();

  const rows = screen.getAllByRole("row");
  expect(rows.length).toBe(2);
  const lastRow = rows[1];
  expect(getByText(lastRow, "20230206T234724.671")).toBeInTheDocument();
  expect(getByText(lastRow, "success")).toBeInTheDocument();
  expect(getByText(lastRow, "1298")).toBeInTheDocument();
  expect(getByText(lastRow, "11")).toBeInTheDocument();
  expect(getByText(lastRow, "strawberry")).toBeInTheDocument();
  expect(getAllByText(lastRow, "1").length).toBe(2);
});
