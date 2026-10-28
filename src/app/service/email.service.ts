import nodemailer, { type Transporter } from "nodemailer";
import { application } from "@/app/config/application";

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: application.EMAIL_HOST,
      port: application.EMAIL_PORT,
      secure: application.EMAIL_SECURE,
      auth: {
        user: application.EMAIL_USER,
        pass: application.EMAIL_PASSWORD,
      },
    });
  }

  return transporter;
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const info = await getTransporter().sendMail({
    from: `"${application.EMAIL_FROM_NAME}" <${application.EMAIL_FROM}>`,
    to,
    subject,
    html,
  });

  return { success: true, messageId: info.messageId };
}