import { Router } from "express";

import { requireAdminAuth } from "../../middlewares/admin-auth.middleware.js";
import { requireAdminRole } from "../../middlewares/admin-role.middleware.js";
import {
  listAdminContentController,
  updateAdminContentController,
} from "./admin-content.controller.js";

export function createAdminContentRouter() {
  const router = Router();

  router.use(requireAdminAuth);

  router.get("/content", (request, response, next) => {
    listAdminContentController(request, response).catch(next);
  });

  router.patch(
    "/content/:id",
    requireAdminRole("manager", "super_admin"),
    (request, response, next) => {
      updateAdminContentController(request as typeof request & { params: { id: string } }, response).catch(next);
    },
  );

  return router;
}
