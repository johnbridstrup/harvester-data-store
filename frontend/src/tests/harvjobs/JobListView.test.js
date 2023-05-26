import userEvent from "@testing-library/user-event";
import selectEvent from "react-select-event";
import {
  getByText,
  render,
  screen,
  act,
} from "test-utils/testing-libary-utils";
import JobListView from "pages/harvjobs/jobs/listview";

jest.setTimeout(10000);

test("should render jobs list view", async () => {
  const user = userEvent.setup();
  let routeObject = [
    {
      path: "/jobs",
      element: <JobListView />,
    },
  ];
  let routeHistory = ["/jobs"];

  await act(() => {
    render(<JobListView />, { routeHistory, routeObject });
  });

  const header = screen.getByText(/HDS Jobs/i);
  expect(header).toBeInTheDocument();

  const form = screen.getByTestId("query-form");
  expect(form).toHaveFormValues({
    uuid: "",
    harv_id: "",
    jobstatus: "",
  });

  const combobox = screen.getAllByRole("combobox");
  expect(combobox).toHaveLength(2);

  const harvIdSelect = screen.getByLabelText("Harv ID");
  const statusSelect = screen.getByLabelText("Job Status");
  const uuid = screen.getByLabelText("UUID");

  await act(async () => {
    await user.click(harvIdSelect);
    await user.click(statusSelect);
  });

  await act(async () => {
    await selectEvent.select(harvIdSelect, ["11"]);
    await selectEvent.select(statusSelect, ["Success"]);
    await user.type(uuid, "fake-uuid");
  });
  expect(form).toHaveFormValues({
    uuid: "fake-uuid",
    harv_id: "11",
    jobstatus: "Success",
  });

  const table = await screen.findByRole("table");
  expect(table).toBeInTheDocument();

  const rows = await screen.findAllByRole("row");
  expect(rows.length).toBe(2);
  const lastRow = rows[1];
  expect(getByText(lastRow, "master, robot01")).toBeInTheDocument();
  expect(getByText(lastRow, "test")).toBeInTheDocument();
  expect(getByText(lastRow, "6000")).toBeInTheDocument();
  expect(getByText(lastRow, "Success")).toBeInTheDocument();
});
