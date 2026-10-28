"use client";

import { useState } from "react";
import { Building2, Check, ShieldCheck, UserCog } from "lucide-react";
import { Button, Card, Field, Input, Select, Textarea } from "@/components/ui";
import { PageHeader } from "@/app/components/PageHeader";

export default function OrganizationPage() {
  const [saved, setSaved] = useState(false);

  return (
    <>
      <PageHeader title="Organization settings" description="Manage your company profile and workspace settings." />
      <div className="settings-layout">
        <div className="settings-nav">
          <div className="settings-nav-item active"><Building2 size={16} />General</div>
          <div className="settings-nav-item"><ShieldCheck size={16} />Security</div>
          <div className="settings-nav-item"><UserCog size={16} />Members</div>
        </div>
        <Card className="settings-card">
          <div className="card-header">
            <div>
              <div className="card-title">Organization profile</div>
              <div className="card-description">This information appears throughout your workspace.</div>
            </div>
          </div>
          <form className="form-stack" onSubmit={(e) => { e.preventDefault(); setSaved(true); setTimeout(() => setSaved(false), 2500); }}>
            <div className="org-logo-row">
              <div className="org-logo">A</div>
              <div>
                <Button variant="outline" size="sm">Change logo</Button>
                <div className="field-help">Square image, up to 2 MB.</div>
              </div>
            </div>
            <Field label="Organization name"><Input defaultValue="Acme, Inc." /></Field>
            <Field label="Organization ID"><Input defaultValue="ORG-001" disabled /></Field>
            <Field label="Description"><Textarea defaultValue="Building tools that help modern teams do their best work." /></Field>
            <Field label="Status">
              <Select defaultValue="Active"><option>Active</option><option>Inactive</option></Select>
            </Field>
            <div className="settings-actions">
              {saved && <span className="saved-message"><Check size={15} />Changes saved</span>}
              <Button type="submit">Save changes</Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}
