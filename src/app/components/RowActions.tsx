"use client";

import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function RowActions({ onDelete, deleteLabel = "Delete" }: { onDelete?: () => void; deleteLabel?: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon"><MoreHorizontal size={16} /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem><Eye size={15} />View</DropdownMenuItem>
        <DropdownMenuItem><Pencil size={15} />Edit</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={onDelete}>
          <Trash2 size={15} />{deleteLabel}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
