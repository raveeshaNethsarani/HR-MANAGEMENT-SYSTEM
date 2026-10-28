import { Schema, model, models, Types } from "mongoose";
import "./organization.model";
import { CANDIDATE_SOURCES, CANDIDATE_STATUSES } from "../../app/constant/enums";

const candidateSchema = new Schema(
  {
    organization: { type: Types.ObjectId, ref: "Organization", required: true },
    candidate_id: { type: String, required: true, trim: true },
    first_name: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
    last_name: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    phone: { type: String, required: true, trim: true, minlength: 8, maxlength: 15 },
    current_position: { type: String, trim: true, maxlength: 100 },
    experience_years: { type: Number, min: 0, max: 50, default: 0 },
    skills: { type: [String], default: [] },
    source: { type: String, enum: CANDIDATE_SOURCES, default: "Other" },
    status: { type: String, enum: CANDIDATE_STATUSES, default: "Applied" },
    notes: { type: String, trim: true, maxlength: 2000 },
  },
  { timestamps: true }
);

candidateSchema.index({ organization: 1, candidate_id: 1 }, { unique: true });
candidateSchema.index({ organization: 1, email: 1 }, { unique: true });
candidateSchema.index({ organization: 1, status: 1 });

export const Candidate = models.Candidate || model("Candidate", candidateSchema);
