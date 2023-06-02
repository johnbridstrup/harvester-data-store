import { render, screen, act } from "test-utils/testing-libary-utils";
import JobSchemaDetailView from "pages/harvjobs/jobschemas/detailview";

test("should render jobschema list view", async () => {
  let routeObject = [
    {
      path: "/jobschemas/:jobschemaId",
      element: <JobSchemaDetailView />,
    },
  ];
  let routeHistory = ["/jobschemas/1"];

  await act(() => {
    render(<JobSchemaDetailView />, { routeHistory, routeObject });
  });

  const header = screen.getByText(/HDS Job Schemas 1/i);
  expect(header).toBeInTheDocument();

  const backLink = screen.getByRole("link", { name: /Back/i });
  expect(backLink).toBeInTheDocument();

  const container = screen.getByTestId("job-schema");
  expect(container).toBeInTheDocument();
});
