"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ChevronLeft, LockKeyhole, Users } from "lucide-react";
import { Avatar, Badge, Button, Card, Field, Input } from "@/components/ui";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orgId, setOrgId] = useState("");
  const [needsOrg, setNeedsOrg] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.auth.login(email, password, needsOrg ? orgId : undefined);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid credentials");
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
          <div className="auth-title">Welcome back</div>
          <div className="muted">Enter your details to sign in to your workspace.</div>
        </div>
        <form className="form-stack" onSubmit={submit}>
          {error && (
            <div className="alert">
              <AlertTriangle size={16} /><span>{error}</span>
            </div>
          )}
          <Field label="Email">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
          </Field>
          <Field label="Password">
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <div className="field-link" onClick={() => router.push("/forgot-password")}>Forgot password?</div>
          </Field>
          {needsOrg && (
            <Field label="Organization ID" hint="Required for this email">
              <Input value={orgId} onChange={(e) => setOrgId(e.target.value)} placeholder="ORG-001" />
            </Field>
          )}
          <Button type="submit" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</Button>
          <Button type="button" variant="ghost" className="demo-trigger" onClick={() => setNeedsOrg((v) => !v)}>
            Preview multi-organization login
          </Button>
        </form>
      </Card>
      <div className="auth-footer">Secure workforce management for modern teams</div>
    </div>
  );
}
