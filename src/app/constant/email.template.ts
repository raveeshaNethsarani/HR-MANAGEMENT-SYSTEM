const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const wrap = (title: string, body: string) => `
<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px;color:#222">
  <h2 style="margin-top:0">${title}</h2>
  ${body}
  <p style="color:#888;font-size:12px;margin-top:32px">If you did not expect this email, you can ignore it.</p>
</div>`;

const button = (href: string, label: string) =>
  `<p><a href="${esc(href)}" style="background:#2563eb;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;display:inline-block">${esc(label)}</a></p>
   <p style="font-size:12px;color:#666">Or copy this link: <br>${esc(href)}</p>`;

export function welcomeTemplate(fullName: string, email: string, setupLink: string) {
  return {
    to: email,
    subject: "Welcome – set up your account",
    html: wrap(
      `Welcome, ${esc(fullName)}!`,
      `<p>An account has been created for you. Click below to choose your password.
       This link is valid for 48 hours.</p>${button(setupLink, "Set my password")}`
    ),
  };
}

export function resetPasswordTemplate(fullName: string, email: string, resetLink: string) {
  return {
    to: email,
    subject: "Reset your password",
    html: wrap(
      "Password reset",
      `<p>Hi ${esc(fullName)}, we received a request to reset your password.
       This link is valid for 1 hour.</p>${button(resetLink, "Reset password")}`
    ),
  };
}
