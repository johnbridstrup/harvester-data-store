import { render, screen, act } from "test-utils/testing-libary-utils";
import JobTypeDetailView from "pages/harvjobs/jobtypes/detailview";

test("should render jobtype detail view", async () => {
  let routeObject = [
    {
      path: "/jobtypes/:jobtypeId",
      element: <JobTypeDetailView />,
    },
  ];
  let routeHistory = ["/jobtypes/1"];

  await act(() => {
    render(<JobTypeDetailView />, { routeHistory, routeObject });
  });

  const header = screen.getByText(/HDS JobTypes 1/i);
  expect(header).toBeInTheDocument();

  const backLink = screen.getByRole("link", { name: /Back/i });
  expect(backLink).toBeInTheDocument();

  const container = screen.getByTestId("job-type");
  expect(container).toBeInTheDocument();
});
