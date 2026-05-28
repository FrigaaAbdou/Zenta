import { Router } from "express";

import {
  getActiveCampaignsController,
  getCampaignByCodeController,
  getFeaturedCampaignController,
} from "./campaign.controller.js";

export function createCampaignRouter() {
  const router = Router();

  router.get("/campaigns/active", getActiveCampaignsController);
  router.get("/campaigns/featured", getFeaturedCampaignController);
  router.get("/campaigns/:code", getCampaignByCodeController);

  return router;
}
