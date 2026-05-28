import { createBrowserRouter, Outlet } from "react-router-dom";
import { AppointmentPage } from "../../pages/appointment/AppointmentPage";
import { AppErrorPage } from "../../pages/error/AppErrorPage";
import { HomePage } from "../../pages/home/HomePage";
import { NotFoundPage } from "../../pages/not-found/NotFoundPage";

function RouterShell() {
  return <Outlet />;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RouterShell />,
    errorElement: <AppErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "appointment", element: <AppointmentPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
