"use client";

import { useState } from "react";
import { AlertTriangle, CalendarDays, Plus } from "lucide-react";
import { Button, Card, Dialog, Field, Input, Select, Textarea } from "@/components/ui";
import { DialogActions } from "@/components/ui";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { leaveRequests, employees } from "@/data/mock-data";
import { PageHeader } from "@/app/components/PageHeader";
import { LeaveTable } from "@/app/components/LeaveTable";
import { DataTableFooter, Toolbar } from "@/app/components/TableUtils";
import { Badge } from "@/components/ui";

function EmptyState({ onAction }: { onAction: () => void }) {
  return (
    <div className="empty-state">
      <div className="state-icon"><CalendarDays size={24} /></div>
      <strong>No leave requests</strong>
      <span>There are no requests matching these filters.</span>
      <Button variant="outline" size="sm" onClick={onAction}>Clear filters</Button>
    </div>
  );
}

export default function LeaveRequestsPage() {
  const [tab, setTab] = useState("Pending");
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState(false);

  const rows = leaveRequests.filter(
    (r) => (tab === "All" || r.status === tab) && r.reason.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <PageHeader
        title="Leave requests"
        description="Review and manage time-off across your organization."
        actions={<Button onClick={() => setDialog(true)}><Plus size={16} />New request</Button>}
      />
      <Card className="table-card">
        <Tabs value={tab} onValueChange={setTab} className="border-b px-4 pt-3">
          <TabsList variant="line">
            {["Pending", "Approved", "Rejected", "Cancelled", "All"].map((item) => (
              <TabsTrigger value={item} key={item}>
                {item}{item === "Pending" && <Badge variant="muted">3</Badge>}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Toolbar search={search} setSearch={setSearch}>
          <Select>
            <option>All employees</option>
            {employees.slice(0, 4).map((e) => <option key={e.id}>{e.name}</option>)}
          </Select>
          <Input type="date" className="date-input" />
        </Toolbar>
        {rows.length ? (
          <LeaveTable rows={rows} actions />
        ) : (
          <EmptyState onAction={() => { setTab("All"); setSearch(""); }} />
        )}
        <DataTableFooter count={rows.length} total={leaveRequests.length} />
      </Card>

      <Dialog open={dialog} onClose={() => setDialog(false)} title="New leave request" description="Submit time off for review.">
        <form className="form-stack" onSubmit={(e) => { e.preventDefault(); setDialog(false); }}>
          <Field label="Employee" hint="Optional">
            <Select><option>Myself</option>{employees.map((e) => <option key={e.id}>{e.name}</option>)}</Select>
          </Field>
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
