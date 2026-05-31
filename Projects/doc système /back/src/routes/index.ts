import { Router } from "express";

import { createAdminAuthRouter } from "../modules/admin-auth/admin-auth.routes.js";
import { createAdminAppointmentsRouter } from "../modules/admin-appointments/admin-appointments.routes.js";
import { createAppointmentRouter } from "../modules/appointments/appointment.routes.js";
import { createAdminCampaignsRouter } from "../modules/admin-campaigns/admin-campaigns.routes.js";
import { createAdminCalendarRouter } from "../modules/admin-calendar/admin-calendar.routes.js";
import { createAdminContentRouter } from "../modules/admin-content/admin-content.routes.js";
import { createCampaignRouter } from "../modules/campaigns/campaign.routes.js";
import { createContentRouter } from "../modules/content/content.routes.js";
import { createFaqRouter } from "../modules/faq/faq.routes.js";

export function createRootRouter() {
  const router = Router();
  const publicRouter = Router();
  const adminRouter = Router();

  router.get("/health", (_request, response) => {
    response.status(200).json({ status: "ok" });
  });

  publicRouter.use(createContentRouter());
  publicRouter.use(createFaqRouter());
  publicRouter.use(createCampaignRouter());
  publicRouter.use(createAppointmentRouter());

  router.use("/api/public", publicRouter);
  adminRouter.use(createAdminAuthRouter());
  adminRouter.use(createAdminAppointmentsRouter());
  adminRouter.use(createAdminCampaignsRouter());
  adminRouter.use(createAdminCalendarRouter());
  adminRouter.use(createAdminContentRouter());
  router.use("/api/admin", adminRouter);

  return router;
}
