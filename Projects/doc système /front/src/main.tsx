import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { TooltipProvider } from "./components/ui/tooltip";
import { router } from "./app/router";
import { AdminAuthProvider } from "./features/admin-auth/AdminAuthProvider";
import { LocaleProvider } from "./i18n/locale";
import "./styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <LocaleProvider>
      <AdminAuthProvider>
        <TooltipProvider>
          <RouterProvider router={router} />
        </TooltipProvider>
      </AdminAuthProvider>
    </LocaleProvider>
  </React.StrictMode>,
);
