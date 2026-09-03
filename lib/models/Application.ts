import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { APPLICATION_STATUSES } from "@/lib/applicationStatus";

const applicationSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    company: { type: String, required: true },
    role: { type: String, required: true },
    dateApplied: { type: Date },
    status: {
      type: String,
      enum: APPLICATION_STATUSES,
      default: "Applied",
    },
    resumeVersionLabel: { type: String },
    resumeUrl: { type: String },
    jobPostingUrl: { type: String },
    contact: { type: String },
    followUpDate: { type: Date },
    followUpDone: { type: Boolean, default: false },
    notes: { type: String },
  },
  { timestamps: true, versionKey: false }
);

export type ApplicationDocument = InferSchemaType<typeof applicationSchema>;

const Application: Model<ApplicationDocument> =
  models.Application || model<ApplicationDocument>("Application", applicationSchema);

export default Application;
