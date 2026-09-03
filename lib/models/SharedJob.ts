import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

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
  },
  { timestamps: true, versionKey: false }
);

export type SharedJobDocument = InferSchemaType<typeof sharedJobSchema>;

const SharedJob: Model<SharedJobDocument> =
  models.SharedJob || model<SharedJobDocument>("SharedJob", sharedJobSchema);

export default SharedJob;
