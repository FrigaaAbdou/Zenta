import { Router } from "express";

import {
  createAppointmentRequestController,
  getAppointmentFormMetaController,
  getAppointmentSlotsController,
} from "./appointment.controller.js";

export function createAppointmentRouter() {
  const router = Router();

  router.get("/appointment-form-meta", getAppointmentFormMetaController);
  router.get("/appointment-slots", getAppointmentSlotsController);
  router.post("/appointments", createAppointmentRequestController);

  return router;
}
