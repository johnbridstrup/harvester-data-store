import { act } from "react-dom/test-utils";
import { getByText, render, screen } from "test-utils/testing-libary-utils";
import MigrationDetailView from "pages/migration/detailview";

test("should render the migration log detail view", async () => {
  let routeObject = [
    {
      path: "/migrations/:migrationId",
      element: <MigrationDetailView />,
    },
  ];
  let routeHistory = ["/migrations/1"];

  await act(() => {
    render(<MigrationDetailView />, { routeHistory, routeObject });
  });

  const header = screen.getByText("HDS Migration Log 1");
  expect(header).toBeInTheDocument();

  const detailComponent = screen.getByTestId("detailComponent");
  expect(detailComponent).toBeInTheDocument();
  expect(getByText(detailComponent, "1")).toBeInTheDocument();
  expect(getByText(detailComponent, "success")).toBeInTheDocument();
  expect(getByText(detailComponent, "UNKNOWN")).toBeInTheDocument();
});
