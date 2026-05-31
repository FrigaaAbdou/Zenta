import { Router } from "express";

import { requireAdminAuth } from "../../middlewares/admin-auth.middleware.js";
import { requireAdminRole } from "../../middlewares/admin-role.middleware.js";
import {
  closeAdminCalendarDayController,
  createAdminCalendarSlotController,
  getAdminCalendarDayController,
  getAdminCalendarMonthController,
  listAdminCalendarTemplatesController,
  reopenAdminCalendarDayController,
  replaceAdminCalendarTemplatesController,
  updateAdminCalendarSlotController,
} from "./admin-calendar.controller.js";

export function createAdminCalendarRouter() {
  const router = Router();

  router.use(requireAdminAuth);

  router.get("/calendar/month", (request, response, next) => {
    getAdminCalendarMonthController(request, response).catch(next);
  });

  router.get("/calendar/day", (request, response, next) => {
    getAdminCalendarDayController(request, response).catch(next);
  });

  router.get("/calendar/templates", (request, response, next) => {
    listAdminCalendarTemplatesController(request, response).catch(next);
  });

  router.post(
    "/calendar/slots",
    requireAdminRole("manager", "super_admin"),
    (request, response, next) => {
      createAdminCalendarSlotController(request, response).catch(next);
    },
  );

  router.patch(
    "/calendar/slots/:id",
    requireAdminRole("manager", "super_admin"),
    (request, response, next) => {
      updateAdminCalendarSlotController(
        request as typeof request & { params: { id: string } },
        response,
      ).catch(next);
    },
  );

  router.post(
    "/calendar/day/close",
    requireAdminRole("manager", "super_admin"),
    (request, response, next) => {
      closeAdminCalendarDayController(request, response).catch(next);
    },
  );

  router.post(
    "/calendar/day/reopen",
    requireAdminRole("manager", "super_admin"),
    (request, response, next) => {
      reopenAdminCalendarDayController(request, response).catch(next);
    },
  );

  router.put(
    "/calendar/templates",
    requireAdminRole("manager", "super_admin"),
    (request, response, next) => {
      replaceAdminCalendarTemplatesController(request, response).catch(next);
    },
  );

  return router;
}
