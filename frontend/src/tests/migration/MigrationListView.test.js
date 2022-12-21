import { act } from "react-dom/test-utils";
import { render, screen } from "test-utils/testing-libary-utils";
import userEvent from "@testing-library/user-event";
import MigrationListView from "pages/migration/listview";

test("should render migrationlog list view", async () => {
  const user = userEvent.setup();

  await act(() => {
    render(<MigrationListView />);
  });

  const banner = await screen.findByRole("banner");
  expect(banner).toBeInTheDocument();

  const queueBtn = screen.getByRole("button", { name: "Queue Migrations" });
  expect(queueBtn).toBeInTheDocument();

  const queueModal = screen.getByTestId("confirmModal");
  expect(queueModal).toBeInTheDocument();
  expect(queueModal).toHaveStyle({
    display: "none",
  });

  await user.click(queueBtn);

  const logsTable = await screen.findByRole("table");
  expect(logsTable).toBeInTheDocument();

  const link = await screen.findByRole("link", { name: "success" });
  expect(link).toBeInTheDocument();
  expect(link.href).toBe("http://localhost/migrations/1");
});
