import { Router } from "express";

import { requireAdminAuth } from "../../middlewares/admin-auth.middleware.js";
import { requireAdminRole } from "../../middlewares/admin-role.middleware.js";
import { ADMIN_ROLES } from "../admin-auth/admin-user.model.js";
import {
  getAdminAppointmentByIdController,
  listAdminAppointmentsController,
  updateAdminAppointmentStatusController,
} from "./admin-appointments.controller.js";

export function createAdminAppointmentsRouter() {
  const router = Router();

  router.use(requireAdminAuth, requireAdminRole(...ADMIN_ROLES));

  router.get("/appointments", (request, response, next) => {
    listAdminAppointmentsController(request, response).catch(next);
  });

  router.get("/appointments/:id", (request, response, next) => {
    getAdminAppointmentByIdController(request, response).catch(next);
  });

  router.patch("/appointments/:id/status", (request, response, next) => {
    updateAdminAppointmentStatusController(request, response).catch(next);
  });

  return router;
}
