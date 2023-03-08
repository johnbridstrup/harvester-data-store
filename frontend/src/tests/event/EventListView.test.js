import {
  render,
  act,
  screen,
  getByText,
} from "test-utils/testing-libary-utils";
import userEvent from "@testing-library/user-event";

import EventListView from "pages/event/eventlist";

test("should render the events list view", async () => {
  const user = userEvent.setup();
  let routeObject = [
    {
      path: "/events",
      element: <EventListView />,
    },
  ];
  let routeHistory = ["/events"];

  await act(() => {
    render(<EventListView />, { routeHistory, routeObject });
  });

  const header = screen.getByText("HDS Events");
  expect(header).toBeInTheDocument();

  const uuidInput = screen.getByRole("textbox", { name: /UUID/i });
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
  expect(getByText(lastRow, "Error Report")).toBeInTheDocument();
  expect(
    getByText(lastRow, "77f6a03c-24c9-11ed-bb17-f9799c718175")
  ).toBeInTheDocument();
});
