import { render } from "@testing-library/react";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import NotFound from "pages/404";
import store from "../app/store";

const renderWithProvider = (ui, options) => {
  const routes = [
    {
      path: "*",
      element: <NotFound />,
    },
  ];
  const routeObject = options?.routeObject || routes;

  const router = createMemoryRouter(routeObject, {
    initialEntries: options?.routeHistory,
    initialIndex: options?.initialRouteIndex,
  });

  const Wrapper = ({ children }) => {
    return (
      <Provider store={store}>
        <RouterProvider router={router}>{children}</RouterProvider>
      </Provider>
    );
  };

  const renderObject = render(ui, { wrapper: Wrapper, ...options });
  return { ...renderObject, router };
};

// re-export everything
export * from "@testing-library/react";

// override render method
export { renderWithProvider as render };
