import {
  getByText,
  render,
  screen,
  act,
} from "test-utils/testing-libary-utils";
import JobSchemaListVIew from "pages/harvjobs/jobschemas/listview";

// mock the @uiw/react-textarea-code-editor library, which fails to run
// SyntaxError: Cannot use import statement outside a module

// Best practices on testing react app follow link
// https://blog.sapegin.me/all/react-testing-1-best-practices/

jest.mock("@uiw/react-textarea-code-editor", () => ({
  __esModule: true,
  default: jest.fn(() => <div>React Textarea code editor</div>),
}));

test("should render jobschema list view", async () => {
  let routeObject = [
    {
      path: "/jobschemas",
      element: <JobSchemaListVIew />,
    },
  ];
  let routeHistory = ["/jobschemas"];

  await act(() => {
    render(<JobSchemaListVIew />, { routeHistory, routeObject });
  });

  const header = screen.getByText(/HDS Job Schemas/i);
  expect(header).toBeInTheDocument();

  const backLink = screen.getByRole("link", { name: /Back/i });
  expect(backLink).toBeInTheDocument();

  const table = screen.getByRole("table");
  expect(table).toBeInTheDocument();

  const rows = screen.getAllByRole("row");
  expect(rows.length).toBe(2);

  const lastRow = rows[1];
  expect(getByText(lastRow, "1")).toBeInTheDocument();
  expect(getByText(lastRow, "1.0")).toBeInTheDocument();
  expect(getByText(lastRow, "Test schema")).toBeInTheDocument();
  expect(getByText(lastRow, "test")).toBeInTheDocument();
});
