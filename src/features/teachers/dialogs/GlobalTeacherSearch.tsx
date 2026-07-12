import { useEffect, useMemo, useState } from "react";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import type { TeacherRecord } from "../data";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  rows: TeacherRecord[];
}

export function GlobalTeacherSearch({ open, onOpenChange, rows }: Props) {
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  useEffect(() => { if (!open) setQ(""); }, [open]);

  const results = useMemo(() => {
    if (!q) return rows.slice(0, 8);
    const s = q.toLowerCase();
    return rows.filter((r) =>
      r.name.toLowerCase().includes(s) ||
      r.employeeId.toLowerCase().includes(s) ||
      r.department.toLowerCase().includes(s) ||
      r.designation.toLowerCase().includes(s) ||
      r.subjects.some((sub) => sub.toLowerCase().includes(s)) ||
      r.email.toLowerCase().includes(s) ||
      r.phone.includes(s),
    ).slice(0, 20);
  }, [q, rows]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search by name, employee ID, department, subject, email, phone…" value={q} onValueChange={setQ} />
      <CommandList>
        <CommandEmpty>No staff found.</CommandEmpty>
        <CommandGroup heading={q ? `${results.length} results` : "Recent staff"}>
          {results.map((r) => (
            <CommandItem
              key={r.id}
              value={`${r.name} ${r.employeeId} ${r.department} ${r.designation} ${r.email} ${r.phone} ${r.subjects.join(" ")}`}
              onSelect={() => { navigate(`/teachers/${r.id}`); onOpenChange(false); }}
              className="gap-3"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={r.photo} alt="" />
                <AvatarFallback>{r.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{r.name}</p>
                <p className="truncate text-xs text-muted-foreground">{r.employeeId} · {r.designation} · {r.department}</p>
              </div>
              <span className="text-xs text-muted-foreground">{r.status}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
