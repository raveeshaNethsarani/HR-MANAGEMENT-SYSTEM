import { model, models, Schema, Types } from "mongoose";
import "./employee.model";
import "./leaveType.model";

const leaveBalanceSchema = new Schema(
  {
    employee_id: { type: Types.ObjectId, ref: "Employee", required: true },
    leave_type_id: { type: Types.ObjectId, ref: "LeaveType", required: true },
    year: { type: Number, required: true },
    allocated_days: { type: Number, required: true, default: 0 },
    /** days of APPROVED leave */
    used_days: { type: Number, default: 0 },
    /** days reserved by PENDING requests (so several pending requests can't exceed the balance) */
    pending_days: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// remaining is always derived – never stored, so it can't go out of sync
leaveBalanceSchema.virtual("remaining_days").get(function (this: any) {
  return (this.allocated_days ?? 0) - (this.used_days ?? 0) - (this.pending_days ?? 0);
});

leaveBalanceSchema.index({ employee_id: 1, leave_type_id: 1, year: 1 }, { unique: true });

export const LeaveBalance = models.LeaveBalance || model("LeaveBalance", leaveBalanceSchema);
