import mongoose, { Schema, model } from "mongoose";

const appointmentSlotOverrideSchema = new Schema(
  {
    date: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    time: {
      type: String,
      required: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    status: {
      type: String,
      required: true,
      enum: ["open", "full", "closed", "blocked"],
      default: "open",
      index: true,
    },
    reason: {
      type: String,
      default: "",
      trim: true,
    },
    closureType: {
      type: String,
      enum: ["generic", "day_off", "holiday"],
      default: "generic",
      index: true,
    },
    campaignCode: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

appointmentSlotOverrideSchema.index({ date: 1, time: 1 }, { unique: true });

export const AppointmentSlotOverrideModel =
  mongoose.models.AppointmentSlotOverride ??
  model("AppointmentSlotOverride", appointmentSlotOverrideSchema);
