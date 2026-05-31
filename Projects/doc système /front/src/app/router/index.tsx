import { createBrowserRouter, Outlet } from "react-router-dom";
import { AdminLayout } from "../layouts/AdminLayout";
import {
  RequireAdminAuth,
  RequireAdminGuest,
} from "../../features/admin-auth/AdminAuthGuards";
import { AdminAppointmentDetailPage } from "../../pages/admin/appointments/AdminAppointmentDetailPage";
import { AdminAppointmentsListPage } from "../../pages/admin/appointments/AdminAppointmentsListPage";
import { AdminCampaignsPage } from "../../pages/admin/campaigns/AdminCampaignsPage";
import { AdminCalendarPage } from "../../pages/admin/calendar/AdminCalendarPage";
import { AdminContentPage } from "../../pages/admin/content/AdminContentPage";
import { AdminDashboardPage } from "../../pages/admin/dashboard/AdminDashboardPage";
import { AdminLoginPage } from "../../pages/admin/login/AdminLoginPage";
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
  {
    element: <RequireAdminGuest />,
    errorElement: <AppErrorPage />,
    children: [
      {
        path: "/admin/login",
        element: <AdminLoginPage />,
      },
    ],
  },
  {
    element: <RequireAdminAuth />,
    errorElement: <AppErrorPage />,
    children: [
      {
        path: "/admin",
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboardPage /> },
          { path: "calendar", element: <AdminCalendarPage /> },
          { path: "appointments", element: <AdminAppointmentsListPage /> },
          { path: "appointments/:id", element: <AdminAppointmentDetailPage /> },
          { path: "campaigns", element: <AdminCampaignsPage /> },
          { path: "content", element: <AdminContentPage /> },
        ],
      },
    ],
  },
]);
