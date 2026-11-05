"use client";

import { useState } from "react";
import { ArrowDownUp, Plus } from "lucide-react";
import { Button, Card, Dialog, Field, Input, Select, StatusBadge, Textarea } from "@/components/ui";
import { DialogActions } from "@/components/ui";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { designations, leaveTypes, roles } from "@/data/mock-data";
import { PageHeader } from "./PageHeader";
import { DataTableFooter, Toolbar } from "./TableUtils";
import { RowActions } from "./RowActions";

function Th({ children }: { children?: React.ReactNode }) {
  return <TableHead><span className="th-content">{children}{children && <ArrowDownUp size={12} />}</span></TableHead>;
}

const PERMISSION_GROUPS = [
  ["Employee", "Read", "Create", "Update", "Delete"],
  ["Role", "Read", "Manage"],
  ["Designation", "Manage"],
  ["Leave type", "Manage"],
  ["Leave", "Read all", "Approve"],
  ["Candidate", "Read", "Manage"],
  ["Organization", "Manage"],
  ["System", "Admin"],
];

function Permissions() {
  return (
    <div className="permissions">
      <div className="permissions-head">
        <div><strong>Permissions</strong><span>Choose what this role can access.</span></div>
        <label className="check-label"><Checkbox /> * All permissions</label>
      </div>
      {PERMISSION_GROUPS.map(([group, ...items]) => (
        <div className="permission-row" key={group}>
          <strong>{group}</strong>
          <div>{items.map((item) => <label className="check-label" key={item}><Checkbox />{item}</label>)}</div>
        </div>
      ))}
    </div>
  );
}

type ResourceType = "designations" | "leave-types" | "roles";

const CONFIG = {
  designations: { title: "Designations", description: "Define job titles used across your organization.", singular: "designation", data: designations },
  "leave-types": { title: "Leave types", description: "Configure time-off categories and annual allocations.", singular: "leave type", data: leaveTypes },
  roles: { title: "Roles", description: "Manage roles and permission sets for your workforce.", singular: "role", data: roles },
};

export function ResourceTable({ type }: { type: ResourceType }) {
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState(false);
  const config = CONFIG[type];
  const rows = config.data.filter((r) => JSON.stringify(r).toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <PageHeader
        title={config.title}
        description={config.description}
        actions={<Button onClick={() => setDialog(true)}><Plus size={16} />Add {config.singular}</Button>}
      />
      <Card className="table-card">
        <Toolbar search={search} setSearch={setSearch}>
          <Select><option>All statuses</option><option>Active</option><option>Inactive</option></Select>
        </Toolbar>
        <Table>
          <TableHeader>
            <TableRow>
              <Th>ID</Th>
              <Th>{type === "roles" ? "Role name" : type === "leave-types" ? "Name" : "Title"}</Th>
              <Th>Description</Th>
              <Th>{type === "leave-types" ? "Annual allocation" : type === "roles" ? "Users / Permissions" : "Employees"}</Th>
              <Th>Status</Th>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row: any) => (
              <TableRow key={row.id}>
                <TableCell className="mono">{row.id}</TableCell>
                <TableCell><strong>{row.title ?? row.name}</strong></TableCell>
                <TableCell className="muted-cell">{row.description}</TableCell>
                <TableCell>
                  {type === "leave-types" ? `${row.allocation} days`
                    : type === "roles" ? `${row.users} users · ${row.permissions} permissions`
                    : row.employees}
                </TableCell>
                <TableCell><StatusBadge status={row.status} /></TableCell>
                <TableCell><RowActions /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <DataTableFooter count={rows.length} total={rows.length} />
      </Card>

      <Dialog open={dialog} onClose={() => setDialog(false)} title={`Add ${config.singular}`} description={`Create a new ${config.singular} for your organization.`} wide={type === "roles"}>
        <form className="form-stack" onSubmit={(e) => { e.preventDefault(); setDialog(false); }}>
          <div className="form-grid">
            <Field label={`${config.singular[0].toUpperCase() + config.singular.slice(1)} ID`}>
              <Input placeholder={type === "roles" ? "ROL-005" : type === "leave-types" ? "LT-005" : "DES-005"} />
            </Field>
            <Field label="Status"><Select><option>Active</option><option>Inactive</option></Select></Field>
            <div className="span-2">
              <Field label={type === "roles" ? "Role name" : type === "leave-types" ? "Name" : "Title"}><Input /></Field>
            </div>
            <div className="span-2"><Field label="Description"><Textarea /></Field></div>
            {type === "leave-types" && <Field label="Annual allocation" hint="0–366 days"><Input type="number" min="0" max="366" /></Field>}
          </div>
          {type === "roles" && <Permissions />}
          <DialogActions onClose={() => setDialog(false)} action={`Add ${config.singular}`} />
        </form>
      </Dialog>
    </>
  );
}
