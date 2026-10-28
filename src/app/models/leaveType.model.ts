import { models, model, Schema, Types } from "mongoose";
import "./organization.model";

const leaveTypeSchema = new Schema(
  {
    leave_type_id: { type: String, required: true, trim: true },
    organization: { type: Types.ObjectId, ref: "Organization", required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    // (sic) field name kept as "anual_allocation" for backward compatibility with existing data / frontend
    anual_allocation: { type: Number, required: true, default: 0, min: 0 },
  },
  { timestamps: true }
);

// unique PER organization (the old global unique index on leave_type_id must be dropped – see scripts/migrate.mjs)
leaveTypeSchema.index({ organization: 1, leave_type_id: 1 }, { unique: true });

export const LeaveType = models.LeaveType || model("LeaveType", leaveTypeSchema);
