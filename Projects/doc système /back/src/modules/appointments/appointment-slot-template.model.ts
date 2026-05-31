import mongoose, { Schema, model } from "mongoose";

const appointmentSlotTemplateSchema = new Schema(
  {
    daysOfWeek: {
      type: [Number],
      required: true,
      validate: {
        validator(value: number[]) {
          return Array.isArray(value) && value.length > 0;
        },
        message: "Path `daysOfWeek` is required.",
      },
      index: true,
    },
    startTime: {
      type: String,
      required: true,
      trim: true,
    },
    endTime: {
      type: String,
      required: true,
      trim: true,
    },
    intervalMinutes: {
      type: Number,
      required: true,
      enum: [15, 30, 45, 60],
      default: 15,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
    donationTypes: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export const AppointmentSlotTemplateModel =
  mongoose.models.AppointmentSlotTemplate ??
  model("AppointmentSlotTemplate", appointmentSlotTemplateSchema);
