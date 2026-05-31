import jwt, { type SignOptions } from "jsonwebtoken";

import { AppError } from "../../lib/errors/app-error.js";
import { getEnv } from "../../config/env.js";
import { AdminUserModel, type AdminRole } from "./admin-user.model.js";
import { verifyAdminPassword } from "./password.js";

type AdminJwtPayload = {
  sub: string;
  email: string;
  role: AdminRole;
};

type AuthenticatedAdmin = {
  id: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
  lastLoginAt: Date | null;
};
export type { AuthenticatedAdmin };

function createUnauthorizedError(message = "Admin authentication is required") {
  return new AppError({
    statusCode: 401,
    code: "UNAUTHORIZED",
    message,
  });
}

function toAuthenticatedAdmin(user: {
  _id: { toString(): string };
  email: string;
  role: AdminRole;
  isActive: boolean;
  lastLoginAt?: Date | null;
}) {
  return {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt ?? null,
  } satisfies AuthenticatedAdmin;
}

export async function loginAdmin(email: string, password: string) {
  const user = await AdminUserModel.findOne({ email }).exec();

  if (!user || !user.isActive) {
    throw createUnauthorizedError("Invalid admin credentials");
  }

  const isPasswordValid = await verifyAdminPassword(password, user.passwordHash);

  if (!isPasswordValid) {
    throw createUnauthorizedError("Invalid admin credentials");
  }

  const now = new Date();
  user.lastLoginAt = now;
  await user.save();

  const { ADMIN_JWT_SECRET, ADMIN_JWT_EXPIRES_IN } = getEnv();
  const token = jwt.sign(
    {
      email: user.email,
      role: user.role,
    },
    ADMIN_JWT_SECRET,
    {
      subject: user._id.toString(),
      expiresIn: ADMIN_JWT_EXPIRES_IN as SignOptions["expiresIn"],
    } satisfies SignOptions,
  );

  return {
    token,
    admin: toAuthenticatedAdmin(user),
    expiresIn: ADMIN_JWT_EXPIRES_IN,
  };
}

export function extractBearerToken(authorizationHeader?: string | null) {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
}

export async function getAuthenticatedAdminFromToken(token: string) {
  const { ADMIN_JWT_SECRET } = getEnv();

  let payload: AdminJwtPayload;

  try {
    payload = jwt.verify(token, ADMIN_JWT_SECRET) as AdminJwtPayload;
  } catch {
    throw createUnauthorizedError("Invalid or expired admin token");
  }

  const userId = payload.sub;

  if (!userId) {
    throw createUnauthorizedError("Invalid or expired admin token");
  }

  const user = await AdminUserModel.findById(userId).exec();

  if (!user || !user.isActive) {
    throw createUnauthorizedError("Admin session is no longer valid");
  }

  return toAuthenticatedAdmin(user);
}
