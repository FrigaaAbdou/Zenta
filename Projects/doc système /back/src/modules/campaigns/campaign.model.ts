import mongoose, { Schema, model } from "mongoose";

const localizedCampaignContentSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    ctaLabel: { type: String, required: true },
  },
  { _id: false },
);

const donationCampaignSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      required: true,
      default: "draft",
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: Number,
      default: 0,
    },
    badgeLabel: {
      type: String,
      default: "",
    },
    theme: {
      type: String,
      default: "default",
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    localeContent: {
      fr: {
        type: localizedCampaignContentSchema,
        required: true,
      },
      ar: {
        type: localizedCampaignContentSchema,
        required: false,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  },
);

donationCampaignSchema.index({
  isPublished: 1,
  isActive: 1,
  priority: -1,
  startDate: -1,
  endDate: 1,
});

export const DonationCampaignModel =
  mongoose.models.DonationCampaign ?? model("DonationCampaign", donationCampaignSchema);
