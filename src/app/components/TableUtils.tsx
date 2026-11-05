"use client";

import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

export function DataTableFooter({ count, total }: { count: number; total: number }) {
  return (
    <div className="table-footer">
      <span>Showing <strong>1–{count}</strong> of <strong>{total}</strong></span>
      <Pagination className="mx-0 w-auto">
        <PaginationContent>
          <PaginationItem><PaginationPrevious className="pointer-events-none opacity-50" /></PaginationItem>
          <PaginationItem><PaginationLink isActive>1</PaginationLink></PaginationItem>
          <PaginationItem><PaginationLink>2</PaginationLink></PaginationItem>
          <PaginationItem><PaginationEllipsis /></PaginationItem>
          <PaginationItem><PaginationNext /></PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

export function Toolbar({ search, setSearch, children, action }: {
  search: string;
  setSearch: (v: string) => void;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <div className="search-box">
          <Search size={16} />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." />
        </div>
        {children}
      </div>
      {action}
    </div>
  );
}
