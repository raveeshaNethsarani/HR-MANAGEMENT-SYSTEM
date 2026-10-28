import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "../../../../lib/db";
import { application } from "../../../../app/config/application";
import { ApiError, handleError } from "../../../../lib/http";
import { parseBody } from "../../../../lib/validate";
import { safeEqual } from "../../../../lib/crypto";
import { rateLimit, getClientIp } from "../../../../lib/rate-limit";
import { bootstrapSchema } from "../../../../validators/auth.schema";
import { Organization, Role, Designation, Employee } from "../../../../app/models";

/**
 * POST /api/auth/bootstrap  – creates the FIRST organization + admin. (replaces create-test-user)
 * Header:  x-bootstrap-secret: <BOOTSTRAP_SECRET from env>
 * Works only while the employees collection is empty; afterwards it answers 404.
 */
export async function POST(req: Request) {
  try {
    rateLimit(`bootstrap:${getClientIp(req)}`, 5, 15 * 60 * 1000);

    const secret = application.BOOTSTRAP_SECRET;
    const provided = req.headers.get("x-bootstrap-secret") ?? "";
    if (!secret || !safeEqual(provided, secret)) throw new ApiError(404, "Not found");

    await connectDB();
    if ((await Employee.countDocuments()) > 0) throw new ApiError(404, "Not found");

    const { organization, admin } = await parseBody(req, bootstrapSchema);

    const org = await Organization.create({ ...organization, status: "Active" });
    const role = await Role.create({
      organization: org._id,
      role_id: "ROLE_ADMIN",
      role_name: "Administrator",
      permissions: ["*", "system.admin"],
    });
    const designation = await Designation.create({
      organization: org._id,
      designation_id: "DES_ADMIN",
      title: "Administrator",
    });
    const employee = await Employee.create({
      organization: org._id,
      role: role._id,
      designation: designation._id,
      employee_id: admin.employee_id,
      first_name: admin.first_name,
      last_name: admin.last_name,
      email: admin.email,
      hash_password: await bcrypt.hash(admin.password, 12),
      password_changed_at: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Bootstrap complete. Remove BOOTSTRAP_SECRET from your environment now.",
        organization: String(org._id),
        employee: String(employee._id),
      },
      { status: 201 }
    );
  } catch (err) {
    return handleError(err);
  }
}
