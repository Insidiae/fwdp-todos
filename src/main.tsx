import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import RootRoute from "./routes/index.tsx";

import "./reset.css";
import "./styles.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootRoute />,
    loader: RootRoute.loader,
    action: RootRoute.action,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
