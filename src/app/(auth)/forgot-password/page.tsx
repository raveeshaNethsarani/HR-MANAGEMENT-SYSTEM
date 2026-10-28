"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, LockKeyhole, Users } from "lucide-react";
import { Button, Card, Field, Input } from "@/components/ui";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await api.auth.forgotPassword(email).catch(() => {});
    setSent(true);
  }

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <div className="brand-mark"><Users size={17} /></div>
        <span>PeopleOS</span>
      </div>
      <Card className="auth-card">
        <div className="auth-heading">
          <div className="auth-icon"><LockKeyhole size={20} /></div>
          <div className="auth-title">Forgot password?</div>
          <div className="muted">Enter your email and we'll send you a reset link.</div>
        </div>
        {sent ? (
          <div className="success-state">
            <div className="success-icon"><Check size={20} /></div>
            <div className="auth-title">Check your inbox</div>
            <div className="muted">If the email exists, a link was sent.</div>
            <Button onClick={() => router.push("/login")}>Back to sign in</Button>
          </div>
        ) : (
          <form className="form-stack" onSubmit={submit}>
            <Field label="Email">
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
            </Field>
            <Button type="submit">Send reset link</Button>
            <Button type="button" variant="ghost" onClick={() => router.push("/login")}>
              <ChevronLeft size={16} /> Back to sign in
            </Button>
          </form>
        )}
      </Card>
      <div className="auth-footer">Secure workforce management for modern teams</div>
    </div>
  );
}
