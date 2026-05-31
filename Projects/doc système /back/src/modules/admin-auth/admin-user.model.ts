import mongoose, { Schema, model } from "mongoose";

export const ADMIN_ROLES = ["super_admin", "manager", "operator"] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

const adminUserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ADMIN_ROLES,
      required: true,
      default: "operator",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export const AdminUserModel =
  mongoose.models.AdminUser ?? model("AdminUser", adminUserSchema);
