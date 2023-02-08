import {
  render,
  act,
  screen,
  getByText,
  getAllByText,
} from "test-utils/testing-libary-utils";
import userEvent from "@testing-library/user-event";

import S3FileListView from "pages/s3files/listview";

test("should render the s3file list view", async () => {
  const user = userEvent.setup();
  let roles;
  let routeObject = [
    {
      path: "/s3files",
      element: <S3FileListView />,
    },
  ];
  let routeHistory = ["/s3files"];

  await act(() => {
    const component = render(<S3FileListView />, { routeHistory, routeObject });
    roles = component.container;
  });

  const banner = screen.getByRole("banner");
  expect(banner).toBeInTheDocument();

  const nameInput = screen.getByRole("textbox", { name: /Name/i });
  const filetypeInput = screen.getByRole("textbox", { name: /File Type/i });
  expect(nameInput).toBeInTheDocument();
  expect(filetypeInput).toBeInTheDocument();

  await act(async () => {
    await user.clear(nameInput);
    await user.clear(filetypeInput);
    await user.type(nameInput, "fake");
    await user.type(filetypeInput, "fake");
  });

  expect(nameInput).toHaveValue("fake");
  expect(filetypeInput).toHaveValue("fake");

  const button = screen.getByRole("button", { name: "Submit" });
  expect(button).toBeInTheDocument();

  const filesTable = screen.getByRole("table");
  expect(filesTable).toBeInTheDocument();

  const rowData = screen.getAllByRole("row");
  expect(rowData.length).toBe(2);
  const lastRow = rowData[1];
  expect(getByText(lastRow, "1")).toBeInTheDocument();
  expect(getAllByText(lastRow, "fake").length).toBe(2);
});
