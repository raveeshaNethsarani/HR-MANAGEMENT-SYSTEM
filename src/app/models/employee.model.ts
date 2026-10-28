import { Schema, models, model, Types } from "mongoose";
import "./organization.model";
import "./designations.model";
import "./role.model";
import { EMPLOYMENT_STATUSES } from "../../app/constant/enums";

const employeeSchema = new Schema(
  {
    organization: { type: Types.ObjectId, ref: "Organization", required: true, index: true },
    designation: { type: Types.ObjectId, ref: "Designation", required: true },
    role: { type: Types.ObjectId, ref: "Role", required: true },

    employee_id: { type: String, required: true, trim: true },

    first_name: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
    last_name: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email address"],
    },

    // bcrypt hash only – never returned by queries unless explicitly selected
    hash_password: { type: String, required: true, minlength: 20, select: false },
    password_changed_at: { type: Date },

    // password setup / reset (sha256 of the emailed token)
    reset_token_hash: { type: String, select: false },
    reset_token_expires: { type: Date, select: false },

    phone: { type: String, trim: true, match: [/^\+?[0-9]{7,15}$/, "Invalid phone number"] },
    date_of_birth: { type: Date },
    join_date: { type: Date, default: Date.now },

    employment_status: { type: String, enum: EMPLOYMENT_STATUSES, default: "Active", index: true },

    address: { type: String, trim: true, maxlength: 200 },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: any) {
        delete ret.hash_password;
        delete ret.reset_token_hash;
        delete ret.reset_token_expires;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// multi-tenant uniqueness
employeeSchema.index({ organization: 1, email: 1 }, { unique: true });
employeeSchema.index({ organization: 1, employee_id: 1 }, { unique: true });
employeeSchema.index({ organization: 1, role: 1 });
employeeSchema.index({ organization: 1, designation: 1 });
employeeSchema.index({ reset_token_hash: 1 }, { sparse: true });

export const Employee = models.Employee || model("Employee", employeeSchema);
