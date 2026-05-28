import mongoose, { Schema, model } from "mongoose";

const heroContentSchema = new Schema(
  {
    eyebrow: { type: String, default: "" },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    primaryCtaLabel: { type: String, default: "" },
    secondaryCtaLabel: { type: String, default: "" },
  },
  { _id: false },
);

const impactContentSchema = new Schema(
  {
    sectionLabel: { type: String, default: "" },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    stats: {
      type: [
        new Schema(
          {
            label: { type: String, default: "" },
            value: { type: String, default: "" },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
  },
  { _id: false },
);

const listCardSectionSchema = new Schema(
  {
    sectionLabel: { type: String, default: "" },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    items: {
      type: [
        new Schema(
          {
            title: { type: String, default: "" },
            description: { type: String, default: "" },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
  },
  { _id: false },
);

const ctaBannerSchema = new Schema(
  {
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    ctaLabel: { type: String, default: "" },
  },
  { _id: false },
);

const footerContentSchema = new Schema(
  {
    organization: { type: String, default: "" },
    institution: { type: String, default: "" },
    address: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
  },
  { _id: false },
);

const homeSectionSchema = new Schema(
  {
    key: { type: String, default: "" },
    title: { type: String, default: "" },
  },
  { _id: false },
);

const localizedHomeContentSchema = new Schema(
  {
    hero: {
      type: heroContentSchema,
      default: () => ({}),
    },
    impact: {
      type: impactContentSchema,
      default: () => ({}),
    },
    eligibilityPreview: {
      type: listCardSectionSchema,
      default: () => ({}),
    },
    ctaBanner: {
      type: ctaBannerSchema,
      default: () => ({}),
    },
    process: {
      type: listCardSectionSchema,
      default: () => ({}),
    },
    sections: {
      type: [homeSectionSchema],
      default: [],
    },
    support: {
      type: new Schema(
        {
          label: { type: String, default: "" },
          phone: { type: String, default: "" },
        },
        { _id: false },
      ),
      default: () => ({}),
    },
    footer: {
      type: footerContentSchema,
      default: () => ({}),
    },
  },
  { _id: false },
);

const siteContentSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "home",
    },
    localeContent: {
      fr: {
        type: localizedHomeContentSchema,
        default: () => ({}),
      },
      ar: {
        type: localizedHomeContentSchema,
        default: () => ({}),
      },
    },
  },
  {
    timestamps: true,
  },
);

export const SiteContentModel =
  mongoose.models.SiteContent ?? model("SiteContent", siteContentSchema);
