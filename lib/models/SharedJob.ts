import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

export const SHARE_STATUSES = ["pending", "imported", "dismissed"] as const;
export type ShareStatus = (typeof SHARE_STATUSES)[number];

const sharedJobSchema = new Schema(
  {
    fromUserId: { type: String, required: true, index: true },
    fromUsername: { type: String, required: true },
    toUserId: { type: String, required: true, index: true },
    toUsername: { type: String, required: true },
    company: { type: String, required: true },
    role: { type: String, required: true },
    jobPostingUrl: { type: String, required: true },
    note: { type: String },
    // Kept (not deleted) once acted on, so senders can see the outcome of
    // jobs they've shared and recipients get suggestions of who they've
    // shared with before.
    status: {
      type: String,
      enum: SHARE_STATUSES,
      default: "pending",
    },
    // Set when status becomes "imported" — lets the sender see how the
    // resulting application has actually progressed (e.g. "Applied").
    resultingApplicationId: { type: String },
  },
  { timestamps: true, versionKey: false }
);

export type SharedJobDocument = InferSchemaType<typeof sharedJobSchema>;

const SharedJob: Model<SharedJobDocument> =
  models.SharedJob || model<SharedJobDocument>("SharedJob", sharedJobSchema);

export default SharedJob;
