import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "../../../lib/db";
import { requireAuth, canGrant } from "../../../lib/auth";
import { ApiError, handleError } from "../../../lib/http";
import { parseBody } from "../../../lib/validate";
import { application } from "../../../app/config/application";
import { Employee, Role, Designation } from "../../../app/models";
import { paginate, parseListParams } from "../../../app/service/pagination.service";
import { employeeCreateSchema } from "../../../validators/employee.schema";
import { generateSecurePassword } from "../../../app/utils/passwordGenerator";
import { sendEmail } from "../../../app/service/email.service";
import { welcomeTemplate } from "../../../app/constant/email.template";
import { initializeBalancesForEmployee } from "../../../app/service/leaveBalance.service";
import { createPasswordToken } from "../../../app/service/auth.service";
import { EMPLOYMENT_STATUSES } from "../../../app/constant/enums";

const POPULATE = [
  { path: "designation", select: "title designation_id" },
  { path: "role", select: "role_name role_id" },
];

/** GET /api/employee – needs `employee.read`. Query: page, limit, q, employment_status, sortBy, order */
export async function GET(req: Request) {
  try {
    const ctx = await requireAuth(req, "employee.read");
    await connectDB();

    const { searchParams } = new URL(req.url);
    const filter: Record<string, any> = { organization: ctx.orgId };
    const status = searchParams.get("employment_status");
    if (status && (EMPLOYMENT_STATUSES as readonly string[]).includes(status)) filter.employment_status = status;

    const result = await paginate(Employee, {
      ...parseListParams(searchParams),
      searchFields: ["first_name", "last_name", "email", "phone", "employee_id"],
      allowedSortFields: ["first_name", "last_name", "join_date", "employee_id"],
      filter,
      populate: POPULATE,
    });
    return NextResponse.json(result);
  } catch (err) {
    return handleError(err);
  }
}

/**
 * POST /api/employee – needs `employee.create`
 * The employee gets a random unusable password and an emailed "set your password" link (valid 48 h).
 */
export async function POST(req: Request) {
  try {
    const ctx = await requireAuth(req, "employee.create");
    const data = await parseBody(req, employeeCreateSchema);

    const [role, designation]: any[] = await Promise.all([
      Role.findOne({ _id: data.role, organization: ctx.orgId, status: "active" }).lean(),
      Designation.findOne({ _id: data.designation, organization: ctx.orgId, status: "Active" }).lean(),
    ]);
    if (!role) throw new ApiError(400, "Invalid role for this organization");
    if (!designation) throw new ApiError(400, "Invalid designation for this organization");
    if (!canGrant(ctx, role.permissions ?? [])) {
      throw new ApiError(403, "You cannot assign a role that has more permissions than you have");
    }

    const created: any = await Employee.create({
      ...data,
      organization: ctx.orgId,
      hash_password: await bcrypt.hash(generateSecurePassword(32), 12), // unusable until the employee sets their own
    });

    try {
      await initializeBalancesForEmployee(created._id, ctx.orgId, new Date().getFullYear());
    } catch (e) {
      console.error("Failed to initialize leave balances:", e);
    }

    let emailSent = false;
    try {
      const token = await createPasswordToken(created._id, 48 * 60 * 60 * 1000);
      const link = `${application.APP_URL}/reset-password?token=${token}`;
      const { to, subject, html } = welcomeTemplate(`${data.first_name} ${data.last_name}`, data.email, link);
      await sendEmail({ to, subject, html });
      emailSent = true;
    } catch (e) {
      console.error("Failed to send welcome email:", e);
    }

    const safe = await Employee.findById(created._id).populate(POPULATE);
    return NextResponse.json(
      {
        success: true,
        message: emailSent
          ? "Employee created. A password setup email has been sent."
          : "Employee created, but the setup email could not be sent. Use 'forgot password' to send a new link.",
        email_sent: emailSent,
        data: safe,
      },
      { status: 201 }
    );
  } catch (err) {
    return handleError(err);
  }
}
