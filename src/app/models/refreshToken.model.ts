import { Schema, model, models, Types } from "mongoose";
import "./employee.model";

/** One row per issued refresh token (rotation + revocation + reuse detection). */
const refreshTokenSchema = new Schema(
  {
    employee: { type: Types.ObjectId, ref: "Employee", required: true, index: true },
    token_hash: { type: String, required: true, unique: true }, // sha256(jti)
    expires_at: { type: Date, required: true },
    revoked_at: { type: Date },
  },
  { timestamps: true }
);

// MongoDB removes expired rows automatically
refreshTokenSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken = models.RefreshToken || model("RefreshToken", refreshTokenSchema);
