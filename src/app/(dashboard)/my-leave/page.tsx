"use client";

import { useState } from "react";
import { AlertTriangle, Plus } from "lucide-react";
import { Button, Card, Dialog, Field, Input, Progress, Select, StatusBadge, Textarea } from "@/components/ui";
import { DialogActions } from "@/components/ui";
import { leaveRequests, leaveBalances, employees } from "@/data/mock-data";
import { PageHeader } from "@/app/components/PageHeader";
import { LeaveTable } from "@/app/components/LeaveTable";

export default function MyLeavePage() {
  const [dialog, setDialog] = useState(false);
  const myRequests = leaveRequests.filter((r) => ["Olivia Martin", "Ava Rodriguez"].includes(r.employee));

  return (
    <>
      <PageHeader
        title="My leave"
        description="Track your balances and time-off requests."
        actions={<Button onClick={() => setDialog(true)}><Plus size={16} />Request leave</Button>}
      />
      <div className="balance-grid">
        {leaveBalances.map((b) => (
          <Card className="balance-card" key={b.name}>
            <div className="balance-head">
              <div className="card-title">{b.name}</div>
              <span className="badge badge-outline">{b.remaining} days left</span>
            </div>
            <div className="balance-number">{b.remaining}<span> / {b.allocated} days</span></div>
            <Progress value={(b.used / b.allocated) * 100} />
            <div className="balance-meta">
              <span>Used <strong>{b.used}</strong></span>
              <span>Pending <strong>{b.pending}</strong></span>
              <span>Allocated <strong>{b.allocated}</strong></span>
            </div>
          </Card>
        ))}
      </div>
      <Card className="table-card">
        <div className="card-header">
          <div>
            <div className="card-title">My request history</div>
            <div className="card-description">Your recent and upcoming leave</div>
          </div>
        </div>
        <LeaveTable rows={myRequests} />
      </Card>

      <Dialog open={dialog} onClose={() => setDialog(false)} title="New leave request" description="Submit time off for review.">
        <form className="form-stack" onSubmit={(e) => { e.preventDefault(); setDialog(false); }}>
          <Field label="Leave type">
            <Select><option>Annual leave</option><option>Sick leave</option><option>Personal leave</option></Select>
          </Field>
          <div className="form-grid">
            <Field label="Start date"><Input type="date" /></Field>
            <Field label="End date"><Input type="date" /></Field>
          </div>
          <Field label="Reason" hint="0 / 500">
            <Textarea maxLength={500} placeholder="Add a brief reason for your request" />
          </Field>
          <div className="form-note"><AlertTriangle size={15} />A request cannot span two calendar years.</div>
          <DialogActions onClose={() => setDialog(false)} action="Submit request" />
        </form>
      </Dialog>
    </>
  );
}
