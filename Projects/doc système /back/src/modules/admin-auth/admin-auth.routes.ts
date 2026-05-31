import { Router } from "express";

import { requireAdminAuth } from "../../middlewares/admin-auth.middleware.js";
import {
  getAdminMeController,
  loginAdminController,
  logoutAdminController,
} from "./admin-auth.controller.js";

export function createAdminAuthRouter() {
  const router = Router();

  router.post("/auth/login", (request, response, next) => {
    loginAdminController(request, response).catch(next);
  });

  router.get("/auth/me", requireAdminAuth, (request, response, next) => {
    getAdminMeController(request, response).catch(next);
  });

  router.post("/auth/logout", requireAdminAuth, (request, response, next) => {
    logoutAdminController(request, response).catch(next);
  });

  return router;
}
