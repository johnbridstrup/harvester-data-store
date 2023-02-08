import { render, act, screen } from "test-utils/testing-libary-utils";
import S3FileDetailView from "pages/s3files/detailview";

test("should render the detail view", async () => {
  let routeObject = [
    {
      path: "/s3files/:s3fileId",
      element: <S3FileDetailView />,
    },
  ];
  let routeHistory = ["/s3files/1"];
  let initialRouteIndex = 0;

  await act(() => {
    render(<S3FileDetailView />, {
      routeHistory,
      initialRouteIndex,
      routeObject,
    });
  });

  const fileNames = await screen.findAllByText("fake");
  const fileName = fileNames[0];

  const eventUUID = screen.getByRole("link", {
    name: "77f6a03c-24c9-11ed-bb17-f9799c718175",
  });
  const backLink = screen.getByRole("link", { name: /Back/i });
  const downloadText = screen.getByText("Download");

  expect(fileName).toBeInTheDocument();
  expect(backLink).toBeInTheDocument();
  expect(downloadText).toBeInTheDocument();
  expect(eventUUID).toBeInTheDocument();
});
