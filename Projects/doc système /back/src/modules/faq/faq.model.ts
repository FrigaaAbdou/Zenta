import mongoose, { Schema, model } from "mongoose";

const localizedFaqContentSchema = new Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { _id: false },
);

const faqEntrySchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: String,
      required: true,
      default: "general",
    },
    order: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    localeContent: {
      fr: {
        type: localizedFaqContentSchema,
        required: true,
      },
      ar: {
        type: localizedFaqContentSchema,
        required: false,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  },
);

faqEntrySchema.index({ isPublished: 1, category: 1, order: 1 });

export const FAQEntryModel =
  mongoose.models.FAQEntry ?? model("FAQEntry", faqEntrySchema);
