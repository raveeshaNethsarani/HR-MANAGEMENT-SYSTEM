import { Schema, models, model, Types } from "mongoose";
import "./organization.model";

const designationSchema = new Schema(
  {
    organization: { type: Types.ObjectId, ref: "Organization", required: true },
    designation_id: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  { timestamps: true }
);

designationSchema.index({ organization: 1, designation_id: 1 }, { unique: true });

export const Designation = models.Designation || model("Designation", designationSchema);
