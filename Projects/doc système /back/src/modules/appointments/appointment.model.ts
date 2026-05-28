import mongoose, { Schema, Types, model } from "mongoose";

const appointmentRequestSchema = new Schema(
  {
    donorId: {
      type: Types.ObjectId,
      ref: "Donor",
      required: true,
      index: true,
    },
    campaignCode: {
      type: String,
      default: null,
      trim: true,
    },
    appointmentDate: {
      type: String,
      required: true,
      trim: true,
    },
    appointmentTime: {
      type: String,
      required: true,
      trim: true,
    },
    donationType: {
      type: String,
      required: true,
      trim: true,
    },
    isExistingDonor: {
      type: Boolean,
      required: true,
    },
    lastDonationDate: {
      type: Date,
      default: null,
    },
    eligibilityChecklist: {
      ageConfirmed: { type: Boolean, required: true },
      weightConfirmed: { type: Boolean, required: true },
      healthyConfirmed: { type: Boolean, required: true },
      noContraIndicationConfirmed: { type: Boolean, required: true },
    },
    remarks: {
      type: String,
      default: "",
      trim: true,
    },
    locale: {
      type: String,
      required: true,
      enum: ["fr", "ar"],
    },
    status: {
      type: String,
      required: true,
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

appointmentRequestSchema.index({ appointmentDate: 1, appointmentTime: 1, status: 1 });

export const AppointmentRequestModel =
  mongoose.models.AppointmentRequest ?? model("AppointmentRequest", appointmentRequestSchema);
