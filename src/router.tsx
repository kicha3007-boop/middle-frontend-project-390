import { createBrowserRouter } from "react-router";

import { Layout } from "./components/Layout";
import { BookingPage } from "./pages/BookingPage";
import { LookupPage } from "./pages/LookupPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { SearchPage } from "./pages/SearchPage";
import { routes } from "./routes";

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: routes.home, element: <SearchPage /> },
      { path: routes.booking, element: <BookingPage /> },
      { path: routes.lookup, element: <LookupPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
