import type { AuthenticatedAdmin } from "../modules/admin-auth/admin-auth.service.js";

declare global {
  namespace Express {
    interface Request {
      admin?: AuthenticatedAdmin;
    }
  }
}

export {};
