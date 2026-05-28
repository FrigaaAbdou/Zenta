import { Router } from "express";

import { createAppointmentRouter } from "../modules/appointments/appointment.routes.js";
import { createCampaignRouter } from "../modules/campaigns/campaign.routes.js";
import { createContentRouter } from "../modules/content/content.routes.js";
import { createFaqRouter } from "../modules/faq/faq.routes.js";

export function createRootRouter() {
  const router = Router();
  const publicRouter = Router();

  router.get("/health", (_request, response) => {
    response.status(200).json({ status: "ok" });
  });

  publicRouter.use(createContentRouter());
  publicRouter.use(createFaqRouter());
  publicRouter.use(createCampaignRouter());
  publicRouter.use(createAppointmentRouter());

  router.use("/api/public", publicRouter);

  return router;
}
