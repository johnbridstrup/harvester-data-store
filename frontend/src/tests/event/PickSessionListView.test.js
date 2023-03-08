import {
  render,
  act,
  screen,
  getByText,
} from "test-utils/testing-libary-utils";
import userEvent from "@testing-library/user-event";

import PickSessionListView from "pages/event/picksessionlist";

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

  const uuidInput = screen.getByRole("textbox", { name: /PickSession/i });
  expect(uuidInput).toBeInTheDocument();

  await act(async () => {
    await user.clear(uuidInput);
    await user.type(uuidInput, "fake-uuid");
  });

  expect(uuidInput).toHaveValue("fake-uuid");

  const button = screen.getByRole("button", { name: "Submit" });
  expect(button).toBeInTheDocument();

  const filesTable = screen.getByRole("table");
  expect(filesTable).toBeInTheDocument();

  const rowData = screen.getAllByRole("row");
  expect(rowData.length).toBe(2);
  const lastRow = rowData[1];
  expect(getByText(lastRow, "1")).toBeInTheDocument();
  expect(
    getByText(lastRow, "2225cd5a-765a-11ed-9d09-677a59a17003")
  ).toBeInTheDocument();
  expect(getByText(lastRow, "Autodiagnostics Report")).toBeInTheDocument();
});
