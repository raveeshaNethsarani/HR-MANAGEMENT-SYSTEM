"use client";

import { useState } from "react";
import { ArrowDownUp, Download, KeyRound, Plus, SlidersHorizontal } from "lucide-react";
import { Avatar, Badge, Button, Card, Dialog, Field, Input, Select, StatusBadge, Textarea } from "@/components/ui";
import { DialogActions } from "@/components/ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { employees, designations, roles } from "@/data/mock-data";
import { PageHeader } from "@/app/components/PageHeader";
import { DataTableFooter, Toolbar } from "@/app/components/TableUtils";
import { RowActions } from "@/app/components/RowActions";
import { AlertTriangle } from "lucide-react";

function Th({ children }: { children?: React.ReactNode }) {
  return <TableHead><span className="th-content">{children}{children && <ArrowDownUp size={12} />}</span></TableHead>;
}

export default function EmployeesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [dialog, setDialog] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const rows = employees.filter(
    (e) => (e.name + e.email + e.id).toLowerCase().includes(search.toLowerCase()) &&
      (status === "All statuses" || e.status === status)
  );

  return (
    <>
      <PageHeader
        title="Employees"
        description="Manage people, roles, and employment information."
        actions={<Button onClick={() => setDialog(true)}><Plus size={16} />Add employee</Button>}
      />
      <Card className="table-card">
        <Toolbar search={search} setSearch={setSearch} action={<Button variant="outline"><Download size={16} />Export</Button>}>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option>All statuses</option>
            {["Active", "Inactive", "Terminated", "Resigned", "On Leave"].map((s) => <option key={s}>{s}</option>)}
          </Select>
          <Button variant="outline"><SlidersHorizontal size={16} />More filters</Button>
        </Toolbar>
        <Table>
          <TableHeader>
            <TableRow>
              <Th>Employee ID</Th><Th>Name</Th><Th>Email</Th><Th>Phone</Th>
              <Th>Designation</Th><Th>Role</Th><Th>Join date</Th><Th>Status</Th>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((emp) => (
              <TableRow key={emp.id}>
                <TableCell className="mono">{emp.id}</TableCell>
                <TableCell>
                  <div className="person-cell">
                    <Avatar initials={emp.name.split(" ").map((n) => n[0]).join("")} size="sm" />
                    <strong>{emp.name}</strong>
                  </div>
                </TableCell>
                <TableCell>{emp.email}</TableCell>
                <TableCell className="muted-cell">{emp.phone}</TableCell>
                <TableCell>{emp.designation}</TableCell>
                <TableCell>{emp.role}</TableCell>
                <TableCell>{emp.joinDate}</TableCell>
                <TableCell><StatusBadge status={emp.status} /></TableCell>
                <TableCell><RowActions onDelete={() => setConfirm(true)} deleteLabel="Terminate" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <DataTableFooter count={rows.length} total={128} />
      </Card>

      <Dialog open={dialog} onClose={() => setDialog(false)} title="Add employee" description="Create a new employee profile. They will receive an invitation email." wide>
        <form onSubmit={(e) => { e.preventDefault(); setDialog(false); }}>
          <div className="form-grid">
            <Field label="Employee ID"><Input placeholder="EMP-008" /></Field>
            <Field label="Employment status">
              <Select><option>Active</option><option>Inactive</option><option>On Leave</option></Select>
            </Field>
            <Field label="First name"><Input placeholder="First name" /></Field>
            <Field label="Last name"><Input placeholder="Last name" /></Field>
            <Field label="Email"><Input type="email" placeholder="name@company.com" /></Field>
            <Field label="Phone"><Input placeholder="+1 555 000 0000" /></Field>
            <Field label="Designation">
              <Select><option>Select designation</option>{designations.map((d) => <option key={d.id}>{d.title}</option>)}</Select>
            </Field>
            <Field label="Role">
              <Select><option>Select role</option>{roles.map((r) => <option key={r.id}>{r.name}</option>)}</Select>
            </Field>
            <Field label="Date of birth"><Input type="date" /></Field>
            <Field label="Join date"><Input type="date" /></Field>
            <div className="span-2"><Field label="Address"><Textarea placeholder="Street, city, state, postal code" /></Field></div>
          </div>
          <div className="helper-box">
            <KeyRound size={16} />
            <div><strong>No password needed</strong><span>A password setup email will be sent to the employee.</span></div>
          </div>
          <DialogActions onClose={() => setDialog(false)} action="Add employee" />
        </form>
      </Dialog>

      <AlertDialog open={confirm} onOpenChange={(next) => !next && setConfirm(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Terminate employee?</AlertDialogTitle>
            <AlertDialogDescription>This will immediately revoke their access. Their historical records will be kept.</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="confirm-callout"><AlertTriangle size={18} /><span>Please confirm that you want to continue.</span></div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => setConfirm(false)}>Terminate employee</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
