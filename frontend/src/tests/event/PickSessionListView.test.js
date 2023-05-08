import {
  render,
  act,
  screen,
  getByText,
} from "test-utils/testing-libary-utils";
import userEvent from "@testing-library/user-event";
import selectEvent from "react-select-event";
import PickSessionListView from "pages/event/picksessionlist";

jest.setTimeout(10000);

test("should render the pickssession list view", async () => {
  const user = userEvent.setup();
  let routeObject = [
    {
      path: "/picksessions",
      element: <PickSessionListView />,
    },
  ];
  let routeHistory = ["/picksessions"];

  await act(() => {
    render(<PickSessionListView />, { routeHistory, routeObject });
  });

  const header = screen.getByText("HDS PickSessions");
  expect(header).toBeInTheDocument();

  const form = screen.getByTestId("query-form");
  expect(form).toHaveFormValues({
    harv_ids: "",
    locations: "",
    start_time: "",
    end_time: "",
    uuid: "",
  });

  const combobox = screen.getAllByRole("combobox");
  expect(combobox).toHaveLength(3);

  const harvIdSelect = screen.getByLabelText("Harv IDS");
  const ranchSelect = screen.getByLabelText("Ranches");
  const tagSelect = screen.getByLabelText("Tags");
  const uuidInput = screen.getByRole("textbox", { name: /PickSession/i });
  const startTime = screen.getByRole("textbox", { name: /Start Time/i });
  const endTime = screen.getByRole("textbox", { name: /End Time/i });

  await act(async () => {
    await user.click(harvIdSelect);
    await user.click(ranchSelect);
    await user.click(tagSelect);
  });

  await act(async () => {
    await user.type(uuidInput, "fake-uuid");
    await user.type(startTime, "20230322174630");
    await user.type(endTime, "20230322174631");
    await selectEvent.select(harvIdSelect, ["11"]);
    await selectEvent.select(ranchSelect, ["Ranch A"]);
  });

  expect(form).toHaveFormValues({
    harv_ids: "11",
    locations: "Ranch A",
    start_time: "20230322174630",
    end_time: "20230322174631",
    uuid: "fake-uuid",
  });

  const button = screen.getByRole("button", { name: "Submit" });
  expect(button).toBeInTheDocument();

  const table = screen.getByRole("table");
  expect(table).toBeInTheDocument();

  const rows = screen.getAllByRole("row");
  expect(rows.length).toBe(2);
  const lastRow = rows[1];
  expect(getByText(lastRow, "1")).toBeInTheDocument();
  expect(
    getByText(lastRow, "2225cd5a-765a-11ed-9d09-677a59a17003")
  ).toBeInTheDocument();
  expect(getByText(lastRow, "Autodiagnostics Report")).toBeInTheDocument();
});
