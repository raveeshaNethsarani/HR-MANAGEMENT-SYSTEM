import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import { application } from "../../../../app/config/application";
import { handleError } from "../../../../lib/http";
import { parseBody } from "../../../../lib/validate";
import { rateLimit, getClientIp } from "../../../../lib/rate-limit";
import { forgotPasswordSchema } from "../../../../validators/auth.schema";
import { Employee } from "../../../../app/models";
import { createPasswordToken } from "../../../../app/service/auth.service";
import { sendEmail } from "../../../../app/service/email.service";
import { resetPasswordTemplate } from "../../../../app/constant/email.template";
import { ACTIVE_EMPLOYMENT_STATUSES } from "../../../../app/constant/enums";

const GENERIC = { message: "If an account exists for that email, a reset link has been sent." };

export async function POST(req: Request) {
  try {
    const { email, organization_id } = await parseBody(req, forgotPasswordSchema);

    const ip = getClientIp(req);
    rateLimit(`forgot-ip:${ip}`, 20, 60 * 60 * 1000);
    rateLimit(`forgot:${email}`, 3, 60 * 60 * 1000);

    await connectDB();
    const filter: Record<string, any> = { email, employment_status: { $in: ACTIVE_EMPLOYMENT_STATUSES } };
    if (organization_id) filter.organization = organization_id;

    const employees: any[] = await Employee.find(filter).select("first_name last_name email").limit(5).lean();

    await Promise.allSettled(
      employees.map(async (emp) => {
        const token = await createPasswordToken(emp._id, 60 * 60 * 1000); // 1 hour
        const link = `${application.APP_URL}/reset-password?token=${token}`;
        const { to, subject, html } = resetPasswordTemplate(`${emp.first_name} ${emp.last_name}`, emp.email, link);
        await sendEmail({ to, subject, html });
      })
    );

    // identical answer whether or not the account exists (no user enumeration)
    return NextResponse.json(GENERIC);
  } catch (err) {
    return handleError(err);
  }
}
