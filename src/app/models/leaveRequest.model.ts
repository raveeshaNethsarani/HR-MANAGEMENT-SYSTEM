import { Schema, model, models, Types } from "mongoose";
import "./organization.model";
import "./employee.model";
import "./leaveType.model";
import { LEAVE_STATUSES } from "../../app/constant/enums";

const leaveRequestSchema = new Schema(
  {
    organization: { type: Types.ObjectId, ref: "Organization", required: true, index: true },
    employee: { type: Types.ObjectId, ref: "Employee", required: true },
    leave_type: { type: Types.ObjectId, ref: "LeaveType", required: true },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    total_days: { type: Number, required: true, min: 0.5 },
    reason: { type: String, default: "", maxlength: 500 },
    status: { type: String, enum: LEAVE_STATUSES, default: "pending" },
    approver: { type: Types.ObjectId, ref: "Employee" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

leaveRequestSchema.index({ employee: 1, status: 1, start_date: 1, end_date: 1 });
leaveRequestSchema.index({ organization: 1, status: 1, created_at: -1 });

export const LeaveRequest = models.LeaveRequest || model("LeaveRequest", leaveRequestSchema);
