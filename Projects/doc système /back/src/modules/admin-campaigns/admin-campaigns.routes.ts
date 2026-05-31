import { Router } from "express";

import { requireAdminAuth } from "../../middlewares/admin-auth.middleware.js";
import { requireAdminRole } from "../../middlewares/admin-role.middleware.js";
import {
  createAdminCampaignController,
  listAdminCampaignsController,
  updateAdminCampaignController,
} from "./admin-campaigns.controller.js";

export function createAdminCampaignsRouter() {
  const router = Router();

  router.use(requireAdminAuth);

  router.get("/campaigns", (request, response, next) => {
    listAdminCampaignsController(request, response).catch(next);
  });

  router.post(
    "/campaigns",
    requireAdminRole("manager", "super_admin"),
    (request, response, next) => {
      createAdminCampaignController(request, response).catch(next);
    },
  );

  router.patch(
    "/campaigns/:id",
    requireAdminRole("manager", "super_admin"),
    (request, response, next) => {
      updateAdminCampaignController(request as typeof request & { params: { id: string } }, response).catch(next);
    },
  );

  return router;
}
