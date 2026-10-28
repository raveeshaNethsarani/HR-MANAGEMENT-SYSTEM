"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, LockKeyhole, Users } from "lucide-react";
import { Button, Card, Field, Input } from "@/components/ui";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const rules = [
    ["At least 10 characters", password.length >= 10],
    ["One lowercase letter", /[a-z]/.test(password)],
    ["One uppercase letter", /[A-Z]/.test(password)],
    ["One number", /\d/.test(password)],
  ] as const;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) return;
    setLoading(true);
    try {
      await api.auth.resetPassword(token, password);
      router.push("/login");
    } finally {
      setLoading(false);
    }
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
          <div className="auth-title">Set a new password</div>
          <div className="muted">Choose a strong password for your account.</div>
        </div>
        <form className="form-stack" onSubmit={submit}>
          <Field label="New password">
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter new password" />
          </Field>
          <div className="password-rules">
            {rules.map(([label, valid]) => (
              <div className={cn("rule", valid && "rule-valid")} key={label}>
                {valid ? <Check size={14} /> : <div className="rule-dot" />}
                {label}
              </div>
            ))}
          </div>
          <Field label="Confirm password">
            <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat new password" />
          </Field>
          <Button type="submit" disabled={!rules.every((r) => r[1]) || password !== confirm || loading}>
            {loading ? "Saving..." : "Set password"}
          </Button>
        </form>
      </Card>
      <div className="auth-footer">Secure workforce management for modern teams</div>
    </div>
  );
}
