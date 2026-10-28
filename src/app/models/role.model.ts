import { Schema, models, model, Types } from "mongoose";
import "./organization.model";

const roleSchema = new Schema(
  {
    organization: { type: Types.ObjectId, ref: "Organization", required: true },
    role_id: { type: String, required: true, trim: true }, // e.g. ROLE_HR
    role_name: { type: String, required: true, trim: true }, // e.g. HR Manager
    description: { type: String, trim: true },
    /** see src/app/constant/permissions.ts */
    permissions: { type: [String], default: [] },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

// role_id is unique PER organization
roleSchema.index({ organization: 1, role_id: 1 }, { unique: true });

export const Role = models.Role || model("Role", roleSchema);
