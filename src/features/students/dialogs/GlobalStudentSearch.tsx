import { useEffect, useMemo, useState } from "react";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { studentRecords } from "../data";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function GlobalStudentSearch({ open, onOpenChange }: Props) {
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  useEffect(() => { if (!open) setQ(""); }, [open]);

  const results = useMemo(() => {
    if (!q) return studentRecords.slice(0, 8);
    const s = q.toLowerCase();
    return studentRecords.filter((r) =>
      r.name.toLowerCase().includes(s) ||
      r.rollNo.includes(s) ||
      r.admissionNo.toLowerCase().includes(s) ||
      r.guardian.toLowerCase().includes(s) ||
      r.phone.includes(s) ||
      r.email.toLowerCase().includes(s),
    ).slice(0, 20);
  }, [q]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search by name, roll, admission, phone, email, guardian…" value={q} onValueChange={setQ} />
      <CommandList>
        <CommandEmpty>No students found.</CommandEmpty>
        <CommandGroup heading={q ? `${results.length} results` : "Recent students"}>
          {results.map((r) => (
            <CommandItem
              key={r.id}
              value={`${r.name} ${r.admissionNo} ${r.rollNo} ${r.email} ${r.guardian} ${r.phone}`}
              onSelect={() => { navigate(`/students/${r.id}`); onOpenChange(false); }}
              className="gap-3"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={r.photo} alt="" />
                <AvatarFallback>{r.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{r.name}</p>
                <p className="truncate text-xs text-muted-foreground">{r.admissionNo} · Roll {r.rollNo} · Grade {r.className}-{r.section}</p>
              </div>
              <span className="text-xs text-muted-foreground">{r.status}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
