import { Router } from "express";

import { getFaqController } from "./faq.controller.js";

export function createFaqRouter() {
  const router = Router();

  router.get("/faq", getFaqController);

  return router;
}
