"use client";

import { ArrowDownUp } from "lucide-react";
import { Avatar, Badge, Button, StatusBadge } from "@/components/ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { LeaveRequest } from "@/data/mock-data";
import { RowActions } from "./RowActions";

function Th({ children }: { children?: React.ReactNode }) {
  return (
    <TableHead>
      <span className="th-content">{children}{children && <ArrowDownUp size={12} />}</span>
    </TableHead>
  );
}

export function LeaveTable({ rows, compact = false, actions = false }: {
  rows: LeaveRequest[];
  compact?: boolean;
  actions?: boolean;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <Th>Employee</Th><Th>Leave type</Th><Th>Dates</Th><Th>Days</Th>
          {!compact && <Th>Reason</Th>}
          <Th>Status</Th>
          {actions && <TableHead />}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.id}>
            <TableCell>
              <div className="person-cell">
                <Avatar initials={r.initials} size="sm" />
                <div><strong>{r.employee}</strong><span>{r.id}</span></div>
              </div>
            </TableCell>
            <TableCell>{r.type}</TableCell>
            <TableCell>{r.startDate} <span className="date-arrow">→</span> {r.endDate}</TableCell>
            <TableCell>{r.days}</TableCell>
            {!compact && <TableCell className="reason-cell">{r.reason}</TableCell>}
            <TableCell><StatusBadge status={r.status} /></TableCell>
            {actions && (
              <TableCell>
                <div className="row-actions">
                  {r.status === "Pending" && (
                    <><Button variant="outline" size="sm">Reject</Button><Button size="sm">Approve</Button></>
                  )}
                  <RowActions deleteLabel="Cancel request" />
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
