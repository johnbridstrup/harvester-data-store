import { act } from "react-dom/test-utils";
import { render, screen } from "test-utils/testing-libary-utils";
import MigrationDetail from "components/migration/MigrationDetail";

test("should render the migrationlog detail component", async () => {
  await act(() => {
    render(<MigrationDetail />);
  });

  const detailComponent = await screen.getByTestId("detailComponent");
  expect(detailComponent).toBeInTheDocument();
});
