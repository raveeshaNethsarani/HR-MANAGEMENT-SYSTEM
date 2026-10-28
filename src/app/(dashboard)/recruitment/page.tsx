"use client";

import { useState } from "react";
import { ArrowDownUp, Columns3, List, Plus, Search } from "lucide-react";
import { Avatar, Button, Card, Dialog, Field, Input, Select, StatusBadge, Textarea } from "@/components/ui";
import { DialogActions } from "@/components/ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { candidates } from "@/data/mock-data";
import { PageHeader } from "@/app/components/PageHeader";
import { DataTableFooter } from "@/app/components/TableUtils";
import { RowActions } from "@/app/components/RowActions";

const COLUMNS = ["Applied","Screening","Interview","Technical Test","Offer","Hired","Rejected","On Hold"];

function Th({ children }: { children?: React.ReactNode }) {
  return <TableHead><span className="th-content">{children}{children && <ArrowDownUp size={12} />}</span></TableHead>;
}

export default function RecruitmentPage() {
  const [view, setView] = useState<"board" | "table">("board");
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState(false);
  const filtered = candidates.filter((c) => (c.name + c.role).toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <PageHeader
        title="Recruitment"
        description="Track candidates through every stage of your hiring pipeline."
        actions={
          <>
            <div className="view-toggle">
              <Button size="icon" variant={view === "board" ? "default" : "ghost"} onClick={() => setView("board")}><Columns3 size={16} /></Button>
              <Button size="icon" variant={view === "table" ? "default" : "ghost"} onClick={() => setView("table")}><List size={16} /></Button>
            </div>
            <Button onClick={() => setDialog(true)}><Plus size={16} />Add candidate</Button>
          </>
        }
      />
      <div className="recruit-toolbar">
        <div className="search-box"><Search size={16} /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search candidates..." /></div>
        <Select><option>All roles</option><option>Engineering</option><option>Design</option></Select>
      </div>

      {view === "board" ? (
        <div className="kanban">
          {COLUMNS.map((status) => {
            const items = filtered.filter((c) => c.status === status);
            return (
              <div className="kanban-column" key={status}>
                <div className="kanban-head"><span>{status}</span><span className="badge badge-outline">{items.length}</span></div>
                <div className="kanban-stack">
                  {items.map((c) => (
                    <Card className="candidate-card" key={c.id}>
                      <div className="candidate-top">
                        <Avatar initials={c.name.split(" ").map((n) => n[0]).join("")} />
                        <RowActions />
                      </div>
                      <strong>{c.name}</strong>
                      <span className="candidate-role">{c.role}</span>
                      <div className="skill-row">{c.skills.map((s) => <span className="badge badge-outline" key={s}>{s}</span>)}</div>
                      <div className="candidate-foot"><span>{c.source}</span><span>{c.applied}</span></div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card className="table-card">
          <Table>
            <TableHeader>
              <TableRow><Th>Candidate</Th><Th>Position</Th><Th>Experience</Th><Th>Source</Th><Th>Skills</Th><Th>Status</Th><TableHead /></TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="person-cell">
                      <Avatar initials={c.name.split(" ").map((n) => n[0]).join("")} size="sm" />
                      <div><strong>{c.name}</strong><span>{c.email}</span></div>
                    </div>
                  </TableCell>
                  <TableCell>{c.role}</TableCell>
                  <TableCell>{c.experience} years</TableCell>
                  <TableCell>{c.source}</TableCell>
                  <TableCell><div className="skill-row">{c.skills.map((s) => <span className="badge badge-outline" key={s}>{s}</span>)}</div></TableCell>
                  <TableCell><StatusBadge status={c.status} /></TableCell>
                  <TableCell><RowActions /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <DataTableFooter count={filtered.length} total={24} />
        </Card>
      )}

      <Dialog open={dialog} onClose={() => setDialog(false)} title="Add candidate" description="Add a candidate to your recruitment pipeline." wide>
        <form onSubmit={(e) => { e.preventDefault(); setDialog(false); }}>
          <div className="form-grid">
            <Field label="First name"><Input /></Field>
            <Field label="Last name"><Input /></Field>
            <Field label="Email"><Input type="email" /></Field>
            <Field label="Phone"><Input /></Field>
            <Field label="Current position"><Input /></Field>
            <Field label="Experience (years)"><Input type="number" min="0" /></Field>
            <Field label="Source">
              <Select>{["LinkedIn","Indeed","Referral","Company Website","Email","Other"].map((s) => <option key={s}>{s}</option>)}</Select>
            </Field>
            <Field label="Status">
              <Select>{COLUMNS.map((s) => <option key={s}>{s}</option>)}</Select>
            </Field>
            <div className="span-2"><Field label="Notes"><Textarea placeholder="Interview notes or additional context" /></Field></div>
          </div>
          <DialogActions onClose={() => setDialog(false)} action="Add candidate" />
        </form>
      </Dialog>
    </>
  );
}
