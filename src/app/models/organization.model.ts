import { Schema, models, model } from "mongoose";

const organizationSchema = new Schema(
  {
    organization_id: { type: String, trim: true, index: { unique: true, sparse: true } },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  { timestamps: true }
);

// NOTE: the registered model name must match the key used in `models.<Name>`,
// otherwise hot-reload throws OverwriteModelError.
export const Organization = models.Organization || model("Organization", organizationSchema);
