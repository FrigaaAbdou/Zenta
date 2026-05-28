import { Router } from "express";

import { getHomeContentController } from "./content.controller.js";

export function createContentRouter() {
  const router = Router();

  router.get("/home-content", getHomeContentController);

  return router;
}
