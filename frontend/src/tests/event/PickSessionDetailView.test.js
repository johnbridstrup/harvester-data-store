import { render, act, screen } from "test-utils/testing-libary-utils";
import PickSessionDetailView from "pages/event/picksessiondetail";

test("should render the pickssession detail view", async () => {
  let routeObject = [
    {
      path: "/picksessions/:pickId",
      element: <PickSessionDetailView />,
    },
  ];
  let routeHistory = ["/picksessions/1"];
  let initialRouteIndex = 0;

  await act(() => {
    render(<PickSessionDetailView />, {
      routeHistory,
      initialRouteIndex,
      routeObject,
    });
  });

  const header = screen.getByText(/HDS PickSession/);
  expect(header).toBeInTheDocument();

  const reportText = screen.getByText("Autodiagnostics Report");
  const eventUUID = screen.getByText("2225cd5a-765a-11ed-9d09-677a59a17003");
  const backLink = screen.getByRole("link", { name: /Back/i });

  expect(reportText).toBeInTheDocument();
  expect(backLink).toBeInTheDocument();
  expect(eventUUID).toBeInTheDocument();
});
