import {
  act,
  getByText,
  render,
  screen,
  waitFor,
} from "test-utils/testing-libary-utils";
import userEvent from "@testing-library/user-event";

import LogSessionListView from "pages/logparser/logsession/listview";

test("should render the logsession list view", async () => {
  const user = userEvent.setup();
  let routeObject = [
    {
      path: "/logsession",
      element: <LogSessionListView />,
    },
  ];
  let routeHistory = ["/logsession"];

  await act(() => {
    render(<LogSessionListView />, { routeHistory, routeObject });
  });
  const banner = await screen.findByRole("banner");
  expect(banner).toBeInTheDocument();

  const dropZone = await screen.findByText(/Drag & Drop your files here/i);
  expect(dropZone).toBeInTheDocument();

  const submitBtn = await screen.queryByRole("button", { name: "Upload" });
  expect(submitBtn).not.toBeInTheDocument();

  const fakeFile = new File(["hello"], "hello.zip", {
    type: "application/zip",
  });

  const inputFile = await screen.findByTestId(/fileDropZone/i);
  expect(inputFile).toBeInTheDocument();

  await act(async () => {
    await waitFor(async () => {
      await user.upload(inputFile, fakeFile);
    });
  });

  expect(inputFile.files).toBeInstanceOf(FileList);

  const logsTable = await screen.findByRole("table");
  expect(logsTable).toBeInTheDocument();

  const rowData = await screen.findAllByRole("row");
  expect(rowData.length).toBe(2);
  const lastRow = rowData[1];
  expect(getByText(lastRow, "1")).toBeInTheDocument();
  expect(getByText(lastRow, "sessclip")).toBeInTheDocument();

  const logLink = await screen.findByRole("link", { name: "View Logs" });
  expect(logLink.href).toBe("http://localhost/logfiles/1");
  expect(logLink).toBeInTheDocument();
});
